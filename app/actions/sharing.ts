// app/actions/sharing.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from './auth'
import { getTierByName } from '@/lib/pricing'
import { DEFAULT_TIER } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export async function shareDocument(documentId: string, email: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Inserisci un indirizzo email valido' }
  }
  if (normalizedEmail === user.email?.toLowerCase()) {
    return { error: 'Non puoi condividere un documento con te stesso' }
  }

  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Verifica che il documento sia davvero dell'utente corrente
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, user_id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (docError || !document) {
    return { error: 'Documento non trovato' }
  }

  // Limite di condivisione dal piano dell'OWNER (chi condivide), non del
  // destinatario
  const { data: ownerRow } = await serviceClient
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  const tier = ownerRow?.tier || DEFAULT_TIER
  const pricingTier = getTierByName(tier) || getTierByName(DEFAULT_TIER)!

  if (!pricingTier.limits.teamSharing || pricingTier.limits.teamSharing <= 0) {
    return { error: `La condivisione documenti richiede il piano Team (piano attuale: ${pricingTier.name}).` }
  }

  const { count } = await serviceClient
    .from('document_shares')
    .select('id', { count: 'exact', head: true })
    .eq('document_id', documentId)

  if ((count || 0) >= pricingTier.limits.teamSharing) {
    return {
      error: `Hai raggiunto il limite di ${pricingTier.limits.teamSharing} persone con cui condividere questo documento sul piano ${pricingTier.name}.`,
    }
  }

  // NB: il destinatario deve avere già un account su PDF AI. Un vero
  // sistema di inviti (email a chi non è ancora registrato, con link di
  // accesso) richiede infrastruttura aggiuntiva (invio email transazionali
  // + inviti pendenti) non ancora presente in questo progetto.
  const { data: targetUser, error: targetError } = await serviceClient
    .from('users')
    .select('id, email')
    .eq('email', normalizedEmail)
    .single()

  if (targetError || !targetUser) {
    return { error: `Nessun utente registrato con l'email ${normalizedEmail}. Deve avere già un account su PDF AI.` }
  }

  const { error: shareError } = await serviceClient
    .from('document_shares')
    .insert({
      document_id: documentId,
      owner_id: user.id,
      shared_with_user_id: targetUser.id,
      permission: 'chat',
    })

  if (shareError) {
    if (shareError.code === '23505') {
      return { error: 'Documento già condiviso con questo utente' }
    }
    return { error: shareError.message }
  }

  revalidatePath(`/document/${documentId}`)
  return { success: true }
}

export async function unshareDocument(documentId: string, shareId: string) {
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

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('document_shares')
    .delete()
    .eq('id', shareId)
    .eq('document_id', documentId)

  if (error) return { error: error.message }

  revalidatePath(`/document/${documentId}`)
  return { success: true }
}

export async function getDocumentShares(documentId: string) {
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

  const serviceClient = createServiceClient()

  // Due query separate invece di un join annidato: shared_with_user_id
  // referenzia auth.users, non public.users, quindi PostgREST non riesce
  // a rilevare automaticamente la relazione per l'embedding ("Could not
  // find a relationship..."). Uniamo i dati in JS.
  const { data: shares, error } = await serviceClient
    .from('document_shares')
    .select('id, permission, created_at, shared_with_user_id')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })

  if (error) return { error: error.message }

  const userIds = (shares || []).map(s => s.shared_with_user_id)
  let emailById: Record<string, string> = {}

  if (userIds.length > 0) {
    const { data: users } = await serviceClient
      .from('users')
      .select('id, email')
      .in('id', userIds)
    emailById = Object.fromEntries((users || []).map((u: any) => [u.id, u.email]))
  }

  return {
    success: true,
    shares: (shares || []).map((s: any) => ({
      id: s.id,
      email: emailById[s.shared_with_user_id] || 'Sconosciuto',
      permission: s.permission,
      createdAt: s.created_at,
    })),
  }
}

export async function getSharedWithMeDocuments() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const serviceClient = createServiceClient()

  const { data: shares, error } = await serviceClient
    .from('document_shares')
    .select('permission, document_id')
    .eq('shared_with_user_id', user.id)

  if (error) return { error: error.message }
  if (!shares || shares.length === 0) return { success: true, documents: [] }

  const documentIds = shares.map((s: any) => s.document_id)

  const { data: docs, error: docsError } = await serviceClient
    .from('documents')
    .select('id, name, summary, total_pages, processing_status, created_at, user_id')
    .in('id', documentIds)

  if (docsError) return { error: docsError.message }

  const ownerIds = [...new Set((docs || []).map((d: any) => d.user_id))]
  const { data: owners } = await serviceClient
    .from('users')
    .select('id, email')
    .in('id', ownerIds)

  const ownerEmailById = Object.fromEntries((owners || []).map((u: any) => [u.id, u.email]))
  const permissionByDocId = Object.fromEntries(shares.map((s: any) => [s.document_id, s.permission]))

  return {
    success: true,
    documents: (docs || []).map((d: any) => ({
      ...d,
      sharePermission: permissionByDocId[d.id],
      ownerEmail: ownerEmailById[d.user_id],
    })),
  }
}