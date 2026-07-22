// lib/messages-internal.ts
//
// Not a 'use server' file on purpose: every export in a 'use server' module is a public,
// callable Server Action regardless of whether any client component references it — so
// inserting an 'assistant' message needs to live outside that boundary. Only import this
// from server code that has already verified the caller is allowed to write to the
// document (see app/actions/processing.ts chatWithDocument, which checks
// resolveDocumentAccess before calling insertMessage).

import { createServiceClient } from '@/lib/supabase/service'

export async function insertMessage(documentId: string, role: 'user' | 'assistant', content: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ document_id: documentId, role, content })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, message: data }
}
