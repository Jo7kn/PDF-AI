'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Sparkle, ArrowRight, Layers, Wallet, ShieldCheck, LayoutGrid } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { ToolCard } from '@/components/tool-card'
import { AnnouncementConsole } from '@/components/announcement-console'
import { DemoVideoCard } from '@/components/demo-video-card'
import { CtaLink } from '@/components/ui/cta-link'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { AI_TOOLS } from '@/lib/tools'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { getPublicFeatureFlags } from '@/app/actions/feature-flags'
import { useLocale } from '@/lib/i18n/locale-context'

const ThreeHeroBackground = dynamic(
  () => import('@/components/three-hero-background').then((m) => m.ThreeHeroBackground),
  { ssr: false },
)

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
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={Sparkle}
        title="AI Toolbox"
        subtitle="La tua piattaforma AI"
        gradient=""
        active="home"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 sm:p-12">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-float absolute right-0 top-0 h-[420px] w-[420px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand/15 blur-[110px]" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
            <ThreeHeroBackground />
          </div>
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm text-brand">
              <Sparkle className="h-4 w-4" fill="currentColor" />
              {t('home.badge')}
            </div>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {t('home.title1')}
              <span className="text-brand"> {t('home.titleHighlight')}</span>
            </h1>
            <p className="mb-8 text-lg text-neutral-400">{t('home.subtitle')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaLink href="/tools">
                {t('home.ctaExplore')}
                <ArrowRight className="h-4 w-4" />
              </CtaLink>
              <CtaLink href="/dashboard/files" variant="secondary">
                {t('home.ctaDocs')}
              </CtaLink>
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
              <LayoutGrid className="h-5 w-5 text-brand" />
              <h2 className="text-xl font-semibold text-white">{t('home.readyTitle')}</h2>
            </div>
            <Link href="/tools" className="text-sm font-medium text-brand transition-colors duration-150 ease-out hover:text-[#7A85E5]">
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
    <SpotlightCard className="p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </SpotlightCard>
  )
}
