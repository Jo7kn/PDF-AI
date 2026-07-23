import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, buildBreadcrumbSchema } from '@/lib/seo'
import { ComingSoon } from '@/components/coming-soon'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { buildFaqSchema } from '@/lib/faq-data'

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
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

// Vedi commento in app/tools/ai-writer/layout.tsx: senza questo la pagina
// verrebbe prerenderizzata a build time e il toggle admin non avrebbe effetto.
export const dynamic = 'force-dynamic'

export default async function FileConverterLayout({ children }: { children: React.ReactNode }) {
  const enabled = await isFeatureEnabled('file-converter')

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
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema('file-converter')) }}
      />
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Strumenti', path: '/tools' },
              { name: 'File Converter', path: '/tools/file-converter' },
            ])
          ),
        }}
      />
      {!enabled ? (
        <ComingSoon variant="tool" tool="file-converter" />
      ) : (
        children
      )}
    </>
  )
}
