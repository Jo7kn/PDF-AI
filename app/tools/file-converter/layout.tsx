import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'File Converter - Converti tra formati file con l’AI',
  description:
    'Conversione tra PDF, immagini, CSV, JSON e Markdown (Word/Excel/PowerPoint in arrivo) con File Converter.',
  keywords: ['File Converter', 'convertitore PDF online', 'convertitore CSV JSON', 'convertitore Markdown HTML'],
  alternates: { canonical: '/tools/file-converter' },
  openGraph: {
    title: 'File Converter - Converti tra formati file | AI Toolbox',
    description: 'Conversione tra PDF, immagini, CSV, JSON e Markdown (Word/Excel/PowerPoint in arrivo).',
    url: '/tools/file-converter',
  },
}

export default function FileConverterLayout({ children }: { children: React.ReactNode }) {
  return children
}
