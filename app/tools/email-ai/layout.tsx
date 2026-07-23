import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Email AI: Scrivi Email in Pochi Secondi | AI Toolbox' },
  description:
    'Genera email professionali, risposte automatiche e migliora i tuoi testi con l’AI. Gratis per iniziare. Prova Email AI.',
  keywords: ['Email AI', 'generatore email AI', 'risposte automatiche email', 'scrittura email AI'],
  alternates: { canonical: '/tools/email-ai' },
  openGraph: {
    title: 'Email AI: Scrivi Email in Pochi Secondi | AI Toolbox',
    description: 'Genera email professionali, risposte automatiche e migliora i tuoi testi con l’AI. Gratis per iniziare. Prova Email AI.',
    url: '/tools/email-ai',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function EmailAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('email-ai')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Email AI',
            url: `${SITE_URL}/tools/email-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Genera email professionali, risposte automatiche e migliora i tuoi testi con l’AI. Gratis per iniziare. Prova Email AI.',
            featureList: ['Generazione email', 'Risposte automatiche', 'Miglioramento testi'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('email-ai')) }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Strumenti', path: '/tools' },
              { name: 'Email AI', path: '/tools/email-ai' },
            ])
          ),
        }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="email-ai" />
      ) : (
        children
      )}
    </>
  )
}
