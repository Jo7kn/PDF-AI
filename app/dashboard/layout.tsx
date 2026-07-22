// app/dashboard/layout.tsx
//
// Server Component: legge il flag 'pdf-ai' da Supabase (vedi
// lib/feature-flags.ts) e decide se montare la vera dashboard o mostrare
// Coming Soon. La shell interattiva vera e propria è in
// components/dashboard-shell.tsx (client component).

import { FileText } from 'lucide-react'
import { ComingSoon } from '@/components/coming-soon'
import { DashboardShell } from '@/components/dashboard-shell'
import { isFeatureEnabled } from '@/lib/feature-flags'

// Senza questo, Next.js prerenderizza la pagina a build time e il flag
// 'pdf-ai' resterebbe congelato al valore letto in quel momento — il
// toggle dell'admin non avrebbe effetto finché non si rifà il deploy.
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pdfAiEnabled = await isFeatureEnabled('pdf-ai')

  if (!pdfAiEnabled) {
    return (
      <ComingSoon
        icon={FileText}
        title="PDF AI e la tua area personale"
        description="Stiamo ultimando la workspace, gli strumenti AI e l'abbonamento. Torna presto per iniziare a usarli."
      />
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}
