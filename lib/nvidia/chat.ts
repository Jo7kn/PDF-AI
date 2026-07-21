// lib/nvidia/chat.ts
//
// Client NVIDIA NIM per Chat AI generale: stesso modello/dominio di PDF AI
// (lib/nvidia/nim.ts) ma senza contesto documento, conversazione multi-turn
// libera. Modulo indipendente per restare rimovibile/aggiornabile da solo.

const NVIDIA_CHAT_API_KEY = process.env.NVIDIA_CHAT_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const CHAT_MODEL = 'meta/llama-3.3-70b-instruct'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeoutMs = 60000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok || attempt === retries) return response
      if (response.status >= 400 && response.status < 500 && response.status !== 429) return response
      console.warn(`[chat-ai] tentativo ${attempt + 1} fallito con status ${response.status}, riprovo...`)
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[chat-ai] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}

export async function runGeneralChat(messages: ChatMessage[]): Promise<string> {
  if (!NVIDIA_CHAT_API_KEY) {
    throw new Error('NVIDIA_CHAT_API_KEY non configurata')
  }
  if (!messages.length) {
    throw new Error('Nessun messaggio da inviare')
  }

  const systemPrompt =
    'Sei un assistente AI generico, utile, onesto e diretto. Rispondi in italiano (a meno che l\'utente scriva ' +
    'in un\'altra lingua) in modo chiaro e conciso, usando Markdown quando aiuta la leggibilità (elenchi, ' +
    'blocchi di codice, grassetto). Se non sai qualcosa, dillo invece di inventare.'

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_CHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 2048,
      }),
    },
    2,
    60000,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[chat-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content

  if (!result) {
    throw new Error('Risposta vuota dal modello AI')
  }

  return result
}
