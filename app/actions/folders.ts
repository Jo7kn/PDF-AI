// app/actions/folders.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export async function createFolder(name: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Il nome della cartella non può essere vuoto' }
  if (trimmed.length > 100) return { error: 'Nome troppo lungo' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('folders')
    .insert({ user_id: user.id, name: trimmed })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, folder: data }
}

export async function getFolders() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) return { error: error.message }
  return { success: true, folders: data }
}

export async function renameFolder(folderId: string, name: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Il nome della cartella non può essere vuoto' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('folders')
    .update({ name: trimmed })
    .eq('id', folderId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteFolder(folderId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  // I documenti dentro NON vengono cancellati: la FK folder_id ha
  // ON DELETE SET NULL, quindi tornano semplicemente "senza cartella"
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
