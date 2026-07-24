// lib/nvidia/chat.ts
//
// Client dedicato a Chat AI generale (conversazione multi-turno libera,
// senza contesto documento). Migrato da NVIDIA NIM a Gemini (24/07) —
// percorso file invariato, solo il provider sotto e' cambiato. Gemini usa
// role:"model" per il turno AI nella history, non "assistant" come le API
// OpenAI-compatibili — da qui la mappatura sotto.

import { generateContent, type GeminiTurn } from '../gemini-client'

const GEMINI_CHAT_API_KEY = process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY

const CHAT_MODEL = 'gemini-flash-lite-latest'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function runGeneralChat(messages: ChatMessage[]): Promise<string> {
  if (!GEMINI_CHAT_API_KEY) {
    throw new Error('GEMINI_CHAT_API_KEY non configurata')
  }
  if (!messages.length) {
    throw new Error('Nessun messaggio da inviare')
  }

  const systemPrompt =
    'Sei un assistente AI generico, utile, onesto e diretto. Rispondi in italiano (a meno che l\'utente scriva ' +
    'in un\'altra lingua) in modo chiaro e conciso, usando Markdown quando aiuta la leggibilità (elenchi, ' +
    'blocchi di codice, grassetto). Se non sai qualcosa, dillo invece di inventare.'

  const contents: GeminiTurn[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  return generateContent({
    apiKey: GEMINI_CHAT_API_KEY,
    model: CHAT_MODEL,
    systemInstruction: systemPrompt,
    contents,
    temperature: 0.6,
    topP: 0.95,
    maxOutputTokens: 2048,
    logLabel: 'chat-ai',
  })
}
