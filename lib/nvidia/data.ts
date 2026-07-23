// lib/nvidia/data.ts
//
// Client NVIDIA NIM dedicato al modulo Data AI. Il parsing CSV e le statistiche
// di base restano deterministici (calcolati nella UI), il modello genera solo
// il commento/insight narrativo a partire da un riassunto compatto dei dati.
// Riusa la key di Code AI: analisi dati e' un compito analitico/strutturato
// della stessa famiglia.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_DATA_API_KEY =
  process.env.NVIDIA_DATA_API_KEY || process.env.NVIDIA_CODE_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const DATA_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning'

export async function generateDataInsights(datasetSummary: string): Promise<string> {
  if (!NVIDIA_DATA_API_KEY) {
    throw new Error('NVIDIA_DATA_API_KEY non configurata')
  }
  if (!datasetSummary.trim()) {
    throw new Error('Nessun dato da analizzare')
  }

  const system =
    'Sei un data analyst esperto. Ti viene fornito un riassunto strutturato di un dataset CSV (colonne, tipi, ' +
    'statistiche di base, alcune righe di esempio). Scrivi in italiano, in Markdown, 4-6 osservazioni concrete e ' +
    'utili: pattern, anomalie, colonne correlate plausibili, suggerimenti su cosa approfondire. Non inventare ' +
    'numeri che non sono nel riassunto: basati solo sui dati forniti. Sii specifico, non generico.'

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_DATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DATA_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: datasetSummary.slice(0, 12000) },
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2048,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[data-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content
  if (!result) throw new Error('Risposta vuota dal modello AI')
  return result
}
