// lib/nvidia/fetch-with-retry.ts
//
// Era duplicata identica in ognuno dei 10 client tool (writer/code/
// translator/image/chat/contract/email/data/converter/study) — ogni copia
// aveva finito per divergere sui default (45-90s x 2-3 tentativi, fino a
// ~183s nel caso peggiore).
//
// ATTENZIONE valore tetto: questo progetto ha Fluid Compute attivo, il tetto
// reale osservato in produzione (Vercel -> Function Invocation -> Maximum)
// e' 5 minuti, non i 60s "Hobby classico" — verificato da un log reale dove
// un primo tentativo a 22s x2 (~45s totali) non e' bastato e NVIDIA e' stata
// interrotta a meta' risposta. Questi default (1 retry, 55s a tentativo =
// ~111s worst case) restano ben sotto il maxDuration=120 impostato nei
// layout.tsx dei tool, che a sua volta resta ben sotto il tetto reale di
// 300s — se emergono altri abort reali nei log, alza ancora prima di
// pensare che sia un problema diverso.
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1,
  timeoutMs = 55000,
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
