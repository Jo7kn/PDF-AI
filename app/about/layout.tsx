import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Chi siamo e contatti | AI Toolbox' },
  description:
    'Scopri chi c’è dietro AI Toolbox e come contattarci. Suite di strumenti AI in italiano per PDF, scrittura, codice e altro.',
  keywords: ['AI Toolbox', 'chi siamo', 'contatti AI Toolbox', 'contattaci'],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Chi siamo e contatti | AI Toolbox',
    description: 'Scopri chi c’è dietro AI Toolbox e come contattarci.',
    url: '/about',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
