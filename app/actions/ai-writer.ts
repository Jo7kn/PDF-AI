// app/actions/ai-writer.ts
'use server'

import { getCurrentUser } from './auth'
import { runWriterAssistant, type WriterAction } from '@/lib/nvidia/writer'
import { runAiTool } from '@/lib/ai-router'

export interface RunAiWriterInput {
  action: WriterAction
  prompt?: string
  text?: string
  tone?: string
  length?: string
}

export async function runAiWriter(input: RunAiWriterInput) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'ai-writer',
    action: input.action,
    run: () => runWriterAssistant(input),
  })
}
