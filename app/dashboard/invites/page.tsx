'use client'

import { useEffect, useState } from 'react'
import { Gift, Copy, Check, PartyPopper } from 'lucide-react'
import { Skeleton } from '@/components/skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getReferralStatus, type ReferralStatus } from '@/app/actions/referrals'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

export default function InvitesPage() {
  const { t, locale } = useLocale()
  const [status, setStatus] = useState<ReferralStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getReferralStatus().then((result) => {
      if ('data' in result) setStatus(result.data)
      setLoading(false)
    })
  }, [])

  const link = status ? `${window.location.origin}/signup?ref=${status.code}` : ''

  const handleCopy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-brand" />
          <h1 className="text-xl font-semibold text-white">{t('invitesPage.title')}</h1>
        </div>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    )
  }

  if (!status) return null

  const remaining = Math.max(0, status.target - status.confirmedCount)
  const progressPct = Math.min(100, Math.round((status.confirmedCount / status.target) * 100))

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-brand" />
        <h1 className="text-xl font-semibold text-white">{t('invitesPage.title')}</h1>
      </div>

      <Card>
        <p className="mb-4 text-sm text-neutral-400">{t('invitesPage.subtitle')}</p>

        <label className="mb-1.5 block text-xs font-medium text-neutral-500">{t('invitesPage.yourLink')}</label>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
          <code className="truncate text-sm text-brand">{link}</code>
          <Button onClick={handleCopy} variant="subtle" size="sm" className="flex-shrink-0 gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t('invitesPage.copied') : t('invitesPage.copy')}
          </Button>
        </div>
      </Card>

      <Card>
        {status.rewardActive && status.rewardExpiresAt ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
            <PartyPopper className="h-5 w-5 flex-shrink-0 text-emerald-300" />
            <p className="text-sm text-emerald-200">
              {t('invitesPage.rewardActive', { date: new Date(status.rewardExpiresAt).toLocaleDateString(LOCALE_DATE_TAG[locale]) })}
            </p>
          </div>
        ) : (
          <p className="mb-3 text-sm text-neutral-300">
            {remaining > 0 ? t('invitesPage.rewardPending', { remaining: String(remaining) }) : t('invitesPage.rewardCheck')}
          </p>
        )}

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
            <span>{t('invitesPage.progress', { count: String(status.confirmedCount), target: String(status.target) })}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.03]">
            <div className="h-full rounded-full bg-brand transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-500">{t('invitesPage.confirmedNote')}</p>
      </Card>
    </div>
  )
}
