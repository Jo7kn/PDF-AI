import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

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
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function ContractAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('contract-ai')

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
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('contract-ai')) }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="contract-ai" />
      ) : (
        children
      )}
    </>
  )
}
