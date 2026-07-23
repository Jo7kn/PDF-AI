// lib/nvidia/fetch-with-retry.ts
//
// Era duplicata identica in ognuno dei 10 client tool (writer/code/
// translator/image/chat/contract/email/data/converter/study) — ogni copia
// aveva finito per divergere sui default (45-90s x 2-3 tentativi, fino a
// ~183s nel caso peggiore), ben oltre i 60s massimi di maxDuration su
// Vercel Hobby. La piattaforma uccide la funzione dall'esterno prima che
// questo codice riesca anche solo a fallire con un errore leggibile —
// nei log risulta "Status: 0" senza nessuna richiesta esterna completata.
// Default qui pensati per stare sotto i 60s con margine per auth/crediti/DB.
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1,
  timeoutMs = 22000,
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
