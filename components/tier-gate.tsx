'use client'

// components/tier-gate.tsx
//
// Avvolge il contenuto interattivo di un tool riservato a Pro/Team
// (lib/tools.ts AiTool.requiresPaidTier, lib/credits.ts TIER_GATED_TOOLS).
// Se l'utente è Free mostra un upsell invece del form del tool — così lo
// scopre subito, non solo al submit (dove lib/ai-router.ts lo blocca comunque
// lato server, il vero confine di sicurezza). Nessun flash: finché il
// profilo non è caricato mostra uno skeleton, mai il form né l'upsell.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, ArrowRight } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/locale-context'
import { Skeleton } from '@/components/skeleton'

export function TierGate({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  const { t } = useLocale()
  const [tier, setTier] = useState<string | undefined>(undefined)

  useEffect(() => {
    getCurrentUserProfile().then((p) => setTier(p?.tier || 'free'))
  }, [])

  if (tier === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (tier !== 'pro' && tier !== 'team') {
    return (
      <div className="animate-fade-in-up mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-xl shadow-black/20">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}>
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-white">{t('tierGate.title')}</h2>
        <p className="mb-6 text-sm text-slate-400">{t('tierGate.description')}</p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
        >
          {t('tierGate.cta')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
