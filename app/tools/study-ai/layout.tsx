import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Study AI - Studia con un tutor AI personalizzato',
  description:
    'Flashcard, quiz, tutor AI personalizzato e piani di studio su misura per i tuoi obiettivi con Study AI.',
  keywords: ['Study AI', 'tutor AI', 'flashcard AI', 'quiz AI', 'piano di studio AI'],
  alternates: { canonical: '/tools/study-ai' },
  openGraph: {
    title: 'Study AI - Studia con un tutor AI | AI Toolbox',
    description: 'Flashcard, quiz, tutor AI personalizzato e piani di studio su misura per i tuoi obiettivi.',
    url: '/tools/study-ai',
  },
}

export default function StudyAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
