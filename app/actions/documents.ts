// app/actions/documents.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { runInBackground } from '@/lib/after'
import { Document } from '@/lib/types'
import { getCurrentUser, ensureUserProfile } from './auth'
import { processDocument } from './processing'
import { ALLOWED_FILE_TYPES, DEFAULT_TIER, MAX_FILE_SIZE_BYTES, DEFAULT_MAX_FILE_SIZE_BYTES } from '@/lib/constants'
import { getTierByName } from '@/lib/pricing'
import { resolveDocumentAccess } from '@/lib/document-access'

/**
 * Estrae bucket e path da un public URL di Supabase Storage
 * (es. https://xxx.supabase.co/storage/v1/object/public/documents/uid/123.pdf)
 */
function extractStoragePath(publicUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split('/')
    const publicIndex = parts.indexOf('public')
    if (publicIndex === -1) return null
    const bucket = parts[publicIndex + 1]
    const path = parts.slice(publicIndex + 2).join('/')
    if (!bucket || !path) return null
    return { bucket, path }
  } catch {
    return null
  }
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  await ensureUserProfile(supabase, user)

  const file = formData.get('file') as File
  const name = formData.get('name') as string

  if (!file || !name) {
    return { error: 'Missing required fields' }
  }

  if (name.length > 255) {
    return { error: 'Il nome del documento è troppo lungo' }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: `Tipo di file non supportato: ${file.type || 'sconosciuto'}. Sono accettati solo PDF.` }
  }

  // ------------------------------------------------------------------
  // Controllo quota PRIMA di caricare qualsiasi cosa nello storage
  // ------------------------------------------------------------------
  const { data: userRow, error: userFetchError } = await supabase
    .from('users')
    .select('tier, total_pages_used, active_projects')
    .eq('id', user.id)
    .single()

  if (userFetchError || !userRow) {
    return { error: 'Impossibile verificare la tua quota. Riprova.' }
  }

  const tier = userRow.tier || DEFAULT_TIER
  const pricingTier = getTierByName(tier) || getTierByName(DEFAULT_TIER)!
  const maxFileSize = MAX_FILE_SIZE_BYTES[tier.toLowerCase()] ?? DEFAULT_MAX_FILE_SIZE_BYTES

  if (file.size > maxFileSize) {
    return {
      error: `Il file supera il limite di ${Math.round(maxFileSize / (1024 * 1024))}MB per il piano ${pricingTier.name}.`,
    }
  }

  if (Number.isFinite(pricingTier.limits.activeProjects) && userRow.active_projects >= pricingTier.limits.activeProjects) {
    return {
      error: `Hai raggiunto il limite di ${pricingTier.limits.activeProjects} documenti per il piano ${pricingTier.name}. Elimina un documento o passa a un piano superiore.`,
    }
  }

  if (Number.isFinite(pricingTier.limits.totalPages) && userRow.total_pages_used >= pricingTier.limits.totalPages) {
    return {
      error: `Hai raggiunto il limite di ${pricingTier.limits.totalPages} pagine elaborate per il piano ${pricingTier.name}. Passa a un piano superiore per continuare.`,
    }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      return { error: uploadError.message }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name,
        file_url: publicUrl,
        total_pages: 0,
        processing_status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      // L'insert nel DB è fallito: ripulisci il file appena caricato
      // per non lasciare storage orfano
      await supabase.storage.from('documents').remove([fileName])
      return { error: dbError.message }
    }

    // Conta subito il nuovo documento nella quota, indipendentemente
    // dall'esito dell'elaborazione (che può ancora fallire).
    // Uso il client service-role: se le RLS su "users" permettono solo
    // SELECT sulla propria riga, un update con il client scoped-utente
    // fallirebbe silenziosamente e la quota non si muoverebbe mai.
    const serviceClient = createServiceClient()
    await serviceClient
      .from('users')
      .update({ active_projects: userRow.active_projects + 1 })
      .eq('id', user.id)

    // ------------------------------------------------------------------
    // Elaborazione in background, AFFIDABILE su qualunque versione di Next.
    //
    // runInBackground usa after()/unstable_after() se disponibili (il job
    // continua dopo l'invio della risposta); altrimenti esegue e ASPETTA
    // il job prima di rispondere, così su Next < 14.3 (il tuo caso, 14.2.5)
    // il lavoro non viene mai troncato a metà — semplicemente la risposta
    // sarà un po' più lenta.
    // ------------------------------------------------------------------
    if (document) {
      await runInBackground(async () => {
        try {
          await processDocument(document.id, publicUrl)
        } catch (error) {
          console.error('Background processing error:', error)
        }
      })
    }

    revalidatePath('/dashboard')
    return { success: true, document }
  } catch (error) {
    console.error('Error creating document:', error)
    return { error: 'Failed to create document' }
  }
}

export async function updateDocument(documentId: string, updates: Partial<Document>) {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  try {
    const { data, error } = await supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('user_id', currentUser.id)
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    revalidatePath(`/document/${documentId}`)
    return { success: true, document: data }
  } catch (error) {
    return { error: 'Failed to update document' }
  }
}

export interface GetDocumentsFilters {
  // undefined = tutte le cartelle, null = solo documenti senza cartella,
  // stringa = quella cartella specifica
  folderId?: string | null
  tagId?: string
  favoritesOnly?: boolean
  search?: string
  sortBy?: 'created_at' | 'name' | 'total_pages'
  sortDir?: 'asc' | 'desc'
}

export async function getDocuments(userId?: string, filters: GetDocumentsFilters = {}) {
  const supabase = await createClient()
  const currentUser = userId ? { id: userId } : await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', currentUser.id)

    if (filters.folderId === null) {
      query = query.is('folder_id', null)
    } else if (filters.folderId) {
      query = query.eq('folder_id', filters.folderId)
    }

    if (filters.favoritesOnly) {
      query = query.eq('is_favorite', true)
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const sortBy = filters.sortBy || 'created_at'
    const sortDir = filters.sortDir || 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    const { data, error } = await query
    if (error) return { error: error.message }

    let documents = data || []

    // Tag per documento: due query separate invece di un join annidato
    // (stesso motivo delle condivisioni — evitare sorprese di relationship
    // cache di PostgREST), unite in JS.
    const docIds = documents.map(d => d.id)
    let tagsByDocId: Record<string, { id: string; name: string }[]> = {}

    if (docIds.length > 0) {
      const { data: docTags } = await supabase
        .from('document_tags')
        .select('document_id, tag_id')
        .in('document_id', docIds)

      if (docTags && docTags.length > 0) {
        const tagIds = [...new Set(docTags.map((dt: any) => dt.tag_id))]
        const { data: tagRows } = await supabase
          .from('tags')
          .select('id, name')
          .in('id', tagIds)

        const tagById = Object.fromEntries((tagRows || []).map((t: any) => [t.id, t]))
        tagsByDocId = docTags.reduce((acc: any, dt: any) => {
          acc[dt.document_id] = acc[dt.document_id] || []
          if (tagById[dt.tag_id]) acc[dt.document_id].push(tagById[dt.tag_id])
          return acc
        }, {})

        if (filters.tagId) {
          const matchingDocIds = new Set(
            docTags.filter((dt: any) => dt.tag_id === filters.tagId).map((dt: any) => dt.document_id)
          )
          documents = documents.filter(d => matchingDocIds.has(d.id))
        }
      } else if (filters.tagId) {
        // Nessun document_tags esistente affatto: con un filtro tag attivo,
        // il risultato è vuoto per definizione
        documents = []
      }
    }

    const documentsWithTags = documents.map(d => ({ ...d, tags: tagsByDocId[d.id] || [] }))

    return { success: true, documents: documentsWithTags }
  } catch (error) {
    return { error: 'Failed to fetch documents' }
  }
}

export async function toggleFavorite(documentId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('is_favorite')
    .eq('id', documentId)
    .eq('user_id', currentUser.id)
    .single()

  if (fetchError || !document) return { error: 'Document not found' }

  const { error } = await supabase
    .from('documents')
    .update({ is_favorite: !document.is_favorite })
    .eq('id', documentId)
    .eq('user_id', currentUser.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, isFavorite: !document.is_favorite }
}

export async function moveDocumentToFolder(documentId: string, folderId: string | null) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('documents')
    .update({ folder_id: folderId })
    .eq('id', documentId)
    .eq('user_id', currentUser.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getDocument(documentId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  try {
    const access = await resolveDocumentAccess(documentId, currentUser.id)
    if (!access) return { error: 'Document not found' }

    return {
      success: true,
      document: {
        ...access.document,
        isOwner: access.isOwner,
        sharePermission: access.permission,
      },
    }
  } catch (error) {
    return { error: 'Failed to fetch document' }
  }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  if (!currentUser?.id) return { error: 'Unauthorized' }

  try {
    // Recupera il documento prima di cancellarlo: serve per pulire lo
    // storage e per scalare correttamente la quota pagine
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_url, total_pages')
      .eq('id', documentId)
      .eq('user_id', currentUser.id)
      .single()

    if (fetchError || !document) {
      return { error: 'Document not found' }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', currentUser.id)

    if (error) return { error: error.message }

    // Rimuovi il file dal bucket (best-effort: non far fallire la delete
    // se questo va storto, ma logga per poterlo ripulire manualmente)
    const storagePath = extractStoragePath(document.file_url)
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(storagePath.bucket)
        .remove([storagePath.path])
      if (storageError) {
        console.error('Errore rimozione file dallo storage:', storageError)
      }
    }

    // Restituisci alla quota utente il documento e le pagine liberate
    // (client service-role per lo stesso motivo di sopra: non dipendere
    // dalle RLS per un'operazione di sistema, non dell'utente)
    const serviceClient = createServiceClient()
    const { data: userRow } = await serviceClient
      .from('users')
      .select('active_projects, total_pages_used')
      .eq('id', currentUser.id)
      .single()

    if (userRow) {
      await serviceClient
        .from('users')
        .update({
          active_projects: Math.max(0, (userRow.active_projects || 0) - 1),
          total_pages_used: Math.max(0, (userRow.total_pages_used || 0) - (document.total_pages || 0)),
        })
        .eq('id', currentUser.id)
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete document' }
  }
}