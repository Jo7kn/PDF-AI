// app/actions/study-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { generateFlashcards, generateQuiz, askTutor, generateStudyPlan } from '@/lib/nvidia/study'
import { runAiTool } from '@/lib/ai-router'

export async function runStudyFlashcards(topic: string, count?: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'study-ai',
    action: 'flashcards',
    run: () => generateFlashcards(topic, count),
  })

  if ('error' in routed) return routed
  return { success: true, flashcards: routed.result }
}

export async function runStudyQuiz(topic: string, count?: number) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'study-ai',
    action: 'quiz',
    run: () => generateQuiz(topic, count),
  })

  if ('error' in routed) return routed
  return { success: true, questions: routed.result }
}

export async function runStudyTutor(question: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'study-ai',
    action: 'tutor',
    run: () => askTutor(question),
  })

  if ('error' in routed) return routed
  return { success: true, answer: routed.result }
}

export async function runStudyPlan(goal: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'study-ai',
    action: 'plan',
    run: () => generateStudyPlan(goal),
  })

  if ('error' in routed) return routed
  return { success: true, plan: routed.result }
}
