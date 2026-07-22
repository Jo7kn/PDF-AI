import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

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
  },
}

export default function StudyAiLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
