// lib/nvidia/email.ts
//
// Client NVIDIA NIM dedicato al modulo Email AI. E' un task testuale della
// stessa famiglia di AI Writer (generazione/miglioramento di testo), quindi
// riusa la stessa key per contesto invece di richiederne una nuova; resta
// comunque possibile assegnargliene una dedicata impostando NVIDIA_EMAIL_API_KEY.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_EMAIL_API_KEY =
  process.env.NVIDIA_EMAIL_API_KEY ||
  process.env.NVIDIA_WRITER_API_KEY ||
  process.env.NVIDIA_CODE_API_KEY ||
  process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const EMAIL_MODEL = 'meta/llama-3.3-70b-instruct'

export type EmailAction = 'compose' | 'reply' | 'improve'

export interface EmailRequest {
  action: EmailAction
  instructions?: string // compose: cosa scrivere. reply/improve: istruzioni facoltative aggiuntive
  originalEmail?: string // reply: l'email a cui rispondere. improve: il testo da migliorare
  tone?: string
}

function buildPrompt({ action, instructions, originalEmail, tone }: EmailRequest): { system: string; user: string } {
  const toneNote = tone ? ` Usa un tono ${tone.toLowerCase()}.` : ''

  switch (action) {
    case 'compose':
      return {
        system:
          'Sei un assistente per la corrispondenza professionale. Scrivi una email completa (oggetto, saluto, ' +
          `corpo, chiusura) in italiano in base alla richiesta.${toneNote} Rispondi solo con l'email, senza commenti.`,
        user: instructions || '',
      }
    case 'reply':
      return {
        system:
          'Sei un assistente per la corrispondenza professionale. Leggi l\'email ricevuta e scrivi una risposta ' +
          `completa (oggetto "Re:", saluto, corpo, chiusura) in italiano.${toneNote} Rispondi solo con la risposta, ` +
          'senza ripetere il testo originale e senza commenti.',
        user: instructions ? `Email ricevuta:\n${originalEmail}\n\nIstruzioni per la risposta:\n${instructions}` : `Email ricevuta:\n${originalEmail}`,
      }
    case 'improve':
      return {
        system:
          'Sei un editor di corrispondenza professionale. Migliora chiarezza, tono e correttezza dell\'email ' +
          `fornita, mantenendone il significato.${toneNote} Rispondi solo con l'email migliorata, senza commenti.`,
        user: instructions ? `${originalEmail}\n\nIstruzioni aggiuntive:\n${instructions}` : originalEmail || '',
      }
    default:
      throw new Error(`Azione non supportata: ${action}`)
  }
}

export async function runEmailAssistant(request: EmailRequest): Promise<string> {
  if (!NVIDIA_EMAIL_API_KEY) {
    throw new Error('NVIDIA_EMAIL_API_KEY non configurata')
  }

  const needsOriginal = request.action === 'reply' || request.action === 'improve'
  const input = needsOriginal ? request.originalEmail : request.instructions
  if (!input || !input.trim()) {
    throw new Error('Nessun input fornito')
  }

  const { system, user } = buildPrompt(request)

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMAIL_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.5,
        top_p: 0.9,
        max_tokens: 2048,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[email-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content

  if (!result) {
    throw new Error('Risposta vuota dal modello AI')
  }

  return result
}
