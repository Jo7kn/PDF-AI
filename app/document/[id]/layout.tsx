import { FileText } from 'lucide-react'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'

// Segmento dinamico [id] rende comunque la route non statica, ma esplicito
// per coerenza con gli altri layout gated (vedi app/tools/ai-writer/layout.tsx).
export const dynamic = 'force-dynamic'

export default async function DocumentLayout({ children }: { children: React.ReactNode }) {
  const pdfAiEnabled = await isFeatureEnabled('pdf-ai')

  if (!pdfAiEnabled) {
    return (
      <ComingSoon
        icon={FileText}
        title="PDF AI"
        description="Stiamo ultimando la chat sui documenti. Torna presto per iniziare a usarla."
      />
    )
  }

  return children
}
