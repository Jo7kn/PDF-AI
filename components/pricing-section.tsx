// components/pricing-section.tsx
//
// Griglia dei piani, estratta da app/page.tsx per essere condivisa tra la
// home (sezione #pricing) e la pagina dedicata /pricing, senza duplicare
// markup e logica delle card.

import Link from 'next/link'
import { Check } from 'lucide-react'
import { PRICING_TIERS } from '@/lib/pricing'
import type { PricingTier } from '@/lib/types'

export function PricingSection({ id = 'pricing' }: { id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">Prezzi</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Piani semplici e trasparenti</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {PRICING_TIERS.map((tier, index) => (
          <PricingCard key={tier.name} tier={tier} featured={index === 1} />
        ))}
      </div>
    </section>
  )
}

function PricingCard({ tier, featured }: { tier: PricingTier; featured: boolean }) {
  return (
    <div className={`relative rounded-3xl border p-8 shadow-lg shadow-black/10 backdrop-blur-xl transition-colors duration-150 ease-out hover:bg-white/10 ${featured ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-slate-900/70'}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1 text-sm font-semibold text-white">
          Più popolare
        </div>
      )}

      <h3 className="mb-2 text-2xl font-semibold text-white">{tier.name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">€{tier.price}</span>
        <span className="text-slate-400">/mese</span>
      </div>

      <ul className="mb-8 space-y-4">
        {tier.features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-slate-300">
            <Check className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className={`block w-full rounded-2xl py-3 text-center font-semibold transition-colors duration-150 ease-out ${featured ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}>
        Scegli piano
      </Link>
    </div>
  )
}
