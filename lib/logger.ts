// lib/logger.ts
//
// console.log/error da soli non sono ispezionabili da /admin su Vercel
// (serverless, nessun terminale persistente) — questo scrive anche su
// app_logs. Fire-and-forget: un fallimento di logging non deve mai rompere
// il percorso reale della richiesta che lo ha generato.

import { createServiceClient } from '@/lib/supabase/service'

export type LogLevel = 'info' | 'warn' | 'error'

export function logEvent(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (level === 'error') console.error(message, meta ?? '')
  else if (level === 'warn') console.warn(message, meta ?? '')
  else console.log(message, meta ?? '')

  // .then(undefined, ...) invece di await/try-catch: stesso fire-and-forget,
  // nessuna IIFE. Vedi commento sopra: un fallimento qui non deve mai propagare.
  createServiceClient().from('app_logs').insert({ level, message, meta: meta ?? null }).then(undefined, () => {})
}
