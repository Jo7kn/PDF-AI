'use client'

import { useEffect, useState } from 'react'
import { History, Zap } from 'lucide-react'
import { getUsageHistory, type UsageEvent } from '@/app/actions/usage'
import { getToolBySlug } from '@/lib/tools'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'
import { SkeletonRow } from '@/components/skeleton'

export default function HistoryPage() {
  const { locale, t } = useLocale()
  const [events, setEvents] = useState<UsageEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getUsageHistory(100).then((r) => {
      if ('error' in r) setError(r.error)
      else setEvents(r.events)
    })
  }, [])

  const totalCredits = events?.reduce((sum, e) => sum + e.credits_cost, 0) || 0

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 ">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-brand" />
          <h1 className="text-xl font-semibold text-white">{t('historyPage.title')}</h1>
        </div>
        {events && events.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-200">
            <Zap className="h-3.5 w-3.5" />
            {t('historyPage.creditsUsed', { count: totalCredits, total: events.length })}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {events === null && !error && (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} className="p-3" />
          ))}
        </div>
      )}

      {events && events.length === 0 && (
        <div className="animate-fade-in-up py-12 text-center">
          <History className="mx-auto mb-4 h-16 w-16 text-neutral-600" />
          <p className="text-neutral-400">{t('historyPage.empty')}</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="space-y-2">
          {events.map((event, i) => {
            const tool = getToolBySlug(event.tool)
            const Icon = tool?.icon
            return (
              <div
                key={event.id}
                className="animate-fade-in-up flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.07]"
                style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {Icon && (
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{tool?.name || event.tool}</p>
                    {event.action && <p className="truncate text-xs text-neutral-500">{event.action}</p>}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-amber-300/80">
                    <Zap className="h-3 w-3" />
                    -{event.credits_cost}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(event.created_at).toLocaleDateString(LOCALE_DATE_TAG[locale])} {new Date(event.created_at).toLocaleTimeString(LOCALE_DATE_TAG[locale], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
