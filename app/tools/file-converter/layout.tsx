import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'File Converter: Converti File con l’AI | AI Toolbox' },
  description:
    'Converti PDF, immagini, CSV e Markdown in pochi click con l’intelligenza artificiale. Gratis per iniziare. Prova ora.',
  keywords: ['File Converter', 'convertitore PDF online', 'convertitore CSV JSON', 'convertitore Markdown HTML'],
  alternates: { canonical: '/tools/file-converter' },
  openGraph: {
    title: 'File Converter: Converti File con l’AI | AI Toolbox',
    description: 'Converti PDF, immagini, CSV e Markdown in pochi click con l’intelligenza artificiale. Gratis per iniziare. Prova ora.',
    url: '/tools/file-converter',
  },
}

export default function FileConverterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'File Converter',
            url: `${SITE_URL}/tools/file-converter`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              'Converti PDF, immagini, CSV e Markdown in pochi click con l’intelligenza artificiale. Gratis per iniziare. Prova ora.',
            featureList: ['PDF → Testo', 'Immagini', 'CSV ⇄ JSON', 'Markdown ⇄ HTML'],
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
