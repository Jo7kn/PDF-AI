import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Contract AI: Analizza Contratti con l’AI | AI Toolbox' },
  description:
    'Individua clausole a rischio e ottieni riassunti di contratti con l’AI. Disponibile dal piano Pro. Scopri Contract AI.',
  keywords: ['Contract AI', 'analisi contratti AI', 'clausole a rischio AI', 'riassunto contratti AI'],
  alternates: { canonical: '/tools/contract-ai' },
  openGraph: {
    title: 'Contract AI: Analizza Contratti con l’AI | AI Toolbox',
    description: 'Individua clausole a rischio e ottieni riassunti di contratti con l’AI. Disponibile dal piano Pro. Scopri Contract AI.',
    url: '/tools/contract-ai',
  },
}

export default function ContractAiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Contract AI',
            url: `${SITE_URL}/tools/contract-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Individua clausole a rischio e ottieni riassunti di contratti con l’AI. Disponibile dal piano Pro. Scopri Contract AI.',
            featureList: ['Analisi contratti', 'Individuazione clausole', 'Riassunti', 'Rischi'],
            offers: {
              '@type': 'Offer',
              price: '19',
              priceCurrency: 'EUR',
              description: 'Disponibile dal piano Pro, 1000 crediti al mese a €19/mese',
            },
            isAccessibleForFree: false,
          }),
        }}
      />
      {children}
    </>
  )
}
