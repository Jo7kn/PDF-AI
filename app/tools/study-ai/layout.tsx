import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Study AI: Flashcard e Quiz con l’AI | AI Toolbox' },
  description:
    'Studia più in fretta con flashcard, quiz e un tutor AI su misura. Disponibile dal piano Pro. Scopri Study AI di AI Toolbox.',
  keywords: ['Study AI', 'tutor AI', 'flashcard AI', 'quiz AI', 'piano di studio AI'],
  alternates: { canonical: '/tools/study-ai' },
  openGraph: {
    title: 'Study AI: Flashcard e Quiz con l’AI | AI Toolbox',
    description: 'Studia più in fretta con flashcard, quiz e un tutor AI su misura. Disponibile dal piano Pro. Scopri Study AI di AI Toolbox.',
    url: '/tools/study-ai',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function StudyAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('study-ai')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Study AI',
            url: `${SITE_URL}/tools/study-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Studia più in fretta con flashcard, quiz e un tutor AI su misura. Disponibile dal piano Pro. Scopri Study AI di AI Toolbox.',
            featureList: ['Flashcard', 'Quiz', 'Tutor AI', 'Piano di studio'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('study-ai')) }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Strumenti', path: '/tools' },
              { name: 'Study AI', path: '/tools/study-ai' },
            ])
          ),
        }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="study-ai" />
      ) : (
        children
      )}
    </>
  )
}
