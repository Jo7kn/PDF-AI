import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'

// Segmento dinamico [id] rende comunque la route non statica, ma esplicito
// per coerenza con gli altri layout gated (vedi app/tools/ai-writer/layout.tsx).
export const dynamic = 'force-dynamic'

// Non c'era mai stato un maxDuration qui, a differenza degli altri tool —
// stesso rischio di timeout su chat/OCR con NVIDIA (vedi
// lib/nvidia/fetch-with-retry.ts), ora anche più probabile dopo l'upgrade
// del modello di chat a llama-3.3-nemotron-super-49b-v1.5.
export const maxDuration = 240

export default async function DocumentLayout({ children }: { children: React.ReactNode }) {
  const pdfAiEnabled = await isFeatureEnabled('pdf-ai')

  if (!pdfAiEnabled) {
    return <ComingSoon variant="document" />
  }

  return children
}
