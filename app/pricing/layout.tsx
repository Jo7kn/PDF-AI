import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: 'Prezzi e Piani AI Toolbox: Free, Pro, Team | AI Toolbox' },
  description:
    'Confronta i piani AI Toolbox: Free 50 crediti, Pro 1000 crediti a €19/mese, Team 3000 crediti a €39/mese. Scegli il tuo piano.',
  keywords: ['prezzi AI Toolbox', 'piano Pro AI', 'crediti AI', 'abbonamento AI italiano'],
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Prezzi e Piani AI Toolbox: Free, Pro, Team | AI Toolbox',
    description:
      'Confronta i piani AI Toolbox: Free 50 crediti, Pro 1000 crediti a €19/mese, Team 3000 crediti a €39/mese. Scegli il tuo piano.',
    url: '/pricing',
  },
}

const plans = [
  { name: `${SITE_NAME} Free`, price: '0', desc: '50 crediti al mese' },
  { name: `${SITE_NAME} Pro`, price: '19', desc: '1000 crediti al mese e accesso a Image AI, Data AI, Study AI e Contract AI' },
  { name: `${SITE_NAME} Team`, price: '39', desc: '3000 crediti al mese, pensato per piccoli team' },
]

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {plans.map((plan) => (
        <script
          key={plan.name}
          type="application/ld+json"
          // JSON-LD statico: nessun input utente, safe da iniettare così.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: plan.name,
              brand: { '@type': 'Brand', name: SITE_NAME },
              description: `Piano ${plan.name.replace(`${SITE_NAME} `, '')} con ${plan.desc}.`,
              offers: {
                '@type': 'Offer',
                price: plan.price,
                priceCurrency: 'EUR',
                url: `${SITE_URL}/pricing`,
                description: plan.desc,
              },
            }),
          }}
        />
      ))}
      {children}
    </>
  )
}
