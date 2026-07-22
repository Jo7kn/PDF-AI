// app/dashboard/billing/layout.tsx
//
// Gate indipendente dal resto di /dashboard (che controlla 'pdf-ai'): così
// l'admin può riaprire la workspace senza per forza riaprire anche i
// pagamenti, e viceversa.

import { CreditCard } from 'lucide-react'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'

// Senza questo, Next.js prerenderizza la pagina a build time e il flag
// 'payments' resterebbe congelato al valore letto in quel momento — il
// toggle dell'admin non avrebbe effetto finché non si rifà il deploy.
export const dynamic = 'force-dynamic'

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  const paymentsEnabled = await isFeatureEnabled('payments')

  if (!paymentsEnabled) {
    return (
      <ComingSoon
        icon={CreditCard}
        title="Abbonamenti e pagamenti"
        description="Stiamo ultimando il sistema di pagamento. Torna presto per attivare il tuo piano."
      />
    )
  }

  return children
}
