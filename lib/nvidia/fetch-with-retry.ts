// lib/nvidia/fetch-with-retry.ts
//
// Era duplicata identica in ognuno dei 10 client tool (writer/code/
// translator/image/chat/contract/email/data/converter/study) — ogni copia
// aveva finito per divergere sui default (45-90s x 2-3 tentativi, fino a
// ~183s nel caso peggiore).
//
// ATTENZIONE valore tetto: questo progetto ha Fluid Compute attivo, il tetto
// reale osservato in produzione (Vercel -> Function Invocation -> Maximum)
// e' 5 minuti, non i 60s "Hobby classico". Il default precedente (55s x2 =
// ~111s worst case) non bastava: log reali del 24/07 mostrano ENTRAMBI i
// tentativi abortiti a 55s su Code AI (anche prima di passare a un modello
// piu' grande — sembra latenza/coda lato NVIDIA NIM, non solo dimensione
// del modello). Alzato a 90s x2 = ~181s worst case, con maxDuration nei
// layout.tsx dei tool alzato in parallelo a 240 per starci sotto — se
// emergono altri abort reali nei log, alza ancora prima di pensare che sia
// un problema diverso.
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1,
  timeoutMs = 90000,
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
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[nvidia] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}
