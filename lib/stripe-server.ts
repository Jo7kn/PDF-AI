// lib/stripe-server.ts
//
// Server-only Stripe SDK client, used by app/api/webhooks/stripe/route.ts to verify
// webhook signatures and look up subscription details. Kept out of lib/stripe.ts so
// client components importing buildCheckoutUrl never bundle the Stripe Node SDK.

import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY env var')
    }
    stripeClient = new Stripe(secretKey)
  }
  return stripeClient
}
