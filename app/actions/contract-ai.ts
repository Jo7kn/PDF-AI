// app/actions/contract-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { analyzeContract, extractRiskyClauses } from '@/lib/nvidia/contract'
import { runAiTool } from '@/lib/ai-router'

export async function runContractAnalysis(text: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'contract-ai',
    action: 'analyze',
    run: () => analyzeContract(text),
  })

  if ('error' in routed) return routed
  return { success: true, result: routed.result }
}

export async function runContractClauses(text: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'contract-ai',
    action: 'clauses',
    run: () => extractRiskyClauses(text),
  })

  if ('error' in routed) return routed
  return { success: true, clauses: routed.result }
}
