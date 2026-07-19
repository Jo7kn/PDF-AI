// lib/document-access.ts
import { createServiceClient } from '@/lib/supabase/service'

export type DocumentAccess = {
  document: any
  isOwner: boolean
  permission: 'view' | 'chat'
}

/**
 * Punto unico per capire se un utente può accedere a un documento: o ne è
 * il proprietario, o gli è stato condiviso. Usa il client service-role
 * perché deve poter leggere un documento che NON appartiene al chiamante
 * (il caso della condivisione) — cosa che il client scoped-utente con RLS
 * normalmente impedirebbe. L'autorizzazione vera avviene qui, a livello
 * applicativo, prima di restituire qualsiasi dato.
 *
 * Ogni azione che legge/scrive su un documento (getDocument, i messaggi,
 * la chat) deve passare da qui invece di fare query dirette con
 * `.eq('user_id', ...)`, altrimenti un utente con cui il documento è
 * condiviso continuerebbe a vedersi rifiutato l'accesso.
 */
export async function resolveDocumentAccess(
  documentId: string,
  userId: string
): Promise<DocumentAccess | null> {
  const serviceClient = createServiceClient()

  const { data: document } = await serviceClient
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!document) return null

  if (document.user_id === userId) {
    return { document, isOwner: true, permission: 'chat' }
  }

  const { data: share } = await serviceClient
    .from('document_shares')
    .select('permission')
    .eq('document_id', documentId)
    .eq('shared_with_user_id', userId)
    .single()

  if (!share) return null

  return { document, isOwner: false, permission: share.permission as 'view' | 'chat' }
}
