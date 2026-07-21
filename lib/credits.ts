// lib/credits.ts
//
// Sistema crediti generico, condiviso da tutti i tool AI della piattaforma.
// Costo flat per azione (non basato sui token reali, vedi nota in
// supabase/migrations/006_credits_and_usage.sql). Unico punto che tocca le
// colonne credits/usage_events: non fare deduzioni/log altrove.

import { createServiceClient } from '@/lib/supabase/service'

// Deve restare allineato al DEFAULT della colonna users.credits in
// supabase/migrations/006_credits_and_usage.sql — usato qui solo per
// documentare esplicitamente il valore nel punto in cui viene assegnato
// (ensureUserProfile), il default DB è comunque la fonte di verità.
export const DEFAULT_STARTING_CREDITS = 50

export type ToolSlug =
  | 'code-ai'
  | 'ai-writer'
  | 'image-ai'
  | 'translator-ai'
  | 'email-ai'
  | 'study-ai'
  | 'contract-ai'
  | 'data-ai'
  | 'file-converter'
  | 'chat-ai'

// Costo in crediti per singola chiamata AI, per tool. La generazione
// immagini costa di più (modello diffusion, tempo/risorse maggiori);
// Contract AI costa leggermente di più per il contesto lungo dei contratti.
export const CREDIT_COSTS: Record<ToolSlug, number> = {
  'code-ai': 1,
  'ai-writer': 1,
  'image-ai': 5,
  'translator-ai': 1,
  'email-ai': 1,
  'study-ai': 1,
  'contract-ai': 2,
  'data-ai': 1,
  'file-converter': 1,
  'chat-ai': 1,
}

// Crediti assegnati/rinnovati per piano (webhook Stripe). Allineati
// nello spirito ai limiti di lib/pricing.ts (PRICING_TIERS) ma su scala
// crediti generica invece che "pagine PDF".
export const PLAN_CREDITS: Record<string, number> = {
  free: DEFAULT_STARTING_CREDITS,
  pro: 1000,
  team: 3000,
}

// Tool riservati ai piani a pagamento: gating di prodotto (per far leva
// sull'upgrade), non solo di risorse — un utente Free non può aprirli anche
// se ha crediti sufficienti. Gli altri tool restano liberi, limitati solo
// dai crediti come sempre. Applicato sia lato UI (ToolCard/TierGate) sia
// lato server in lib/ai-router.ts, che è il vero confine di sicurezza.
export const TIER_GATED_TOOLS: Set<ToolSlug> = new Set(['image-ai', 'data-ai', 'contract-ai', 'study-ai'])

export function hasPaidTier(tier: string | null | undefined): boolean {
  return tier === 'pro' || tier === 'team'
}

export async function setUserCredits(userId: string, credits: number): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('users').update({ credits }).eq('id', userId)
}

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error || !data) return 0
  return data.credits ?? 0
}

// Usato da lib/ai-router.ts per il gate dei TIER_GATED_TOOLS: prende il
// piano via service client (stesso pattern di getUserCredits) perché il
// router riceve solo lo userId, non la sessione cookie-based dell'utente.
export async function getUserTier(userId: string): Promise<string> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single()

  if (error || !data) return 'free'
  return data.tier || 'free'
}

// Deduzione atomica via RPC lato Postgres invece di un read-then-write
// applicativo, per evitare race condition su richieste concorrenti dello
// stesso utente (due tool aperti in due tab). Se la funzione RPC non esiste
// ancora sul DB (prima di applicare la migration), fa fallback a
// read-then-write: meno sicuro sotto concorrenza ma non blocca l'app.
async function deductCreditsAtomic(userId: string, amount: number): Promise<boolean> {
  const supabase = createServiceClient()

  const { data, error } = await supabase.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: amount,
  })

  if (!error) return Boolean(data)

  // Fallback: la RPC non esiste (migration non ancora applicata sul DB).
  const current = await getUserCredits(userId)
  if (current < amount) return false

  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: current - amount })
    .eq('id', userId)
    .gte('credits', amount)

  return !updateError
}

export async function deductCredits(userId: string, amount: number): Promise<boolean> {
  return deductCreditsAtomic(userId, amount)
}

export async function logUsage(
  userId: string,
  tool: ToolSlug,
  action: string | undefined,
  creditsCost: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createServiceClient()
  await supabase.from('usage_events').insert({
    user_id: userId,
    tool,
    action: action || null,
    credits_cost: creditsCost,
    metadata: metadata || null,
  })
}
