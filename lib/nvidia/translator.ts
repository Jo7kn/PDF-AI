// lib/nvidia/translator.ts
//
// Client NVIDIA NIM dedicato al modulo Translator AI. Stesso provider degli
// altri moduli, key e modulo indipendenti cosi' resta rimovibile/aggiornabile
// senza toccare gli altri tool.

const NVIDIA_TRANSLATOR_API_KEY = process.env.NVIDIA_TRANSLATOR_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

// nvidia/riva-translate-4b-instruct esiste nel catalogo NVIDIA ma non è
// abilitato per questo account (404 "Not found for account"): usiamo il
// modello instruct generico, verificato funzionante con questa key.
const TRANSLATE_MODEL = 'meta/llama-3.3-70b-instruct'

export interface TranslateRequest {
  text: string
  targetLanguage: string
  sourceLanguage?: string // 'Rileva automaticamente' se omesso
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeoutMs = 45000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok || attempt === retries) return response
      if (response.status >= 400 && response.status < 500 && response.status !== 429) return response
      console.warn(`[translator-ai] tentativo ${attempt + 1} fallito con status ${response.status}, riprovo...`)
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[translator-ai] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}

export async function translateText(request: TranslateRequest): Promise<string> {
  if (!NVIDIA_TRANSLATOR_API_KEY) {
    throw new Error('NVIDIA_TRANSLATOR_API_KEY non configurata')
  }
  if (!request.text || !request.text.trim()) {
    throw new Error('Nessun testo da tradurre')
  }

  const sourceNote = request.sourceLanguage ? ` dal ${request.sourceLanguage}` : ' (rileva automaticamente la lingua di partenza)'

  const systemPrompt =
    `Sei un traduttore professionista. Traduci il testo fornito${sourceNote} in ${request.targetLanguage}. ` +
    'Mantieni ESATTAMENTE la formattazione originale (interruzioni di riga, elenchi puntati/numerati, ' +
    'markdown, tabelle, spaziatura tra paragrafi): traduci solo il contenuto testuale, non la struttura. ' +
    'Rispondi SOLO con il testo tradotto, senza premesse, spiegazioni o commenti aggiuntivi.'

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_TRANSLATOR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TRANSLATE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.text },
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 4096,
      }),
    },
    2,
    60000,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[translator-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content

  if (!result) {
    throw new Error('Risposta vuota dal modello AI')
  }

  return result
}
