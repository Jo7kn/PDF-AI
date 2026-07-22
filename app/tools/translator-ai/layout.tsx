import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Translator AI: Traduci Documenti con l’AI | AI Toolbox' },
  description:
    'Traduci documenti e testi mantenendo la formattazione originale con l’AI. Gratis per iniziare. Prova Translator AI ora.',
  keywords: ['Translator AI', 'traduttore AI', 'traduzione documenti AI', 'traduzione testi online'],
  alternates: { canonical: '/tools/translator-ai' },
  openGraph: {
    title: 'Translator AI: Traduci Documenti con l’AI | AI Toolbox',
    description: 'Traduci documenti e testi mantenendo la formattazione originale con l’AI. Gratis per iniziare. Prova Translator AI ora.',
    url: '/tools/translator-ai',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function TranslatorAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('translator-ai')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Translator AI',
            url: `${SITE_URL}/tools/translator-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Traduci documenti e testi mantenendo la formattazione originale con l’AI. Gratis per iniziare. Prova Translator AI ora.',
            featureList: ['Traduzione documenti', 'Traduzione testi', 'Formato preservato'],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('translator-ai')) }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="translator-ai" />
      ) : (
        children
      )}
    </>
  )
}
