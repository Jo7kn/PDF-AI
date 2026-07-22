import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

export const metadata: Metadata = {
  title: { absolute: 'Chat AI: Assistente Conversazionale Gratis | AI Toolbox' },
  description:
    'Chatta liberamente con un assistente AI, senza documenti richiesti. Sempre gratis. Inizia una conversazione con Chat AI.',
  keywords: ['Chat AI', 'assistente AI', 'chatbot AI italiano', 'chat AI gratis'],
  alternates: { canonical: '/tools/chat-ai' },
  openGraph: {
    title: 'Chat AI: Assistente Conversazionale Gratis | AI Toolbox',
    description: 'Chatta liberamente con un assistente AI, senza documenti richiesti. Sempre gratis. Inizia una conversazione con Chat AI.',
    url: '/tools/chat-ai',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function ChatAiLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('chat-ai')

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Chat AI',
            url: `${SITE_URL}/tools/chat-ai`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Chatta liberamente con un assistente AI, senza documenti richiesti. Sempre gratis. Inizia una conversazione con Chat AI.',
            featureList: ['Chat multi-turno', 'Nessun documento richiesto', 'Risposte in Markdown'],
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              description: 'Sempre gratuito, su ogni piano',
            },
            isAccessibleForFree: true,
          }),
        }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('chat-ai')) }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="chat-ai" />
      ) : (
        children
      )}
    </>
  )
}
