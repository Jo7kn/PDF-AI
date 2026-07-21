// app/actions/tags.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function getTags() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) return { error: error.message }
  return { success: true, tags: data }
}

// Esportata cosi' saved-items.ts la riusa invece di duplicare la stessa
// logica get-or-create per i tag sui saved item.
export async function getOrCreateTag(supabase: any, userId: string, name: string): Promise<string | null> {
  const trimmed = name.trim().toLowerCase()
  if (!trimmed || trimmed.length > 40) return null

  const { data: existing } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', userId)
    .eq('name', trimmed)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: trimmed })
    .select('id')
    .single()

  if (error) return null
  return created.id
}

export async function addTagToDocument(documentId: string, tagName: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: document } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (!document) return { error: 'Documento non trovato' }

  const tagId = await getOrCreateTag(supabase, user.id, tagName)
  if (!tagId) return { error: 'Nome tag non valido' }

  const { error } = await supabase
    .from('document_tags')
    .insert({ document_id: documentId, tag_id: tagId })

  if (error) {
    if (error.code === '23505') return { error: 'Tag già presente su questo documento' }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeTagFromDocument(documentId: string, tagId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: document } = await supabase
    .from('documents')
    .select('id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (!document) return { error: 'Documento non trovato' }

  const { error } = await supabase
    .from('document_tags')
    .delete()
    .eq('document_id', documentId)
    .eq('tag_id', tagId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
