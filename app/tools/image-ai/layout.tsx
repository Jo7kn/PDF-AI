import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image AI - Genera e modifica immagini con l’AI',
  description: 'Generazione e modifica immagini, upscaling e rimozione dello sfondo con un click con Image AI.',
  keywords: ['Image AI', 'generatore immagini AI', 'upscaling immagini AI', 'rimozione sfondo AI'],
  alternates: { canonical: '/tools/image-ai' },
  openGraph: {
    title: 'Image AI - Genera e modifica immagini | AI Toolbox',
    description: 'Generazione e modifica immagini, upscaling e rimozione dello sfondo con un click.',
    url: '/tools/image-ai',
  },
}

export default function ImageAiLayout({ children }: { children: React.ReactNode }) {
  return children
}
