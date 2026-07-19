// lib/after.ts
import * as nextServer from 'next/server'

const mod = nextServer as any
const nativeAfter: ((fn: () => Promise<void> | void) => void) | undefined =
  mod.after ?? mod.unstable_after

export const hasNativeAfter = typeof nativeAfter === 'function'

let warned = false

/**
 * Esegue `fn` in background se Next.js supporta after()/unstable_after()
 * (Next 14.3+), altrimenti la ESEGUE E ASPETTA prima di ritornare — non
 * un fire-and-forget silenzioso. Questo è l'unico modo per garantire che
 * il lavoro finisca davvero su versioni di Next senza after(): un
 * fire-and-forget qui rischierebbe di essere troncato a metà su
 * serverless (Vercel) non appena la risposta viene inviata.
 *
 * Va sempre chiamata con `await` dal codice chiamante: se after() nativo
 * è disponibile l'await si risolve subito (il job continua dopo la
 * risposta); altrimenti l'await blocca finché il job non è completo.
 */
export async function runInBackground(fn: () => Promise<void>): Promise<void> {
  if (hasNativeAfter) {
    nativeAfter!(fn)
    return
  }

  if (!warned) {
    warned = true
    console.warn(
      '⚠️ next/server non espone after() né unstable_after() (richiede Next 14.3+). ' +
      'Eseguo il job in modo BLOCCANTE come fallback: la risposta sarà più lenta ma il lavoro non verrà troncato. ' +
      'Valuta di aggiornare Next.js per risposte più veloci.'
    )
  }
  await fn()
}