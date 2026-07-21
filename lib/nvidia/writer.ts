// lib/nvidia/writer.ts
//
// Client NVIDIA NIM dedicato al modulo AI Writer. Su richiesta esplicita
// riusa la stessa key di Code AI (NVIDIA_CODE_API_KEY) invece di richiederne
// una nuova; resta comunque possibile assegnargliene una dedicata in futuro
// impostando NVIDIA_WRITER_API_KEY, senza toccare questo file.

const NVIDIA_WRITER_API_KEY =
  process.env.NVIDIA_WRITER_API_KEY || process.env.NVIDIA_CODE_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const WRITER_MODEL = 'meta/llama-3.3-70b-instruct'

export type WriterAction = 'article' | 'email' | 'blog' | 'summary' | 'proofread' | 'rewrite'

export interface WriterRequest {
  action: WriterAction
  prompt?: string // argomento/istruzioni (article, email, blog) o note aggiuntive (summary, proofread, rewrite)
  text?: string // testo esistente su cui lavorare (summary, proofread, rewrite)
  tone?: string
  length?: string
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
      console.warn(`[ai-writer] tentativo ${attempt + 1} fallito con status ${response.status}, riprovo...`)
    } catch (error) {
      clearTimeout(timeout)
      if (attempt === retries) throw error
      console.warn(`[ai-writer] tentativo ${attempt + 1} fallito, riprovo...`, error)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  throw new Error('fetchWithRetry failed unexpectedly')
}

function buildPrompt({ action, prompt, text, tone, length }: WriterRequest): { system: string; user: string } {
  const toneNote = tone ? ` Usa un tono ${tone.toLowerCase()}.` : ''
  const lengthNote = length ? ` Lunghezza: ${length.toLowerCase()}.` : ''

  switch (action) {
    case 'article':
      return {
        system:
          'Sei un giornalista e copywriter professionista. Scrivi un articolo ben strutturato (titolo, ' +
          'introduzione, corpo con paragrafi, conclusione) in italiano sul tema richiesto.' +
          `${toneNote}${lengthNote} Rispondi in Markdown, senza premesse o commenti fuori dal testo.`,
        user: prompt || '',
      }
    case 'email':
      return {
        system:
          'Sei un assistente per la corrispondenza professionale. Scrivi una email completa (oggetto, saluto, ' +
          `corpo, chiusura) in italiano in base alla richiesta.${toneNote} Rispondi solo con l'email, senza commenti.`,
        user: prompt || '',
      }
    case 'blog':
      return {
        system:
          'Sei un content writer esperto di blog. Scrivi un post da blog coinvolgente in italiano, con titolo ' +
          `accattivante, sottotitoli e paragrafi scorrevoli, in Markdown.${toneNote}${lengthNote} Nessuna premessa.`,
        user: prompt || '',
      }
    case 'summary':
      return {
        system:
          'Riassumi il testo fornito in italiano in modo chiaro e conciso, mantenendo i punti chiave e il senso ' +
          `originale.${lengthNote} Rispondi solo con il riassunto.`,
        user: prompt ? `${text}\n\nIstruzioni aggiuntive:\n${prompt}` : text || '',
      }
    case 'proofread':
      return {
        system:
          'Sei un correttore di bozze professionista. Correggi errori grammaticali, ortografici, di ' +
          'punteggiatura e di sintassi nel testo fornito, mantenendo stile e significato originali. Rispondi ' +
          'solo con il testo corretto, senza spiegazioni.',
        user: text || '',
      }
    case 'rewrite':
      return {
        system:
          'Riscrivi il testo fornito in italiano migliorandone chiarezza, scorrevolezza e impatto, mantenendo il ' +
          `significato originale.${toneNote} Rispondi solo con il testo riscritto.`,
        user: prompt ? `${text}\n\nIstruzioni aggiuntive:\n${prompt}` : text || '',
      }
    default:
      throw new Error(`Azione non supportata: ${action}`)
  }
}

export async function runWriterAssistant(request: WriterRequest): Promise<string> {
  if (!NVIDIA_WRITER_API_KEY) {
    throw new Error('NVIDIA_WRITER_API_KEY non configurata')
  }

  const needsText = request.action === 'summary' || request.action === 'proofread' || request.action === 'rewrite'
  const input = needsText ? request.text : request.prompt
  if (!input || !input.trim()) {
    throw new Error('Nessun input fornito')
  }

  const { system, user } = buildPrompt(request)

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_WRITER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: WRITER_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4096,
      }),
    },
    2,
    60000,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[ai-writer] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content

  if (!result) {
    throw new Error('Risposta vuota dal modello AI')
  }

  return result
}
