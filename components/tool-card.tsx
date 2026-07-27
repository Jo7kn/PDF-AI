'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import type { AiTool } from '@/lib/tools'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'
import { SpotlightCard } from '@/components/ui/spotlight-card'

// userTier: undefined finché il profilo non è stato caricato — in quel
// caso non mostriamo ancora lo stato "richiede Pro" per evitare un flash
// del badge a un utente che in realtà è già Pro/Team.
//
// flagEnabled: stato reale del feature flag (vedi lib/feature-flags.ts),
// non lo stato statico tool.status. Durante il pre-lancio tool.status può
// dire 'available' mentre il flag è ancora spento — senza questo la card
// direbbe "Disponibile" per uno strumento che poi mostra Coming Soon al
// click. undefined finché i flag non sono stati caricati: trattato come
// non disponibile (default prudente, coerente con lib/feature-flags.ts).
export function ToolCard({ tool, userTier, flagEnabled }: { tool: AiTool; userTier?: string; flagEnabled?: boolean }) {
  const { t } = useLocale()
  const features = useTranslatedList(`toolsData.${tool.slug}.features`)
  const Icon = tool.icon
  const isAvailable = tool.status === 'available' && Boolean(flagEnabled)
  const isLocked = Boolean(
    tool.requiresPaidTier && isAvailable && userTier !== undefined && userTier !== 'pro' && userTier !== 'team',
  )
  const isOpenable = isAvailable && !isLocked

  const card = (
    <SpotlightCard className={`group flex h-full flex-col p-6 ${isOpenable ? 'active:scale-[0.99]' : 'opacity-70'}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-200 ease-spring group-hover:scale-105">
          <Icon className="h-6 w-6" />
        </div>
        {isLocked ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-300">
            <Lock className="h-3 w-3" />
            {t('toolCard.locked')}
          </span>
        ) : isAvailable ? (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
            {t('toolCard.available')}
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-neutral-400">
            <Lock className="h-3 w-3" />
            {t('toolCard.soon')}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-lg font-semibold text-white">{tool.name}</h3>
      <p className="mb-2 text-sm text-brand/80">{t(`toolsData.${tool.slug}.tagline`)}</p>
      <p className="mb-4 flex-1 text-sm text-neutral-400">{t(`toolsData.${tool.slug}.description`)}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {features.slice(0, 4).map((feature) => (
          <span
            key={feature}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-xs text-neutral-300"
          >
            {feature}
          </span>
        ))}
      </div>

      <div
        className={`mt-auto inline-flex items-center gap-2 text-sm font-medium ${
          isLocked ? 'text-amber-300' : isAvailable ? 'text-brand' : 'text-neutral-500'
        }`}
      >
        {isLocked ? (
          t('toolCard.unlockCta')
        ) : isAvailable ? (
          <>
            {t('toolCard.open')}
            <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-1" />
          </>
        ) : (
          t('toolCard.comingSoon')
        )}
      </div>
    </SpotlightCard>
  )

  if (!isAvailable) {
    return <div className="h-full cursor-not-allowed">{card}</div>
  }

  // Un tool bloccato dal tier resta cliccabile: apre comunque la pagina del
  // tool, dove TierGate spiega cosa sblocca l'upgrade invece di un redirect
  // secco e senza contesto verso la pagina di billing.
  return (
    <Link href={tool.href} className="h-full">
      {card}
    </Link>
  )
}
