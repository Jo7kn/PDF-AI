// app/actions/admin.ts
//
// Azioni riservate alla pagina /admin. Ogni funzione ricontrolla
// isCurrentUserAdmin() lato server, anche se la pagina che le chiama è già
// gated — mai fidarsi solo del controllo fatto in UI (vedi lib/admin.ts).

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isCurrentUserAdmin } from '@/lib/admin'
import { FEATURE_FLAG_SLUGS, type FeatureFlagSlug } from '@/lib/feature-flags'

export async function toggleFeatureFlag(slug: FeatureFlagSlug, enabled: boolean) {
  if (!(await isCurrentUserAdmin())) return { error: 'Unauthorized' }
  if (!FEATURE_FLAG_SLUGS.includes(slug)) return { error: 'Invalid slug' }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('feature_flags')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (error) return { error: error.message }

  // Le pagine gated leggono il flag lato server ad ogni richiesta: senza
  // revalidate resterebbero sulla cache di Next.js finché non scade da sola.
  revalidatePath('/', 'layout')
  return { success: true }
}

export interface AdminAnalytics {
  totalUsers: number
  newUsersLast7Days: number
  usersByTier: { free: number; pro: number; team: number }
  totalDocuments: number
  creditsUsedLast30Days: number
  toolUsageLast30Days: Array<{ tool: string; count: number; creditsUsed: number }>
}

export async function getAnalyticsSummary(): Promise<{ data: AdminAnalytics } | { error: string }> {
  if (!(await isCurrentUserAdmin())) return { error: 'Unauthorized' }

  const supabase = createServiceClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: newUsersLast7Days },
    { count: freeCount },
    { count: proCount },
    { count: teamCount },
    { count: totalDocuments },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'free'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'pro'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'team'),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
    supabase.from('usage_events').select('tool, credits_cost').gte('created_at', thirtyDaysAgo),
  ])

  const toolStats = new Map<string, { count: number; creditsUsed: number }>()
  for (const event of recentEvents || []) {
    const entry = toolStats.get(event.tool) || { count: 0, creditsUsed: 0 }
    entry.count += 1
    entry.creditsUsed += event.credits_cost || 0
    toolStats.set(event.tool, entry)
  }

  return {
    data: {
      totalUsers: totalUsers || 0,
      newUsersLast7Days: newUsersLast7Days || 0,
      usersByTier: { free: freeCount || 0, pro: proCount || 0, team: teamCount || 0 },
      totalDocuments: totalDocuments || 0,
      creditsUsedLast30Days: (recentEvents || []).reduce((sum, e) => sum + (e.credits_cost || 0), 0),
      toolUsageLast30Days: Array.from(toolStats.entries())
        .map(([tool, stats]) => ({ tool, ...stats }))
        .sort((a, b) => b.count - a.count),
    },
  }
}

export interface AdminActivityEvent {
  id: string
  userEmail: string
  tool: string
  action: string | null
  creditsCost: number
  createdAt: string
}

// "Log attività": non sono i log stdout del server (non persistiti da
// nessuna parte in questo stack) ma il registro reale degli usage_events —
// la fonte più vicina e verificabile a "cosa sta succedendo sul sito".
export async function getActivityLog(limit = 50): Promise<{ data: AdminActivityEvent[] } | { error: string }> {
  if (!(await isCurrentUserAdmin())) return { error: 'Unauthorized' }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('usage_events')
    .select('id, tool, action, credits_cost, created_at, users(email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message }

  return {
    data: (data || []).map((row: any) => ({
      id: row.id,
      userEmail: row.users?.email || 'unknown',
      tool: row.tool,
      action: row.action,
      creditsCost: row.credits_cost || 0,
      createdAt: row.created_at,
    })),
  }
}

export interface WaitlistSignup {
  email: string
  source: string | null
  createdAt: string
}

export interface WaitlistSummary {
  total: number
  bySource: Array<{ source: string; count: number }>
  recent: WaitlistSignup[]
}

// Iscrizioni al form "avvisami al lancio" (vedi app/actions/waitlist.ts e
// components/coming-soon.tsx) — altrimenti le email raccolte resterebbero
// invisibili, chiuse nel DB senza nessuna UI per consultarle.
export async function getWaitlistSummary(limit = 20): Promise<{ data: WaitlistSummary } | { error: string }> {
  if (!(await isCurrentUserAdmin())) return { error: 'Unauthorized' }

  const supabase = createServiceClient()
  const [{ count: total }, { data: allSources }, { data: recentRows, error }] = await Promise.all([
    supabase.from('launch_notifications').select('*', { count: 'exact', head: true }),
    supabase.from('launch_notifications').select('source'),
    supabase
      .from('launch_notifications')
      .select('email, source, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
  ])

  if (error) return { error: error.message }

  const bySourceMap = new Map<string, number>()
  for (const row of allSources || []) {
    const key = row.source || 'unknown'
    bySourceMap.set(key, (bySourceMap.get(key) || 0) + 1)
  }

  return {
    data: {
      total: total || 0,
      bySource: Array.from(bySourceMap.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
      recent: (recentRows || []).map((row) => ({ email: row.email, source: row.source, createdAt: row.created_at })),
    },
  }
}

export interface CreditAdjustmentResult {
  success: boolean
  error?: string
  email?: string
  previousBalance?: number
  newBalance?: number
}

// Strumento di supporto: correggere manualmente il saldo di un utente (es.
// un webhook Stripe perso, un rimborso, un gesto commerciale). delta può
// essere negativo per sottrarre. Non scrive su usage_events: quella tabella
// alimenta le statistiche di "utilizzo reale" in getAnalyticsSummary, e una
// rettifica manuale non è utilizzo — mescolarle sporcherebbe le metriche.
export async function adjustUserCredits(email: string, delta: number): Promise<CreditAdjustmentResult> {
  if (!(await isCurrentUserAdmin())) return { success: false, error: 'unauthorized' }

  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) return { success: false, error: 'email-required' }
  if (!Number.isFinite(delta) || delta === 0) return { success: false, error: 'invalid-amount' }

  const supabase = createServiceClient()
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, credits')
    .eq('email', trimmedEmail)
    .single()

  if (findError || !user) return { success: false, error: 'user-not-found' }

  const previousBalance = user.credits ?? 0
  const newBalance = Math.max(0, previousBalance + delta)

  const { error: updateError } = await supabase.from('users').update({ credits: newBalance }).eq('id', user.id)
  if (updateError) return { success: false, error: updateError.message }

  return { success: true, email: trimmedEmail, previousBalance, newBalance }
}

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

// Esporta TUTTA la waitlist (getWaitlistSummary tronca a `limit` righe per la
// tabella a schermo) — usata dal pulsante "Esporta CSV" in /admin.
export async function exportWaitlistCsv(): Promise<{ csv: string } | { error: string }> {
  if (!(await isCurrentUserAdmin())) return { error: 'unauthorized' }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('launch_notifications')
    .select('email, source, created_at')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }

  const header = 'email,source,created_at'
  const rows = (data || []).map((row) =>
    [row.email, row.source || '', row.created_at].map((v) => escapeCsvField(String(v))).join(','),
  )
  return { csv: [header, ...rows].join('\n') }
}

// Usata dalla pagina /admin per il controllo di accesso: a differenza di
// isCurrentUserAdmin() (usata internamente da questo file) è pensata per
// essere chiamata anche da un Server Component per decidere cosa renderizzare.
export async function checkIsAdmin(): Promise<boolean> {
  return isCurrentUserAdmin()
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? null
}
