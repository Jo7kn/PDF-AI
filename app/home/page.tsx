'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Layers, Wallet, ShieldCheck, LayoutGrid } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { ToolCard } from '@/components/tool-card'
import { AnnouncementConsole } from '@/components/announcement-console'
import { DemoVideoCard } from '@/components/demo-video-card'
import { AI_TOOLS } from '@/lib/tools'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { getPublicFeatureFlags } from '@/app/actions/feature-flags'
import { useLocale } from '@/lib/i18n/locale-context'

export default function HomePage() {
  const { t } = useLocale()
  const [userTier, setUserTier] = useState<string | undefined>(undefined)
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getCurrentUserProfile().then((p) => setUserTier(p?.tier || 'free'))
    getPublicFeatureFlags().then((list) => {
      setFlags(Object.fromEntries(list.map((f) => [f.slug, f.enabled])))
    })
  }, [])

  // "Pronti all'uso" mostra solo gli strumenti realmente accesi ora, non
  // tutti quelli con status statico 'available' — coerente con il badge
  // sulla card (vedi components/tool-card.tsx).
  const availableTools = AI_TOOLS.filter((tool) => tool.status === 'available' && flags[tool.slug])

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={Sparkles}
        title="AI Toolbox"
        subtitle="La tua piattaforma AI"
        gradient="from-cyan-400 to-violet-500"
        active="home"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              {t('home.badge')}
            </div>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {t('home.title1')}
              <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> {t('home.titleHighlight')}</span>
            </h1>
            <p className="mb-8 text-lg text-slate-300">{t('home.subtitle')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90"
              >
                {t('home.ctaExplore')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/files"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition-colors duration-150 ease-out hover:bg-white/10"
              >
                {t('home.ctaDocs')}
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto mb-10 grid max-w-6xl gap-6 lg:grid-cols-2">
          <AnnouncementConsole className="w-full" />
          <DemoVideoCard className="w-full" />
        </div>

        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          <InfoCard icon={Layers} title={t('home.infoModularTitle')} description={t('home.infoModularDesc')} />
          <InfoCard icon={Wallet} title={t('home.infoBillingTitle')} description={t('home.infoBillingDesc')} />
          <InfoCard icon={ShieldCheck} title={t('home.infoSecurityTitle')} description={t('home.infoSecurityDesc')} />
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold text-white">{t('home.readyTitle')}</h2>
            </div>
            <Link href="/tools" className="text-sm font-medium text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
              {t('home.seeAll')} ({AI_TOOLS.length}) →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {availableTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} userTier={userTier} flagEnabled={flags[tool.slug]} />
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof Layers; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  )
}
