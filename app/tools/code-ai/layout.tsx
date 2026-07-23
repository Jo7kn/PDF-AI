import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

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
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

// Vedi commento in app/tools/ai-writer/layout.tsx: tetto Vercel Hobby per la
// Server Action del tool.
export const maxDuration = 120

export default async function CodeAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('code-ai')

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
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('code-ai')) }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Strumenti', path: '/tools' },
              { name: 'Code AI', path: '/tools/code-ai' },
            ])
          ),
        }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="code-ai" />
      ) : (
        children
      )}
    </>
  )
}
