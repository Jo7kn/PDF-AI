'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import type { AiTool } from '@/lib/tools'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'

export function ToolCard({ tool }: { tool: AiTool }) {
  const { t } = useLocale()
  const features = useTranslatedList(`toolsData.${tool.slug}.features`)
  const Icon = tool.icon
  const isAvailable = tool.status === 'available'

  const card = (
    <div
      className={`group flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20 transition-colors duration-150 ease-out ${
        isAvailable ? 'hover:border-cyan-400/30 hover:bg-slate-900 active:scale-[0.99]' : 'opacity-80'
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.gradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {isAvailable ? (
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
          isAvailable ? 'text-cyan-300' : 'text-slate-500'
        }`}
      >
        {isAvailable ? (
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

  return (
    <Link href={tool.href} className="h-full">
      {card}
    </Link>
  )
}
