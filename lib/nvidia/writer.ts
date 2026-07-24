// lib/nvidia/writer.ts
//
// Client dedicato al modulo AI Writer. Migrato da NVIDIA NIM a Gemini
// (24/07) — percorso file invariato, solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_WRITER_API_KEY =
  process.env.GEMINI_WRITER_API_KEY || process.env.GEMINI_CODE_API_KEY || process.env.GEMINI_API_KEY

const WRITER_MODEL = 'gemini-flash-latest'

export type WriterAction = 'article' | 'email' | 'blog' | 'summary' | 'proofread' | 'rewrite'

export interface WriterRequest {
  action: WriterAction
  prompt?: string // argomento/istruzioni (article, email, blog) o note aggiuntive (summary, proofread, rewrite)
  text?: string // testo esistente su cui lavorare (summary, proofread, rewrite)
  tone?: string
  length?: string
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
  if (!GEMINI_WRITER_API_KEY) {
    throw new Error('GEMINI_WRITER_API_KEY non configurata')
  }

  const needsText = request.action === 'summary' || request.action === 'proofread' || request.action === 'rewrite'
  const input = needsText ? request.text : request.prompt
  if (!input || !input.trim()) {
    throw new Error('Nessun input fornito')
  }

  const { system, user } = buildPrompt(request)

  return generateContent({
    apiKey: GEMINI_WRITER_API_KEY,
    model: WRITER_MODEL,
    systemInstruction: system,
    parts: [{ text: user }],
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 4096,
    logLabel: 'ai-writer',
  })
}
