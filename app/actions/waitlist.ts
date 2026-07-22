// app/actions/waitlist.ts
//
// Form pubblico "avvisami al lancio" sulla pagina Coming Soon. Nessuna
// sessione richiesta (a differenza delle altre action), quindi la
// validazione e il rate limit qui sono l'unica barriera prima del DB.

'use server'

import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { isAllowed } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WAITLIST_RATE_LIMIT = 5
const WAITLIST_RATE_WINDOW_MS = 10 * 60 * 1000

export type JoinWaitlistResult =
  | { status: 'success' }
  | { status: 'already-joined' }
  | { status: 'invalid-email' }
  | { status: 'rate-limited' }
  | { status: 'error' }

function getClientIp(): string {
  const h = headers()
  const forwardedFor = h.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return h.get('x-real-ip') || 'unknown'
}

export async function joinWaitlist(email: string, source: string): Promise<JoinWaitlistResult> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || trimmed.length > 255 || !EMAIL_RE.test(trimmed)) {
    return { status: 'invalid-email' }
  }

  if (!isAllowed(`waitlist:${getClientIp()}`, WAITLIST_RATE_LIMIT, WAITLIST_RATE_WINDOW_MS)) {
    return { status: 'rate-limited' }
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('launch_notifications').insert({ email: trimmed, source })

  if (error) {
    // 23505 = unique_violation (Postgres): email già in lista, non un errore
    // per l'utente — mostriamo comunque conferma invece di un errore generico.
    if (error.code === '23505') return { status: 'already-joined' }
    return { status: 'error' }
  }

  return { status: 'success' }
}
