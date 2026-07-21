import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Writer - Scrivi articoli, email e blog con l’AI',
  description:
    'Genera, correggi e riscrivi testi per articoli, email, blog e riassunti in pochi secondi con AI Writer.',
  keywords: ['AI Writer', 'scrittura AI', 'generatore articoli AI', 'generatore blog AI', 'correzione testi AI'],
  alternates: { canonical: '/tools/ai-writer' },
  openGraph: {
    title: 'AI Writer - Scrivi articoli, email e blog | AI Toolbox',
    description: 'Genera, correggi e riscrivi testi per articoli, email, blog e riassunti in pochi secondi.',
    url: '/tools/ai-writer',
  },
}

export default function AiWriterLayout({ children }: { children: React.ReactNode }) {
  return children
}
