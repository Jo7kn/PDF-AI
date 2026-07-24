// lib/nvidia/fetch-with-retry.ts
//
// Era duplicata identica in ognuno dei 10 client tool (writer/code/
// translator/image/chat/contract/email/data/converter/study) — ogni copia
// aveva finito per divergere sui default (45-90s x 2-3 tentativi, fino a
// ~183s nel caso peggiore).
//
// ATTENZIONE valore tetto: questo progetto ha Fluid Compute attivo, il tetto
// reale osservato in produzione (Vercel -> Function Invocation -> Maximum)
// e' 5 minuti, non i 60s "Hobby classico". Storia dei default, per non
// ripetere gli stessi tentativi falliti:
// - 55s x2 (~111s worst case): non bastava, log reali del 24/07 mostravano
//   ENTRAMBI i tentativi abortiti su Code AI.
// - 90s x2 (~181s worst case): il timeout si e' risolto, ma e' emerso un
//   problema diverso — un 503 "Worker local total request limit reached"
//   (capacita' condivisa NVIDIA esaurita su un modello popolare). Il ramo
//   5xx NON aspettava affatto prima di ritentare (solo il ramo eccezione/
//   abort aveva un backoff) — il secondo tentativo colpiva lo stesso worker
//   sovraccarico a distanza di zero secondi.
// Ora: backoff su ENTRAMBI i rami, 70s x3 tentativi (~219s worst case,
// dentro il maxDuration=240 dei tool) — se riemerge lo stesso problema,
// il modello scelto per quel tool va probabilmente cambiato con uno meno
// conteso, non solo ritentato piu' volte.
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  timeoutMs = 70000,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok || attempt === retries) return response
      if (response.status >= 400 && response.status < 500 && response.status !== 429) return response
      console.warn(`[nvidia] tentativo ${attempt + 1} fallito con status ${response.status}, riprovo...`)
      await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)))
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[nvidia] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}
