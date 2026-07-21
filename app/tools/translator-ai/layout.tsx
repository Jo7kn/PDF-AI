import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Translator AI - Traduci documenti e testi con l’AI',
  description: 'Traduzione di documenti e testi mantenendo la formattazione originale con Translator AI.',
  keywords: ['Translator AI', 'traduttore AI', 'traduzione documenti AI', 'traduzione testi online'],
  alternates: { canonical: '/tools/translator-ai' },
  openGraph: {
    title: 'Translator AI - Traduci documenti e testi | AI Toolbox',
    description: 'Traduzione di documenti e testi mantenendo la formattazione originale.',
    url: '/tools/translator-ai',
  },
}

export default function TranslatorAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
