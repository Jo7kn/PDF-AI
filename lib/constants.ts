// lib/constants.ts

// I limiti di piano "di business" (progetti attivi, pagine totali, ecc.)
// vivono in lib/pricing.ts (PRICING_TIERS) — quella è l'unica fonte di
// verità, non duplicarli qui.

export const DEFAULT_TIER = 'free'

export const ALLOWED_FILE_TYPES = ['application/pdf']

// Limite dimensione file upload, per tier (bytes). È un limite
// infrastrutturale/di sicurezza (evitare OCR su file enormi), non una
// feature del piano, quindi resta separato da lib/pricing.ts.
export const MAX_FILE_SIZE_BYTES: Record<string, number> = {
  free: 10 * 1024 * 1024, // 10MB
  pro: 25 * 1024 * 1024, // 25MB
  team: 25 * 1024 * 1024, // 25MB
}

export const DEFAULT_MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_BYTES[DEFAULT_TIER]

// ------------------------------------------------------------------
// Stripe: letti da env invece che hardcoded, perché test mode e live mode
// sono due set di valori completamente separati (Payment Link e Price ID
// diversi) — .env.local tiene i valori test, l'ambiente di produzione
// (Vercel) tiene quelli live, zero modifiche al codice per passare dall'uno
// all'altro.
// ------------------------------------------------------------------

// Price ID ("price_...", da Dashboard -> Product catalog -> click prodotto
// -> copia Price ID) -> tier interno. Il webhook lo usa per sapere quale
// piano assegnare quando arriva un evento checkout.session.completed /
// customer.subscription.updated. Solo server-side: niente NEXT_PUBLIC_.
export const STRIPE_PRICE_TIER_MAP: Record<string, string> = {
  ...(process.env.STRIPE_PRICE_ID_PRO ? { [process.env.STRIPE_PRICE_ID_PRO]: 'pro' } : {}),
  ...(process.env.STRIPE_PRICE_ID_TEAM ? { [process.env.STRIPE_PRICE_ID_TEAM]: 'team' } : {}),
}

// Payment Link hosted per piano. Usati per costruire il bottone "Passa a
// Pro/Team" (lib/stripe.ts ci appende client_reference_id/prefilled_email).
// NEXT_PUBLIC_ perché letti da un client component — non sono segreti, un
// Payment Link è pensato per essere condiviso/cliccato pubblicamente.
export const STRIPE_CHECKOUT_URLS: Record<string, string> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_PRO || '',
  team: process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL_TEAM || '',
}
