// lib/nvidia/contract.ts
//
// Client dedicato al modulo Contract AI. Migrato da NVIDIA NIM a Gemini
// (24/07) — percorso file invariato, solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_CONTRACT_API_KEY =
  process.env.GEMINI_CONTRACT_API_KEY || process.env.GEMINI_CODE_API_KEY || process.env.GEMINI_API_KEY

const CONTRACT_MODEL = 'gemini-flash-latest'

export interface ContractClause {
  clause: string
  risk: 'basso' | 'medio' | 'alto'
  explanation: string
}

async function callModel(system: string, user: string, temperature: number): Promise<string> {
  if (!GEMINI_CONTRACT_API_KEY) {
    throw new Error('GEMINI_CONTRACT_API_KEY non configurata')
  }

  return generateContent({
    apiKey: GEMINI_CONTRACT_API_KEY,
    model: CONTRACT_MODEL,
    systemInstruction: system,
    parts: [{ text: user }],
    temperature,
    topP: 0.9,
    maxOutputTokens: 4096,
    logLabel: 'contract-ai',
  })
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
