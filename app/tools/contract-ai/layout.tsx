import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contract AI - Analizza contratti e clausole con l’AI',
  description: 'Analisi contratti, individuazione clausole a rischio e riassunti automatici con Contract AI.',
  keywords: ['Contract AI', 'analisi contratti AI', 'clausole a rischio AI', 'riassunto contratti AI'],
  alternates: { canonical: '/tools/contract-ai' },
  openGraph: {
    title: 'Contract AI - Analizza contratti e clausole | AI Toolbox',
    description: 'Analisi contratti, individuazione clausole a rischio e riassunti automatici.',
    url: '/tools/contract-ai',
  },
}

export default function ContractAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
