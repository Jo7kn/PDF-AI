// app/actions/workspace.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from './auth'
import { getTierByName } from '@/lib/pricing'
import { DEFAULT_TIER } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

// Stesso controllo di piano gia' usato in app/actions/sharing.ts per la
// condivisione documenti: il limite "teamSharing" di lib/pricing.ts e' la
// fonte di verita' unica per quante persone un utente puo' avere nel team.
async function getTeamLimit(serviceClient: ReturnType<typeof createServiceClient>, userId: string) {
  const { data: userRow } = await serviceClient.from('users').select('tier').eq('id', userId).single()
  const tier = userRow?.tier || DEFAULT_TIER
  return getTierByName(tier) || getTierByName(DEFAULT_TIER)!
}

export async function createWorkspace(name: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const trimmed = name.trim()
  if (!trimmed) return { error: 'Il nome del team non può essere vuoto' }
  if (trimmed.length > 100) return { error: 'Nome troppo lungo' }

  const serviceClient = createServiceClient()

  const pricingTier = await getTeamLimit(serviceClient, user.id)
  if (!pricingTier.limits.teamSharing || pricingTier.limits.teamSharing <= 0) {
    return { error: `Creare un team richiede il piano Team (piano attuale: ${pricingTier.name}).` }
  }

  const { data: existing } = await serviceClient.from('workspaces').select('id').eq('owner_id', user.id).single()
  if (existing) return { error: 'Hai già un team' }

  const { data: workspace, error } = await serviceClient
    .from('workspaces')
    .insert({ name: trimmed, owner_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  const { error: memberError } = await serviceClient
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: user.id, role: 'owner' })

  if (memberError) return { error: memberError.message }

  revalidatePath('/dashboard/team')
  return { success: true, workspace }
}

export async function getMyWorkspace() {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return { success: true, workspace: null }

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', membership.workspace_id)
    .single()

  if (error || !workspace) return { success: true, workspace: null }

  const { data: members } = await supabase
    .from('workspace_members')
    .select('user_id, role, joined_at')
    .eq('workspace_id', workspace.id)

  const serviceClient = createServiceClient()
  const userIds = (members || []).map((m) => m.user_id)
  const { data: userRows } = await serviceClient.from('users').select('id, email').in('id', userIds)
  const emailById = Object.fromEntries((userRows || []).map((u: any) => [u.id, u.email]))

  return {
    success: true,
    workspace: {
      ...workspace,
      myRole: membership.role,
      members: (members || []).map((m) => ({ ...m, email: emailById[m.user_id] || 'Sconosciuto' })),
    },
  }
}

export async function inviteMember(workspaceId: string, email: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Inserisci un indirizzo email valido' }
  }
  if (normalizedEmail === user.email?.toLowerCase()) {
    return { error: 'Non puoi invitare te stesso' }
  }

  const serviceClient = createServiceClient()

  const { data: membership } = await serviceClient
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'Solo owner e admin possono invitare membri' }
  }

  const pricingTier = await getTeamLimit(serviceClient, user.id)
  const { count: memberCount } = await serviceClient
    .from('workspace_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
  const { count: pendingCount } = await serviceClient
    .from('workspace_invitations')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')

  if ((memberCount || 0) + (pendingCount || 0) >= pricingTier.limits.teamSharing + 1) {
    return { error: `Hai raggiunto il limite di ${pricingTier.limits.teamSharing} membri sul piano ${pricingTier.name}.` }
  }

  // Stesso vincolo di sharing.ts: nessuna infrastruttura email transazionale
  // in questo progetto, quindi l'invitato deve avere già un account.
  const { data: invitedUser } = await serviceClient
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  if (!invitedUser) {
    return { error: `Nessun utente registrato con l'email ${normalizedEmail}. Deve avere già un account su AI Toolbox.` }
  }

  const { data: alreadyMember } = await serviceClient
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', invitedUser.id)
    .single()

  if (alreadyMember) return { error: 'Questa persona fa già parte del team' }

  const { error } = await serviceClient.from('workspace_invitations').insert({
    workspace_id: workspaceId,
    invited_email: normalizedEmail,
    invited_by: user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Invito già inviato a questo indirizzo' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function getPendingInvitations() {
  const user = await getCurrentUser()
  if (!user || !user.email) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('id, workspace_id, role, created_at')
    .eq('invited_email', user.email.toLowerCase())
    .eq('status', 'pending')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { success: true, invitations: [] }

  const serviceClient = createServiceClient()
  const workspaceIds = data.map((i) => i.workspace_id)
  const { data: workspaces } = await serviceClient.from('workspaces').select('id, name').in('id', workspaceIds)
  const nameById = Object.fromEntries((workspaces || []).map((w: any) => [w.id, w.name]))

  return {
    success: true,
    invitations: data.map((i) => ({ ...i, workspaceName: nameById[i.workspace_id] || 'Team' })),
  }
}

export async function acceptInvitation(invitationId: string) {
  const user = await getCurrentUser()
  if (!user || !user.email) return { error: 'Unauthorized' }

  const serviceClient = createServiceClient()

  const { data: invitation } = await serviceClient
    .from('workspace_invitations')
    .select('*')
    .eq('id', invitationId)
    .eq('invited_email', user.email.toLowerCase())
    .eq('status', 'pending')
    .single()

  if (!invitation) return { error: 'Invito non trovato' }

  const { data: existingMembership } = await serviceClient
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMembership) return { error: 'Fai già parte di un team. Esci da quello attuale prima di accettarne un altro.' }

  const { error: memberError } = await serviceClient
    .from('workspace_members')
    .insert({ workspace_id: invitation.workspace_id, user_id: user.id, role: invitation.role })

  if (memberError) return { error: memberError.message }

  await serviceClient.from('workspace_invitations').update({ status: 'accepted' }).eq('id', invitationId)

  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function declineInvitation(invitationId: string) {
  const user = await getCurrentUser()
  if (!user || !user.email) return { error: 'Unauthorized' }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient
    .from('workspace_invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId)
    .eq('invited_email', user.email.toLowerCase())

  if (error) return { error: error.message }
  revalidatePath('/dashboard/team')
  return { success: true }
}

export async function removeMember(workspaceId: string, memberUserId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', memberUserId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/team')
  return { success: true }
}
