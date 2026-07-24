// lib/nvidia/study.ts
//
// Client dedicato al modulo Study AI (flashcard, quiz, tutor, piano di
// studio). Migrato da NVIDIA NIM a Gemini (24/07) — percorso file invariato,
// solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_STUDY_API_KEY = process.env.GEMINI_STUDY_API_KEY || process.env.GEMINI_API_KEY

const STUDY_MODEL = 'gemini-flash-latest'

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
  if (!GEMINI_STUDY_API_KEY) {
    throw new Error('GEMINI_STUDY_API_KEY non configurata')
  }

  return generateContent({
    apiKey: GEMINI_STUDY_API_KEY,
    model: STUDY_MODEL,
    systemInstruction: system,
    parts: [{ text: user }],
    temperature,
    topP: 0.9,
    maxOutputTokens: 4096,
    logLabel: 'study-ai',
  })
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
