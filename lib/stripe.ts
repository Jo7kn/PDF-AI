// lib/stripe.ts
//
// Client-safe: only URL string building, no Stripe SDK import. The billing page is a
// 'use client' component that imports buildCheckoutUrl — pulling the Stripe Node SDK in
// here would ship it to the browser bundle. The SDK client lives in lib/stripe-server.ts,
// used only by the webhook route (a Route Handler, which never ships to the client anyway).

import { STRIPE_CHECKOUT_URLS } from './constants'

/**
 * Builds the Payment Link URL for a plan, appending client_reference_id so the webhook
 * knows which Supabase user just paid (Stripe echoes it back on checkout.session.completed
 * — same role LemonSqueezy's checkout[custom][user_id] played) and prefilled_email so the
 * Stripe checkout form doesn't ask for an email we already have.
 */
export function buildCheckoutUrl(plan: 'pro' | 'team', userId: string, email?: string): string | null {
  const base = STRIPE_CHECKOUT_URLS[plan]
  if (!base) return null

  const url = new URL(base)
  url.searchParams.set('client_reference_id', userId)
  if (email) {
    url.searchParams.set('prefilled_email', email)
  }
  return url.toString()
}
