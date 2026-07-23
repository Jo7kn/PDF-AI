// lib/nvidia/study.ts
//
// Client NVIDIA NIM dedicato al modulo Study AI (flashcard, quiz, tutor,
// piano di studio). Riusa la key di PDF AI: stesso dominio (contenuti
// didattici a partire da testo/argomenti), key gia' verificata e con la
// quota piu' ampia sull'account.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_STUDY_API_KEY = process.env.NVIDIA_STUDY_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1'

const STUDY_MODEL = 'meta/llama-3.3-70b-instruct'

export type StudyAction = 'flashcards' | 'quiz' | 'tutor' | 'plan'

export interface StudyRequest {
  action: StudyAction
  topic: string // argomento/testo di partenza, o la domanda per il tutor
  count?: number // numero di flashcard/domande quiz
}

export interface Flashcard {
  question: string
  answer: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

async function callModel(system: string, user: string, temperature: number): Promise<string> {
  if (!NVIDIA_STUDY_API_KEY) {
    throw new Error('NVIDIA_STUDY_API_KEY non configurata')
  }

  const response = await fetchWithRetry(
    `${NVIDIA_BASE_URL}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_STUDY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: STUDY_MODEL,
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
    console.error(`[study-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Il modello AI non ha risposto correttamente. Riprova tra poco.')
  }

  const data = await response.json()
  const result = data.choices?.[0]?.message?.content
  if (!result) throw new Error('Risposta vuota dal modello AI')
  return result
}

function parseJsonArray<T>(raw: string): T[] {
  const cleaned = raw.replace(/```json\s*|```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('Risposta non è un array JSON')
  return parsed as T[]
}

export async function generateFlashcards(topic: string, count = 8): Promise<Flashcard[]> {
  if (!topic.trim()) throw new Error('Indica un argomento o incolla del testo')

  const system =
    `Sei un tutor esperto. Genera ESATTAMENTE ${count} flashcard di studio (domanda/risposta) in italiano ` +
    'sull\'argomento o sul testo fornito. Rispondi SOLO con un array JSON valido, senza markdown fences, nel ' +
    'formato: [{"question": "...", "answer": "..."}]. Domande chiare, risposte concise ma complete.'

  const raw = await callModel(system, topic, 0.5)
  try {
    return parseJsonArray<Flashcard>(raw)
  } catch {
    throw new Error('Il modello non ha restituito flashcard valide, riprova')
  }
}

export async function generateQuiz(topic: string, count = 5): Promise<QuizQuestion[]> {
  if (!topic.trim()) throw new Error('Indica un argomento o incolla del testo')

  const system =
    `Sei un tutor esperto. Genera ESATTAMENTE ${count} domande a risposta multipla in italiano sull'argomento o ` +
    'sul testo fornito, ciascuna con 4 opzioni, una sola corretta, e una breve spiegazione. Rispondi SOLO con un ' +
    'array JSON valido, senza markdown fences, nel formato: [{"question": "...", "options": ["...","...","...","..."], ' +
    '"correctIndex": 0, "explanation": "..."}]. "correctIndex" è l\'indice (0-3) dell\'opzione corretta in "options".'

  const raw = await callModel(system, topic, 0.4)
  try {
    return parseJsonArray<QuizQuestion>(raw)
  } catch {
    throw new Error('Il modello non ha restituito un quiz valido, riprova')
  }
}

export async function askTutor(question: string): Promise<string> {
  if (!question.trim()) throw new Error('Scrivi una domanda o un concetto da capire')

  const system =
    'Sei un tutor paziente e didattico. Spiega il concetto o rispondi alla domanda in italiano in modo chiaro, ' +
    'con esempi concreti quando utile, adattando il livello di dettaglio alla domanda. Usa Markdown per strutturare ' +
    'la risposta (elenchi, grassetto) quando aiuta la comprensione.'

  return callModel(system, question, 0.6)
}

export async function generateStudyPlan(goal: string): Promise<string> {
  if (!goal.trim()) throw new Error('Descrivi il tuo obiettivo di studio')

  const system =
    'Sei un tutor esperto di metodo di studio. Crea un piano di studio dettagliato e realistico in italiano, in ' +
    'Markdown, con tappe/settimane, obiettivi per ciascuna tappa e consigli pratici, in base all\'obiettivo e al ' +
    'tempo a disposizione descritti dall\'utente.'

  return callModel(system, goal, 0.6)
}
