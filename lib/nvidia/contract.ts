// lib/nvidia/contract.ts
//
// Client NVIDIA NIM dedicato al modulo Contract AI. Stesso dominio di PDF AI
// (analisi di documenti), quindi riusa la key principale invece di richiederne
// una nuova.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_CONTRACT_API_KEY = process.env.NVIDIA_CONTRACT_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const CONTRACT_MODEL = 'meta/llama-3.3-70b-instruct'

export interface ContractClause {
  clause: string
  risk: 'basso' | 'medio' | 'alto'
  explanation: string
}

async function callModel(system: string, user: string, temperature: number): Promise<string> {
  if (!NVIDIA_CONTRACT_API_KEY) {
    throw new Error('NVIDIA_CONTRACT_API_KEY non configurata')
  }

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_CONTRACT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CONTRACT_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        top_p: 0.9,
        max_tokens: 4096,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[contract-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content
  if (!result) throw new Error('Risposta vuota dal modello AI')
  return result
}

export async function analyzeContract(text: string): Promise<string> {
  if (!text.trim()) throw new Error('Incolla il testo del contratto da analizzare')

  const system =
    'Sei un assistente legale esperto in analisi contrattuale (non fornisci consulenza legale vincolante). ' +
    'Analizza il contratto fornito in italiano e produci, in Markdown: 1) un riassunto delle parti e ' +
    "dell'oggetto del contratto, 2) le obbligazioni principali di ciascuna parte, 3) le clausole più rilevanti, " +
    '4) i rischi principali per chi firma, 5) eventuali punti poco chiari o che meritano attenzione legale. ' +
    'Sii concreto e specifico, citando le clausole rilevanti.'

  return callModel(system, text.slice(0, 20000), 0.3)
}

export async function extractRiskyClauses(text: string): Promise<ContractClause[]> {
  if (!text.trim()) throw new Error('Incolla il testo del contratto da analizzare')

  const system =
    'Sei un assistente legale esperto in analisi contrattuale. Individua le clausole più rilevanti o rischiose ' +
    'nel contratto fornito (in italiano). Rispondi SOLO con un array JSON valido, senza markdown fences, nel ' +
    'formato: [{"clause": "testo/riferimento breve della clausola", "risk": "basso|medio|alto", ' +
    '"explanation": "perché è rilevante o rischiosa"}]. Includi al massimo 10 clausole, le più significative.'

  const raw = await callModel(system, text.slice(0, 20000), 0.2)
  const cleaned = raw.replace(/```json\s*|```/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed)) throw new Error('non è un array')
    return parsed as ContractClause[]
  } catch {
    throw new Error('Il modello non ha restituito un elenco di clausole valido, riprova')
  }
}
