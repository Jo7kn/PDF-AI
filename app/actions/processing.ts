// app/actions/processing.ts
'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { parseDocumentWithNim, extractDeadlinesFromDocument, generateChatCompletion, generateEmbedding, runWithConcurrency } from '@/lib/nvidia/nim'
import { chunkDocumentText } from '@/lib/chunking'
import { insertMessage } from '@/lib/messages-internal'
import { getCurrentUser } from './auth'
import { resolveDocumentAccess } from '@/lib/document-access'

type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

async function setStatus(
  supabase: ReturnType<typeof createServiceClient>,
  documentId: string,
  status: ProcessingStatus,
  errorMessage?: string | null
) {
  await supabase
    .from('documents')
    .update({
      processing_status: status,
      error_message: errorMessage ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
}

// ============================================
// PROCESS DOCUMENT
// ============================================
// Gira in background (vedi documents.ts, dentro after()), quindi NON ha
// accesso alla sessione utente della richiesta originale. Per questo usa
// un client service-role invece del client autenticato via cookie: le
// chiamate a updateDocument() (che richiede getCurrentUser()) qui
// fallirebbero silenziosamente con "Unauthorized".
export async function processDocument(documentId: string, fileUrl: string) {
  const supabase = createServiceClient()

  // No user session available here (see comment above — this runs in a background
  // after() callback), so ownership can't be checked via getCurrentUser(). Instead,
  // confirm fileUrl actually belongs to this documentId before doing any work: without
  // this, a caller who knows a documentId could point it at an arbitrary storage path
  // and overwrite that document's parsed_text/summary with unrelated content.
  const { data: ownerCheckRow, error: ownerCheckError } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', documentId)
    .single()

  if (ownerCheckError || !ownerCheckRow || ownerCheckRow.file_url !== fileUrl) {
    return { error: 'Document not found or file URL mismatch' }
  }

  try {
    console.log(`📄 Processing document ${documentId}...`)
    await setStatus(supabase, documentId, 'processing')

    const { text, totalPages } = await parseDocumentWithNim(fileUrl)
    console.log(`✅ Extracted ${text.length} characters, ${totalPages} pages`)

    const deadlines = await extractDeadlinesFromDocument(text)
    console.log(`✅ Found ${deadlines.length} deadlines`)

    const summary = await generateChatCompletion(
      [{ role: 'user', content: 'Please provide a concise summary of this document in 2-3 sentences.' }],
      text
    )
    console.log(`✅ Generated summary: ${summary.substring(0, 100)}...`)

    const { data: docRow, error: docRowError } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single()

    if (docRowError || !docRow) {
      throw new Error(`Documento ${documentId} non trovato durante l'aggiornamento`)
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        parsed_text: text,
        total_pages: totalPages,
        deadlines_json: deadlines,
        summary,
        processing_status: 'completed',
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Salvataggio risultati fallito: ${updateError.message}`)
    }

    // ------------------------------------------------------------------
    // Indicizzazione per la ricerca semantica: chunking + embedding.
    // Isolato in un try/catch proprio: se questo passaggio fallisce
    // (es. NVIDIA_EMBED_API_KEY assente o momentaneamente giù), il
    // documento deve comunque risultare "completed" — riassunto, scadenze
    // e chat funzionano lo stesso, semplicemente non sarà cercabile
    // insieme agli altri finché non viene rielaborato.
    // ------------------------------------------------------------------
    try {
      // Pulizia preventiva: se questo è un retry (vedi handleRetry in UI),
      // evita di duplicare i chunk della volta precedente
      await supabase.from('document_chunks').delete().eq('document_id', documentId)

      const chunks = chunkDocumentText(text)
      if (chunks.length > 0) {
        const rows = await runWithConcurrency(chunks, 3, async (chunk) => {
          const embedding = await generateEmbedding(chunk.content, 'passage')
          return {
            document_id: documentId,
            user_id: docRow.user_id,
            chunk_index: chunk.index,
            content: chunk.content,
            page_number: chunk.pageNumber,
            embedding,
          }
        })

        const { error: chunksError } = await supabase.from('document_chunks').insert(rows)
        if (chunksError) {
          console.error('⚠️ Errore salvataggio chunk per ricerca semantica:', chunksError)
        } else {
          console.log(`✅ Indicizzati ${rows.length} chunk per la ricerca semantica`)
        }
      }
    } catch (indexError) {
      console.error('⚠️ Indicizzazione semantica fallita (il documento resta comunque utilizzabile):', indexError)
    }

    // Aggiorna la quota pagine dell'utente
    const { data: userRow } = await supabase
      .from('users')
      .select('total_pages_used')
      .eq('id', docRow.user_id)
      .single()

    if (userRow) {
      await supabase
        .from('users')
        .update({ total_pages_used: (userRow.total_pages_used || 0) + totalPages })
        .eq('id', docRow.user_id)
    }

    console.log(`✅ Document ${documentId} processed successfully`)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Error processing document:', error)
    await setStatus(supabase, documentId, 'failed', message)
    return { error: 'Failed to process document: ' + message }
  }
}

// ============================================
// CHAT WITH DOCUMENT
// ============================================
// Questa gira nel contesto della richiesta utente (bottone "invia" in UI).
export async function chatWithDocument(documentId: string, userMessage: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { error: 'Unauthorized' }

    const access = await resolveDocumentAccess(documentId, user.id)
    if (!access) return { error: 'Document not found' }
    if (!access.isOwner && access.permission !== 'chat') {
      return { error: 'Non hai il permesso di scrivere in questo documento condiviso' }
    }

    const document = access.document

    if (document.processing_status === 'processing' || document.processing_status === 'pending') {
      return { error: 'Il documento è ancora in elaborazione, riprova tra qualche istante.' }
    }

    let documentText = document.parsed_text

    if (!documentText) {
      console.log('📄 Document not processed yet, processing now...')
      const result = await processDocument(documentId, document.file_url)
      if (result.error) {
        return { error: 'Failed to process document: ' + result.error }
      }

      const refreshed = await resolveDocumentAccess(documentId, user.id)
      documentText = refreshed?.document.parsed_text || null
    }

    await insertMessage(documentId, 'user', userMessage)

    const aiResponse = await generateChatCompletion(
      [{ role: 'user', content: userMessage }],
      documentText || undefined
    )

    await insertMessage(documentId, 'assistant', aiResponse)

    return { success: true, response: aiResponse }
  } catch (error) {
    console.error('❌ Error in chat:', error)
    return { error: 'Failed to generate response: ' + (error instanceof Error ? error.message : String(error)) }
  }
}