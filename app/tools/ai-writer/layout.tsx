import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'AI Writer: Scrivi Articoli e Blog con l’AI | AI Toolbox' },
  description:
    'Genera, correggi e riscrivi articoli, email e blog in pochi secondi con AI Writer. Prova gratis i tuoi primi contenuti AI.',
  keywords: ['AI Writer', 'scrittura AI', 'generatore articoli AI', 'generatore blog AI', 'correzione testi AI'],
  alternates: { canonical: '/tools/ai-writer' },
  openGraph: {
    title: 'AI Writer: Scrivi Articoli e Blog con l’AI | AI Toolbox',
    description: 'Genera, correggi e riscrivi articoli, email e blog in pochi secondi con AI Writer. Prova gratis i tuoi primi contenuti AI.',
    url: '/tools/ai-writer',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Senza questo, Next.js prerenderizza la pagina a build time e il flag
// 'ai-writer' resterebbe congelato al valore letto in quel momento — il
// toggle dell'admin non avrebbe effetto finché non si rifà il deploy.
export const dynamic = 'force-dynamic'

export default async function AiWriterLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('ai-writer')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Writer',
            url: `${SITE_URL}/tools/ai-writer`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Genera, correggi e riscrivi articoli, email e blog in pochi secondi con AI Writer. Prova gratis i tuoi primi contenuti AI.',
            featureList: ['Articoli', 'Email', 'Blog', 'Riassunti', 'Correzione', 'Riscrittura'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('ai-writer')) }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="ai-writer" />
      ) : (
        children
      )}
    </>
  )
}
