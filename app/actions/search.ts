// app/actions/search.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { generateEmbedding, generateChatCompletion } from '@/lib/nvidia/nim'

export interface SearchResult {
  id: string
  document_id: string
  document_name: string
  content: string
  page_number: number | null
  similarity: number
}

export interface SourceInfo {
  documentId: string
  documentName: string
  pageNumber: number | null
  similarity: number
}

// Tipi di ritorno con tutti i campi opzionali (tranne il discriminante
// implicito "success"/"error"): evita che TS inf 3-4 varianti diverse di
// unione da rami di return diversi, dove accedere a un campo assente in
// una sola variante rompe il type-check nel chiamante anche se a runtime
// è perfettamente valido.
export interface SearchDocumentsResponse {
  error?: string
  success?: boolean
  results?: SearchResult[]
}

export interface AskAcrossDocumentsResponse {
  error?: string
  success?: boolean
  answer?: string
  sources?: SourceInfo[]
}

/**
 * Ricerca semantica pura: restituisce i chunk più simili alla query,
 * senza sintesi. Utile per un elenco di risultati "grezzi" tipo motore
 * di ricerca (documento + estratto + pagina).
 */
export async function searchDocuments(query: string, matchCount = 8): Promise<SearchDocumentsResponse> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  if (!query || query.trim().length < 3) {
    return { error: 'Scrivi almeno 3 caratteri per cercare' }
  }

  const supabase = await createClient()

  try {
    const queryEmbedding = await generateEmbedding(query, 'query')

    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter_user_id: user.id,
    })

    if (error) return { error: error.message }
    return { success: true, results: (data || []) as SearchResult[] }
  } catch (err) {
    console.error('❌ Errore ricerca semantica:', err)
    return { error: 'Ricerca fallita, riprova' }
  }
}

/**
 * Ricerca + sintesi: cerca i chunk più rilevanti su TUTTI i documenti
 * dell'utente, poi chiede al modello di rispondere usando solo quelle
 * fonti, citandole esplicitamente. È la versione "chiedi a tutti i tuoi
 * documenti insieme" invece di doverne aprire uno alla volta.
 */
export async function askAcrossDocuments(query: string): Promise<AskAcrossDocumentsResponse> {
  const searchResult = await searchDocuments(query, 6)
  if (searchResult.error) return searchResult

  const results = searchResult.results || []
  if (results.length === 0) {
    return {
      success: true,
      answer: 'Non ho trovato nulla di rilevante nei tuoi documenti per questa domanda.',
      sources: [],
    }
  }

  const context = results
    .map((r, i) => `[Fonte ${i + 1} - ${r.document_name}${r.page_number ? `, pag. ${r.page_number}` : ''}]\n${r.content}`)
    .join('\n\n')

  const answer = await generateChatCompletion(
    [
      {
        role: 'user',
        content:
          `Rispondi alla domanda usando SOLO le informazioni nelle fonti fornite nel contesto. ` +
          `Se la risposta non si trova nelle fonti, dillo chiaramente invece di inventare. ` +
          `Cita sempre tra parentesi quadre il numero della fonte usata, es. [Fonte 1].\n\n` +
          `Domanda: ${query}`,
      },
    ],
    context
  )

  return {
    success: true,
    answer,
    sources: results.map(r => ({
      documentId: r.document_id,
      documentName: r.document_name,
      pageNumber: r.page_number,
      similarity: r.similarity,
    })),
  }
}