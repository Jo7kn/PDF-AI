import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

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
  },
}

export default function ImageAiLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
