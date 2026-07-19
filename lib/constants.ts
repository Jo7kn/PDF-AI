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
// Lemon Squeezy: compila questi valori dopo aver creato i prodotti sul
// tuo store (Settings -> Products per il Variant ID, Share -> "Buy now"
// per l'URL di checkout).
// ------------------------------------------------------------------

// Variant ID (numero, come stringa) -> tier interno. Il webhook usa
// questa mappa per sapere quale piano assegnare quando arriva un evento
// subscription_created/updated.
export const LEMONSQUEEZY_VARIANT_TIER_MAP: Record<string, string> = {
  '1925549': 'pro',
  '1925583': 'team',
}

// URL di checkout hosted per piano (il link "Buy now" copiato dal
// prodotto). Usati per costruire il bottone "Passa a Pro/Team".
export const LEMONSQUEEZY_CHECKOUT_URLS: Record<string, string> = {
  pro: 'https://neuropdf.it/checkout/buy/be89c8aa-588b-46f6-8d69-913ffbd7ab2c',
  team: 'https://neuropdf.it/checkout/buy/fa0f3f5d-5721-4654-a544-57df706d7fa1',
}