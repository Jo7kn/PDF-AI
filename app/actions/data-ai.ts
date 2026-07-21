// app/actions/data-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { generateDataInsights } from '@/lib/nvidia/data'
import { runAiTool } from '@/lib/ai-router'

export async function runDataInsights(datasetSummary: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'data-ai',
    run: () => generateDataInsights(datasetSummary),
  })
}
