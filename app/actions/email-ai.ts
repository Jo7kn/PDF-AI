// app/actions/email-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { runEmailAssistant, type EmailRequest } from '@/lib/nvidia/email'
import { runAiTool } from '@/lib/ai-router'

export async function runEmailAi(input: EmailRequest) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'email-ai',
    action: input.action,
    run: () => runEmailAssistant(input),
  })
}
