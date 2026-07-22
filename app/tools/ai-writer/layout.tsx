import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

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
  },
}

export default function AiWriterLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
