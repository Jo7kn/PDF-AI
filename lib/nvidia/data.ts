// lib/nvidia/data.ts
//
// Client dedicato al modulo Data AI. Migrato da NVIDIA NIM a Gemini (24/07)
// — percorso file invariato, solo il provider sotto e' cambiato. Il parsing
// CSV e le statistiche di base restano deterministici (calcolati nella UI),
// il modello genera solo il commento/insight narrativo.

import { generateContent } from '../gemini-client'

const GEMINI_DATA_API_KEY =
  process.env.GEMINI_DATA_API_KEY || process.env.GEMINI_CODE_API_KEY || process.env.GEMINI_API_KEY

const DATA_MODEL = 'gemini-flash-latest'

export async function generateDataInsights(datasetSummary: string): Promise<string> {
  if (!GEMINI_DATA_API_KEY) {
    throw new Error('GEMINI_DATA_API_KEY non configurata')
  }
  if (!datasetSummary.trim()) {
    throw new Error('Nessun dato da analizzare')
  }

  const system =
    'Sei un data analyst esperto. Ti viene fornito un riassunto strutturato di un dataset CSV (colonne, tipi, ' +
    'statistiche di base, alcune righe di esempio). Scrivi in italiano, in Markdown, 4-6 osservazioni concrete e ' +
    'utili: pattern, anomalie, colonne correlate plausibili, suggerimenti su cosa approfondire. Non inventare ' +
    'numeri che non sono nel riassunto: basati solo sui dati forniti. Sii specifico, non generico.'

  return generateContent({
    apiKey: GEMINI_DATA_API_KEY,
    model: DATA_MODEL,
    systemInstruction: system,
    parts: [{ text: datasetSummary.slice(0, 12000) }],
    temperature: 0.3,
    topP: 0.9,
    maxOutputTokens: 2048,
    logLabel: 'data-ai',
  })
}
