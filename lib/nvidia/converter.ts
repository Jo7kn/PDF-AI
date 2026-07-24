// lib/nvidia/converter.ts
//
// Client dedicato alle conversioni testuali di File Converter (Markdown/HTML/
// testo semplice). Migrato da NVIDIA NIM a Gemini (24/07) — percorso file
// invariato, solo il provider sotto e' cambiato. Le conversioni binarie
// (PDF, immagini) restano deterministiche altrove (pdf-parse, sharp): qui il
// modello serve solo per riformattare testo strutturato tra formati testuali.

import { generateContent } from '../gemini-client'

const GEMINI_CONVERTER_API_KEY =
  process.env.GEMINI_CONVERTER_API_KEY || process.env.GEMINI_CODE_API_KEY || process.env.GEMINI_API_KEY

const CONVERTER_MODEL = 'gemini-flash-lite-latest'

export type TextFormat = 'markdown' | 'html' | 'testo semplice'

export async function convertTextFormat(text: string, from: TextFormat, to: TextFormat): Promise<string> {
  if (!GEMINI_CONVERTER_API_KEY) {
    throw new Error('GEMINI_CONVERTER_API_KEY non configurata')
  }
  if (!text.trim()) {
    throw new Error('Nessun testo da convertire')
  }

  const system =
    `Sei un convertitore di formati testuali. Converti il testo fornito da ${from} a ${to}, mantenendo il ` +
    'contenuto e la struttura (titoli, elenchi, enfasi, link, tabelle) il più fedelmente possibile nelle ' +
    `convenzioni di ${to}. Rispondi SOLO con il testo convertito, senza premesse, senza blocchi di codice markdown ` +
    'che avvolgono la risposta, senza commenti.'

  const result = await generateContent({
    apiKey: GEMINI_CONVERTER_API_KEY,
    model: CONVERTER_MODEL,
    systemInstruction: system,
    parts: [{ text: text.slice(0, 20000) }],
    temperature: 0.1,
    topP: 0.9,
    maxOutputTokens: 4096,
    logLabel: 'file-converter',
  })

  return result.replace(/^```[a-z]*\n|```$/g, '').trim()
}
