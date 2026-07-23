// lib/nvidia/converter.ts
//
// Client NVIDIA NIM dedicato alle conversioni testuali di File Converter
// (Markdown/HTML/testo semplice). Le conversioni binarie (PDF, immagini)
// restano deterministiche altrove (pdf-parse, sharp): qui il modello serve
// solo per riformattare testo strutturato tra formati testuali.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_CONVERTER_API_KEY =
  process.env.NVIDIA_CONVERTER_API_KEY || process.env.NVIDIA_CODE_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const CONVERTER_MODEL = 'meta/llama-3.3-70b-instruct'

export type TextFormat = 'markdown' | 'html' | 'testo semplice'

export async function convertTextFormat(text: string, from: TextFormat, to: TextFormat): Promise<string> {
  if (!NVIDIA_CONVERTER_API_KEY) {
    throw new Error('NVIDIA_CONVERTER_API_KEY non configurata')
  }
  if (!text.trim()) {
    throw new Error('Nessun testo da convertire')
  }

  const system =
    `Sei un convertitore di formati testuali. Converti il testo fornito da ${from} a ${to}, mantenendo il ` +
    'contenuto e la struttura (titoli, elenchi, enfasi, link, tabelle) il più fedelmente possibile nelle ' +
    `convenzioni di ${to}. Rispondi SOLO con il testo convertito, senza premesse, senza blocchi di codice markdown ` +
    'che avvolgono la risposta, senza commenti.'

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_CONVERTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CONVERTER_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text.slice(0, 20000) },
        ],
        temperature: 0.1,
        top_p: 0.9,
        max_tokens: 4096,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[file-converter] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content
  if (!result) throw new Error('Risposta vuota dal modello AI')
  return result.replace(/^```[a-z]*\n|```$/g, '').trim()
}
