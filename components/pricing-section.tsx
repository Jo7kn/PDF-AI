'use client'

// components/pricing-section.tsx
//
// Griglia dei piani, estratta da app/page.tsx per essere condivisa tra la
// home (sezione #pricing) e la pagina dedicata /pricing, senza duplicare
// markup e logica delle card.

import Link from 'next/link'
import { Check } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/pricing'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'
import { ScrollReveal } from '@/components/scroll-reveal'
import type { PricingTier } from '@/lib/types'

export function PricingSection({ id = 'pricing' }: { id?: string }) {
  const { t } = useLocale()

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber-400">// {t('pricingSection.eyebrow')}</p>
        <h2 className="text-3xl font-semibold text-neutral-50 sm:text-4xl">{t('pricingSection.heading')}</h2>
      </ScrollReveal>

      <div className="grid gap-8 md:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <ScrollReveal key={tier.name} delay={index * 0.06}>
            <PricingCard tier={tier} featured={index === 1} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function PricingCard({ tier, featured }: { tier: PricingTier; featured: boolean }) {
  const { t } = useLocale()
  const features = useTranslatedList(`pricingTiers.${tier.name.toLowerCase()}.features`)

  return (
    <div className={`relative rounded-xl border p-8 transition-colors duration-150 ease-out-strong ${featured ? 'border-amber-400/50 bg-neutral-900' : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800/60'}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-lg bg-amber-400 px-4 py-1 text-sm font-semibold text-neutral-950">
          {t('pricingSection.featured')}
        </div>
      )}

      <h3 className="mb-2 text-2xl font-semibold text-neutral-50">{tier.name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-neutral-50">€{tier.price}</span>
        <span className="text-neutral-500">{t('pricingSection.perMonth')}</span>
      </div>

      <ul className="mb-8 space-y-4">
        {(features.length ? features : tier.features).map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-neutral-300">
            <Check className="h-5 w-5 flex-shrink-0 text-amber-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className={`block w-full rounded-lg py-3 text-center font-semibold transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] ${featured ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300' : 'border border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800'}`}>
        {t('pricingSection.choosePlan')}
      </Link>
    </div>
  )
}
