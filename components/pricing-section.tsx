'use client'

// components/pricing-section.tsx
//
// Griglia dei piani, estratta da app/page.tsx per essere condivisa tra la
// home (sezione #pricing) e la pagina dedicata /pricing, senza duplicare
// markup e logica delle card.

import Link from 'next/link'
import { Check, Minus } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/pricing'
import { PLAN_CREDITS } from '@/lib/credits'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'
import { ScrollReveal } from '@/components/scroll-reveal'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import type { PricingTier } from '@/lib/types'

// Righe basate su lib/pricing.ts's `limits` (booleani/numeri reali, non le
// `features` in inglese page-based — quelle sono un fallback pre-i18n, vedi
// la nota in lib/pricing.ts: restano fuori da questa tabella per non
// propagare l'inconsistenza già segnalata nell'audit SEO.
const COMPARISON_ROWS: Array<{ label: string; get: (tier: PricingTier) => React.ReactNode }> = [
  { label: 'Crediti AI al mese', get: (tier) => PLAN_CREDITS[tier.name.toLowerCase() as 'free' | 'pro' | 'team'] },
  { label: 'Progetti attivi', get: (tier) => (tier.limits.activeProjects === Infinity ? 'Illimitati' : tier.limits.activeProjects) },
  { label: 'Chat storica', get: (tier) => <BoolCell value={tier.limits.historicalChat} /> },
  { label: 'Export calendario (ICS)', get: (tier) => <BoolCell value={tier.limits.calendarExport} /> },
  { label: 'Elaborazione prioritaria', get: (tier) => <BoolCell value={tier.limits.priorityProcessing} /> },
  { label: 'Condivisione team', get: (tier) => (tier.limits.teamSharing > 0 ? `${tier.limits.teamSharing} utenti` : <BoolCell value={false} />) },
  { label: 'Supporto email', get: (tier) => <BoolCell value={tier.limits.emailSupport} /> },
  { label: 'Analisi documenti avanzata', get: (tier) => <BoolCell value={tier.limits.advancedAnalysis} /> },
]

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-4 w-4 text-brand" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-neutral-700" />
  )
}

export function PricingSection({ id = 'pricing' }: { id?: string }) {
  const { t } = useLocale()

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">{t('pricingSection.eyebrow')}</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('pricingSection.heading')}</h2>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <ScrollReveal key={tier.name} delay={index * 0.06}>
            <PricingCard tier={tier} featured={index === 1} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.2} className="mt-16">
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                <th className="p-4 text-left font-medium text-neutral-400">Confronto piani</th>
                {PRICING_TIERS.map((tier) => (
                  <th key={tier.name} className="p-4 text-center font-semibold text-white">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 1 ? 'bg-white/[0.015]' : ''}>
                  <td className="p-4 text-neutral-300">{row.label}</td>
                  {PRICING_TIERS.map((tier) => (
                    <td key={tier.name} className="p-4 text-center text-neutral-300">
                      {row.get(tier)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>
    </section>
  )
}

function PricingCard({ tier, featured }: { tier: PricingTier; featured: boolean }) {
  const { t } = useLocale()
  const features = useTranslatedList(`pricingTiers.${tier.name.toLowerCase()}.features`)

  return (
    <SpotlightCard className={`p-8 ${featured ? 'border-brand/40 bg-white/[0.04]' : ''}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-lg bg-brand px-4 py-1 text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(94,106,210,0.7)]">
          {t('pricingSection.featured')}
        </div>
      )}

      <h3 className="mb-2 text-2xl font-semibold text-white">{tier.name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">€{tier.price}</span>
        <span className="text-neutral-500">{t('pricingSection.perMonth')}</span>
      </div>

      <ul className="mb-8 space-y-4">
        {(features.length ? features : tier.features).map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-neutral-300">
            <Check className="h-5 w-5 flex-shrink-0 text-brand" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className={`block w-full rounded-xl py-3 text-center font-medium transition-[transform,background-color] duration-200 ease-spring active:scale-[0.97] ${featured ? 'bg-brand text-white shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_8px_24px_-8px_rgba(94,106,210,0.6)] hover:bg-[#6D79E0]' : 'border border-white/[0.08] bg-transparent text-neutral-100 hover:bg-white/[0.06]'}`}>
        {t('pricingSection.choosePlan')}
      </Link>
    </SpotlightCard>
  )
}
