import type { Metadata } from 'next'
import { SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Termini e condizioni | AI Toolbox' },
  description: 'Termini e condizioni di utilizzo di AI Toolbox: account, piani e fatturazione, uso consentito, contenuti generati dall’AI, responsabilità.',
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Termini e condizioni', path: '/terms' }])),
        }}
      />
      {children}
    </>
  )
}
