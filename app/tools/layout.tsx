import type { Metadata } from 'next'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Tutti gli strumenti AI',
  description:
    'Scopri la suite completa di AI Toolbox: chat PDF, scrittura, codice, immagini, email, contratti, dati e traduzioni. Prova gratis gli strumenti disponibili.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Tutti gli strumenti AI | AI Toolbox',
    description:
      'Scopri la suite completa di AI Toolbox: chat PDF, scrittura, codice, immagini, email, contratti, dati e traduzioni.',
    url: '/tools',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Strumenti', path: '/tools' }])),
        }}
      />
      {children}
    </>
  )
}
