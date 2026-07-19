// lib/lemonsqueezy.ts
import { LEMONSQUEEZY_CHECKOUT_URLS } from './constants'

/**
 * Costruisce l'URL di checkout hosted per un piano, passando l'id utente
 * Supabase come custom_data. Lemon Squeezy lo restituisce identico dentro
 * meta.custom_data in TUTTI i webhook relativi a quell'abbonamento — è
 * così che il webhook handler sa a quale utente collegare il pagamento,
 * senza dover chiedere all'utente di reinserire nulla.
 */
export function buildCheckoutUrl(plan: 'pro' | 'team', userId: string, email?: string): string | null {
  const base = LEMONSQUEEZY_CHECKOUT_URLS[plan]
  if (!base) return null

  const url = new URL(base)
  url.searchParams.set('checkout[custom][user_id]', userId)
  if (email) {
    url.searchParams.set('checkout[email]', email)
  }
  return url.toString()
}