import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Code AI - Genera, correggi e spiega codice con l’AI',
  description:
    'Generazione codice, debug, refactoring, spiegazioni e conversione tra linguaggi di programmazione con Code AI.',
  keywords: ['Code AI', 'generatore codice AI', 'debug AI', 'refactoring AI', 'spiegazione codice AI'],
  alternates: { canonical: '/tools/code-ai' },
  openGraph: {
    title: 'Code AI - Genera, correggi e spiega codice | AI Toolbox',
    description: 'Generazione codice, debug, refactoring, spiegazioni e conversione tra linguaggi di programmazione.',
    url: '/tools/code-ai',
  },
}

export default function CodeAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
