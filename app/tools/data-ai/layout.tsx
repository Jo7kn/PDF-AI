import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data AI - Analizza CSV ed Excel con l’AI',
  description: 'Analisi di CSV ed Excel con dashboard e grafici generati automaticamente dai tuoi dati con Data AI.',
  keywords: ['Data AI', 'analisi CSV AI', 'analisi Excel AI', 'dashboard automatica AI'],
  alternates: { canonical: '/tools/data-ai' },
  openGraph: {
    title: 'Data AI - Analizza CSV ed Excel | AI Toolbox',
    description: 'Analisi di CSV ed Excel con dashboard e grafici generati automaticamente dai tuoi dati.',
    url: '/tools/data-ai',
  },
}

export default function DataAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
