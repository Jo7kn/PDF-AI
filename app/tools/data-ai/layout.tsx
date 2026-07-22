import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Data AI: Analizza CSV ed Excel con l’AI | AI Toolbox' },
  description:
    'Trasforma CSV ed Excel in dashboard e grafici con l’intelligenza artificiale. Disponibile dal piano Pro. Prova Data AI.',
  keywords: ['Data AI', 'analisi CSV AI', 'analisi Excel AI', 'dashboard automatica AI'],
  alternates: { canonical: '/tools/data-ai' },
  openGraph: {
    title: 'Data AI: Analizza CSV ed Excel con l’AI | AI Toolbox',
    description: 'Trasforma CSV ed Excel in dashboard e grafici con l’intelligenza artificiale. Disponibile dal piano Pro. Prova Data AI.',
    url: '/tools/data-ai',
  },
}

export default function DataAiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Data AI',
            url: `${SITE_URL}/tools/data-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Trasforma CSV ed Excel in dashboard e grafici con l’intelligenza artificiale. Disponibile dal piano Pro. Prova Data AI.',
            featureList: ['Analisi CSV', 'Analisi Excel', 'Dashboard', 'Grafici'],
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
