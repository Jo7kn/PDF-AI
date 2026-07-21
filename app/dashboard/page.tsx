'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap, FolderOpen, History, CreditCard, ArrowRight, Sparkles } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { getUsageHistory, type UsageEvent } from '@/app/actions/usage'
import { getTierByName } from '@/lib/pricing'
import { getToolBySlug } from '@/lib/tools'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'
import { Skeleton, SkeletonRow, SkeletonStat } from '@/components/skeleton'

export default function DashboardOverviewPage() {
  const { locale } = useLocale()
  const [profile, setProfile] = useState<{ email: string; tier: string; credits: number } | null>(null)
  const [events, setEvents] = useState<UsageEvent[] | null>(null)

  useEffect(() => {
    getCurrentUserProfile().then((p) => p && setProfile(p))
    getUsageHistory(5).then((r) => setEvents('events' in r ? r.events : []))
  }, [])

  return (
    <div className="space-y-6">
      <section
        className="animate-fade-in-up rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-8"
        style={{ animationDelay: '0ms' }}
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
          <Sparkles className="h-4 w-4" />
          Bentornato{profile ? `, ${profile.email.split('@')[0]}` : ''}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {!profile ? (
            <>
              <SkeletonStat className="border border-amber-400/20 bg-amber-400/10" />
              <SkeletonStat />
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 transition-transform duration-200 ease-out-strong hover:-translate-y-0.5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                  <Zap className="h-5 w-5 fill-amber-300" />
                </div>
                <p className="text-3xl font-semibold text-white">{profile.credits}</p>
                <p className="text-sm text-amber-200/80">Crediti disponibili</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 transition-transform duration-200 ease-out-strong hover:-translate-y-0.5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="text-3xl font-semibold text-white">{getTierByName(profile.tier)?.name || profile.tier}</p>
                <p className="text-sm text-slate-400">Piano attuale</p>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <QuickLink href="/dashboard/files" icon={FolderOpen} title="I tuoi file" description="Documenti, cartelle e tag" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <QuickLink href="/dashboard/billing" icon={CreditCard} title="Abbonamento" description="Piano, crediti, upgrade" />
        </div>
      </div>

      <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20" style={{ animationDelay: '140ms' }}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Attività recente</h2>
          </div>
          <Link href="/dashboard/history" className="text-sm font-medium text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
            Vedi tutta →
          </Link>
        </div>

        {events === null && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {events && events.length === 0 && (
          <p className="py-4 text-sm text-slate-500">Nessuna attività ancora. Prova uno degli strumenti AI.</p>
        )}

        {events && events.length > 0 && (
          <div className="space-y-2">
            {events.map((event, i) => (
              <div
                key={event.id}
                className="animate-fade-in-up flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors duration-150 ease-out hover:bg-white/[0.07]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div>
                  <span className="font-medium text-white">{getToolBySlug(event.tool)?.name || event.tool}</span>
                  {event.action && <span className="text-slate-500"> · {event.action}</span>}
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1 text-amber-300/80">
                    <Zap className="h-3 w-3" />
                    -{event.credits_cost}
                  </span>
                  <span>{new Date(event.created_at).toLocaleDateString(LOCALE_DATE_TAG[locale])}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function QuickLink({ href, icon: Icon, title, description }: { href: string; icon: typeof FolderOpen; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20 transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out-strong hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-slate-900 hover:shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300 transition-transform duration-200 ease-out-strong group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform duration-200 ease-out-strong group-hover:translate-x-1 group-hover:text-cyan-300" />
    </Link>
  )
}
