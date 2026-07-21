import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat AI - Assistente AI generico gratuito',
  description: 'Conversazione libera con un assistente AI, senza documenti o contesto collegato con Chat AI.',
  keywords: ['Chat AI', 'assistente AI', 'chatbot AI italiano', 'chat AI gratis'],
  alternates: { canonical: '/tools/chat-ai' },
  openGraph: {
    title: 'Chat AI - Assistente AI generico | AI Toolbox',
    description: 'Conversazione libera con un assistente AI, senza documenti o contesto collegato.',
    url: '/tools/chat-ai',
  },
}

export default function ChatAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
