// app/actions/image-ai.ts
'use server'

import { getCurrentUser } from './auth'
import { generateImage, type ImageAspect } from '@/lib/nvidia/image'
import { runAiTool } from '@/lib/ai-router'

export interface RunImageAiInput {
  prompt: string
  negativePrompt?: string
  aspect?: ImageAspect
}

export async function runImageAi(input: RunImageAiInput) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const routed = await runAiTool({
    userId: user.id,
    tool: 'image-ai',
    action: input.aspect,
    run: () => generateImage(input),
  })

  if ('error' in routed) return routed
  return { success: true, dataUrl: routed.result.dataUrl, seed: routed.result.seed }
}
