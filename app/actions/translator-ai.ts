// app/actions/translator-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { translateText, type TranslateRequest } from '@/lib/nvidia/translator'
import { runAiTool } from '@/lib/ai-router'

export async function runTranslatorAi(input: TranslateRequest) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'translator-ai',
    action: input.targetLanguage,
    run: () => translateText(input),
  })
}
