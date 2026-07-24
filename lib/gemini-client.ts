// lib/gemini-client.ts
//
// Client REST condiviso per Gemini (generateContent / embedContent). NON è un
// drop-in per lib/nvidia/fetch-with-retry.ts: Gemini usa una request/response
// shape diversa da quella OpenAI-compatibile di NVIDIA (contents/parts, non
// messages; systemInstruction separato, non un messaggio role:"system").
//
// Stessa lezione imparata con NVIDIA però (vedi git log fetch-with-retry.ts):
// il backoff va su ENTRAMBI i rami — risposta-non-ok E eccezione/timeout — non
// solo su uno dei due, altrimenti un retry rifà la stessa chiamata a zero
// secondi di distanza contro un servizio già in difficoltà.

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, timeoutMs = 70000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok || attempt === retries) return response
      if (response.status >= 400 && response.status < 500 && response.status !== 429) return response
      console.warn(`[gemini] tentativo ${attempt + 1} fallito con status ${response.status}, riprovo...`)
      await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)))
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[gemini] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}

export interface GeminiTurn {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface GenerateContentOptions {
  apiKey: string
  model: string
  systemInstruction?: string
  // Uno dei due: `parts` per una singola battuta utente (caso comune), `contents`
  // per una conversazione multi-turno già costruita (Chat AI) — Gemini usa
  // role:"model" per il turno AI, non "assistant" come le API OpenAI-compatibili.
  parts?: GeminiPart[]
  contents?: GeminiTurn[]
  temperature?: number
  topP?: number
  maxOutputTokens?: number
  retries?: number
  timeoutMs?: number
  logLabel?: string
}

export async function generateContent({
  apiKey,
  model,
  systemInstruction,
  parts,
  contents,
  temperature = 0.7,
  topP = 0.95,
  maxOutputTokens = 4096,
  retries = 2,
  timeoutMs = 70000,
  logLabel = 'gemini',
}: GenerateContentOptions): Promise<string> {
  if (!contents && !parts) throw new Error('generateContent: serve parts o contents')

  const body: Record<string, unknown> = {
    contents: contents || [{ role: 'user', parts }],
    generationConfig: { temperature, topP, maxOutputTokens },
  }
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] }
  }

  const response = await fetchWithRetry(
    `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    retries,
    timeoutMs,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[${logLabel}] errore Gemini (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  // finishReason SAFETY/RECITATION/etc: Gemini filtra il contenuto, contents
  // vuoto ma la risposta e' comunque 200 — diverso da un errore di rete/server.
  if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
    console.error(`[${logLabel}] Gemini ha bloccato la risposta:`, candidate.finishReason)
    throw new Error('Il modello AI non ha potuto generare una risposta per questo contenuto. Prova a riformulare.')
  }

  const result = (candidate?.content?.parts as GeminiPart[] | undefined)?.map((p) => p.text || '').join('')
  if (!result) throw new Error('Risposta vuota dal modello AI')
  return result
}

export async function embedContent(apiKey: string, model: string, text: string, outputDimensionality?: number): Promise<number[]> {
  const body: Record<string, unknown> = { content: { parts: [{ text }] } }
  // gemini-embedding-001 e' addestrato con Matryoshka Representation Learning:
  // il default e' 3072 dim, ma tronca a qualunque dimensione richiesta restando
  // semanticamente valido. Usato per allineare l'output alla colonna vector()
  // esistente in Supabase (creata per il vecchio embedder NVIDIA a 2048 dim)
  // senza dover migrare schema/re-indicizzare i chunk già salvati.
  if (outputDimensionality) body.outputDimensionality = outputDimensionality

  const response = await fetchWithRetry(
    `${GEMINI_BASE_URL}/models/${model}:embedContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    1,
    30000,
  )
  if (!response.ok) {
    const errorText = await response.text()
    console.error('[gemini-embed] errore (status', response.status, '):', errorText)
    throw new Error('Errore nella generazione embedding')
  }
  const data = await response.json()
  const values = data.embedding?.values
  if (!values) throw new Error('Embedding vuoto dal modello AI')
  return values
}
