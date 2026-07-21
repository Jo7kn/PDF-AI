// app/actions/code-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { runCodeAssistant, type CodeAction } from '@/lib/nvidia/code'
import { runAiTool } from '@/lib/ai-router'

export interface RunCodeAiInput {
  action: CodeAction
  code?: string
  prompt?: string
  language?: string
  targetLanguage?: string
}

export async function runCodeAi(input: RunCodeAiInput) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  if (input.action === 'convert' && (!input.language || !input.targetLanguage)) {
    return { error: 'Seleziona sia il linguaggio di partenza che quello di destinazione' }
  }

  return runAiTool({
    userId: user.id,
    tool: 'code-ai',
    action: input.action,
    run: () => runCodeAssistant(input),
  })
}
