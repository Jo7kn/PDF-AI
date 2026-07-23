import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Image AI: Genera e Modifica Immagini | AI Toolbox' },
  description:
    'Crea, modifica e migliora immagini con l’intelligenza artificiale. Disponibile dal piano Pro. Scopri Image AI di AI Toolbox.',
  keywords: ['Image AI', 'generatore immagini AI', 'upscaling immagini AI', 'rimozione sfondo AI'],
  alternates: { canonical: '/tools/image-ai' },
  openGraph: {
    title: 'Image AI: Genera e Modifica Immagini | AI Toolbox',
    description: 'Crea, modifica e migliora immagini con l’intelligenza artificiale. Disponibile dal piano Pro. Scopri Image AI di AI Toolbox.',
    url: '/tools/image-ai',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function ImageAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('image-ai')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Image AI',
            url: `${SITE_URL}/tools/image-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Crea, modifica e migliora immagini con l’intelligenza artificiale. Disponibile dal piano Pro. Scopri Image AI di AI Toolbox.',
            featureList: ['Generazione', 'Modifica', 'Upscaling', 'Rimozione sfondo'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('image-ai')) }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Strumenti', path: '/tools' },
              { name: 'Image AI', path: '/tools/image-ai' },
            ])
          ),
        }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="image-ai" />
      ) : (
        children
      )}
    </>
  )
}
