import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

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
  },
}

export default function TranslatorAiLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
