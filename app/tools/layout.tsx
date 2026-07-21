import type { Metadata } from 'next'

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
  return children
}
