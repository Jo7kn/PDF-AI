// app/actions/messages.ts
'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { resolveDocumentAccess } from '@/lib/document-access'

// Public entry point: role is always 'user', never a caller-supplied value — a shared
// collaborator with 'chat' permission could otherwise pass role: 'assistant' here and
// inject a fabricated AI reply into the document owner's chat thread. Internal code that
// legitimately needs to write an 'assistant' message uses lib/messages-internal.ts
// directly instead (see app/actions/processing.ts), which isn't a public Server Action.
export async function sendUserMessage(documentId: string, content: string) {
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
      .insert({ document_id: documentId, role: 'user', content })
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