// app/actions/chat-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { runGeneralChat, type ChatMessage } from '@/lib/nvidia/chat'
import { runAiTool } from '@/lib/ai-router'

export async function runChatAi(messages: ChatMessage[]) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'chat-ai',
    run: () => runGeneralChat(messages),
  })
}
