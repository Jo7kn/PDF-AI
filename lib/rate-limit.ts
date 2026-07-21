// lib/rate-limit.ts
//
// Sliding window in-memory, stesso spirito minimale di lib/credits.ts.
// LIMITE ONESTO: essendo un Map in-process, funziona correttamente solo a
// singola istanza. Su un deploy serverless/multi-regione (es. Vercel con
// più istanze) ogni istanza avrebbe il proprio contatore, quindi il limite
// reale sarebbe piu' alto di quello dichiarato. Scelta esplicita per questa
// fase (nessun Redis/Upstash provisionato) — sostituibile in seguito con
// Upstash Redis senza cambiare i call site (stessa firma isAllowed()).

interface Bucket {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

// Pulizia periodica per non far crescere la Map all'infinito con chiavi
// (userId/IP) ormai inattive.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    if (bucket.timestamps.length === 0 || now - bucket.timestamps[bucket.timestamps.length - 1] > CLEANUP_INTERVAL_MS) {
      buckets.delete(key)
    }
  }
}

/**
 * @param key identificatore univoco (es. `ai:${userId}` o `login:${ip}`) —
 *   prefissare per namespace, altrimenti due limiter diversi sulla stessa
 *   chiave si mescolerebbero.
 * @param limit numero massimo di richieste consentite nella finestra
 * @param windowMs durata della finestra in millisecondi
 */
export function isAllowed(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  cleanup(now)

  const bucket = buckets.get(key) || { timestamps: [] }
  const windowStart = now - windowMs

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart)

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket)
    return false
  }

  bucket.timestamps.push(now)
  buckets.set(key, bucket)
  return true
}
