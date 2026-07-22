import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Code AI: Genera e Correggi Codice con l’AI | AI Toolbox' },
  description:
    'Scrivi, debugga e converti codice in decine di linguaggi con Code AI. Spiegazioni chiare, refactoring rapido. Prova gratis.',
  keywords: ['Code AI', 'generatore codice AI', 'debug AI', 'refactoring AI', 'spiegazione codice AI'],
  alternates: { canonical: '/tools/code-ai' },
  openGraph: {
    title: 'Code AI: Genera e Correggi Codice con l’AI | AI Toolbox',
    description: 'Scrivi, debugga e converti codice in decine di linguaggi con Code AI. Spiegazioni chiare, refactoring rapido. Prova gratis.',
    url: '/tools/code-ai',
  },
}

export default function CodeAiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Code AI',
            url: `${SITE_URL}/tools/code-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Scrivi, debugga e converti codice in decine di linguaggi con Code AI. Spiegazioni chiare, refactoring rapido. Prova gratis.',
            featureList: ['Generazione', 'Debug', 'Refactoring', 'Spiegazione', 'Conversione linguaggi'],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              description: 'Incluso nel piano Free con 50 crediti al mese',
            },
            isAccessibleForFree: true,
          }),
        }}
      />
      {children}
    </>
  )
}
