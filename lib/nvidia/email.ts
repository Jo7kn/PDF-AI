// lib/nvidia/email.ts
//
// Client dedicato al modulo Email AI. Migrato da NVIDIA NIM a Gemini (24/07)
// — percorso file invariato, solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_EMAIL_API_KEY =
  process.env.GEMINI_EMAIL_API_KEY ||
  process.env.GEMINI_WRITER_API_KEY ||
  process.env.GEMINI_CODE_API_KEY ||
  process.env.GEMINI_API_KEY

const EMAIL_MODEL = 'gemini-flash-lite-latest'

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
  if (!GEMINI_EMAIL_API_KEY) {
    throw new Error('GEMINI_EMAIL_API_KEY non configurata')
  }

  const needsOriginal = request.action === 'reply' || request.action === 'improve'
  const input = needsOriginal ? request.originalEmail : request.instructions
  if (!input || !input.trim()) {
    throw new Error('Nessun input fornito')
  }

  const { system, user } = buildPrompt(request)

  return generateContent({
    apiKey: GEMINI_EMAIL_API_KEY,
    model: EMAIL_MODEL,
    systemInstruction: system,
    parts: [{ text: user }],
    temperature: 0.5,
    topP: 0.9,
    maxOutputTokens: 2048,
    logLabel: 'email-ai',
  })
}
