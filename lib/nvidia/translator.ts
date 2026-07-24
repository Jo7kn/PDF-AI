// lib/nvidia/translator.ts
//
// Client dedicato al modulo Translator AI. Migrato da NVIDIA NIM a Gemini
// (24/07) — percorso file invariato, solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_TRANSLATOR_API_KEY = process.env.GEMINI_TRANSLATOR_API_KEY || process.env.GEMINI_API_KEY

const TRANSLATE_MODEL = 'gemini-flash-latest'

export interface TranslateRequest {
  text: string
  targetLanguage: string
  sourceLanguage?: string // 'Rileva automaticamente' se omesso
}

export async function translateText(request: TranslateRequest): Promise<string> {
  if (!GEMINI_TRANSLATOR_API_KEY) {
    throw new Error('GEMINI_TRANSLATOR_API_KEY non configurata')
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

  return generateContent({
    apiKey: GEMINI_TRANSLATOR_API_KEY,
    model: TRANSLATE_MODEL,
    systemInstruction: systemPrompt,
    parts: [{ text: request.text }],
    temperature: 0.2,
    topP: 0.9,
    maxOutputTokens: 4096,
    logLabel: 'translator-ai',
  })
}
