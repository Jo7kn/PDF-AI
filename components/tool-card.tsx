'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import type { AiTool } from '@/lib/tools'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'

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
    <div
      className={`group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out-strong ${
        isOpenable ? 'hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900 hover:shadow-2xl hover:shadow-cyan-500/10 active:scale-[0.99]' : 'opacity-80'
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient} transition-transform duration-200 ease-out-strong group-hover:scale-105 group-hover:rotate-3`}>
          <Icon className="h-6 w-6 text-white" />
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
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
            <Lock className="h-3 w-3" />
            {t('toolCard.soon')}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-lg font-semibold text-white">{tool.name}</h3>
      <p className="mb-2 text-sm text-cyan-200/80">{t(`toolsData.${tool.slug}.tagline`)}</p>
      <p className="mb-4 flex-1 text-sm text-slate-400">{t(`toolsData.${tool.slug}.description`)}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {features.slice(0, 4).map((feature) => (
          <span
            key={feature}
            className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300"
          >
            {feature}
          </span>
        ))}
      </div>

      <div
        className={`mt-auto inline-flex items-center gap-2 text-sm font-medium ${
          isLocked ? 'text-amber-300' : isAvailable ? 'text-cyan-300' : 'text-slate-500'
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
    </div>
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
