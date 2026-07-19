// app/actions/messages.ts
'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { resolveDocumentAccess } from '@/lib/document-access'

export async function createMessage(documentId: string, role: 'user' | 'assistant', content: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const access = await resolveDocumentAccess(documentId, user.id)
  if (!access) return { error: 'Unauthorized' }
  if (!access.isOwner && access.permission !== 'chat') {
    return { error: 'Non hai il permesso di scrivere in questo documento condiviso' }
  }

  try {
    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('messages')
      .insert({ document_id: documentId, role, content })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath(`/document/${documentId}`)
    return { success: true, message: data }
  } catch (error) {
    return { error: 'Failed to create message' }
  }
}

export async function getMessages(documentId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const access = await resolveDocumentAccess(documentId, user.id)
  if (!access) return { error: 'Unauthorized' }

  try {
    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('messages')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true })

    if (error) return { error: error.message }
    return { success: true, messages: data }
  } catch (error) {
    return { error: 'Failed to fetch messages' }
  }
}