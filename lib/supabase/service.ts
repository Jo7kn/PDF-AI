// lib/supabase/service.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase con SERVICE ROLE KEY, da usare SOLO in contesti
 * server-side fidati (background job, webhook, cron) dove NON esiste una
 * sessione utente attiva — ad esempio dentro `processDocument`, che gira
 * dopo che la risposta è già stata inviata al client e quindi non può
 * contare sui cookie di sessione.
 *
 * Bypassa completamente le Row Level Security policies: non esporlo mai
 * al client, non usarlo per richieste dirette dell'utente, e non
 * importarlo in file che girano nel browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars (required for background jobs)'
    )
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}