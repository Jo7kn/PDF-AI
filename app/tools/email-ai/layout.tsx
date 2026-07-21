import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email AI - Scrivi e rispondi alle email con l’AI',
  description: 'Generazione email, risposte automatiche e miglioramento dei testi esistenti con Email AI.',
  keywords: ['Email AI', 'generatore email AI', 'risposte automatiche email', 'scrittura email AI'],
  alternates: { canonical: '/tools/email-ai' },
  openGraph: {
    title: 'Email AI - Scrivi e rispondi alle email | AI Toolbox',
    description: 'Generazione email, risposte automatiche e miglioramento dei testi esistenti.',
    url: '/tools/email-ai',
  },
}

export default function EmailAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
