'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Zap, Check } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { PRICING_TIERS, getTierByName } from '@/lib/pricing'
import { buildCheckoutUrl } from '@/lib/stripe'
import { useLocale, translateList } from '@/lib/i18n/locale-context'
import { Skeleton } from '@/components/skeleton'

export default function BillingPage() {
  const { t, locale } = useLocale()
  const [profile, setProfile] = useState<{ id: string; email: string; tier: string; credits: number } | null>(null)

  useEffect(() => {
    getCurrentUserProfile().then((p) => p && setProfile(p))
  }, [])

  const currentTierName = profile ? getTierByName(profile.tier)?.name || profile.tier : null

  return (
    <div className="animate-fade-in-up space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 ">
        <div className="mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand" />
          <h1 className="text-xl font-semibold text-white">{t('billingPage.title')}</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-transform duration-200 ease-out-strong hover:-translate-y-0.5">
            <p className="text-sm text-neutral-400">{t('billingPage.currentPlanLabel')}</p>
            {profile ? (
              <p className="mt-1 text-2xl font-semibold text-brand">{currentTierName}</p>
            ) : (
              <Skeleton className="mt-1 h-8 w-20" />
            )}
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 transition-transform duration-200 ease-out-strong hover:-translate-y-0.5">
            <p className="text-sm text-amber-200/80">{t('nav.credits')}</p>
            {profile ? (
              <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-white">
                <Zap className="h-5 w-5 fill-amber-300 text-amber-300" />
                {profile.credits}
              </p>
            ) : (
              <Skeleton className="mt-1 h-8 w-16" />
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_TIERS.map((tier, i) => {
          const isCurrent = currentTierName === tier.name
          const planKey = tier.name.toLowerCase() as 'free' | 'pro' | 'team'
          const translatedFeatures = translateList(locale, `pricingTiers.${planKey}.features`)
          const features = translatedFeatures.length ? translatedFeatures : tier.features

          return (
            <div
              key={tier.name}
              className={`animate-fade-in-up rounded-2xl border p-6  transition-transform duration-200 ease-out-strong hover:-translate-y-1 ${
                isCurrent ? 'border-brand/40 bg-brand/10' : 'border-white/[0.08] bg-white/[0.03]'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <h3 className="mb-1 text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">€{tier.price}</span>
                <span className="text-neutral-400">{t('billingPage.perMonth')}</span>
              </div>

              <ul className="mb-6 space-y-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-neutral-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-center text-sm font-semibold text-brand">
                  {t('billingPage.currentPlanBadge')}
                </div>
              ) : planKey === 'free' ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm text-neutral-500">
                  {t('billingPage.freePlanBadge')}
                </div>
              ) : (
                <UpgradeButton plan={planKey} profile={profile} label={t('billingPage.upgradeTo', { name: tier.name })} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UpgradeButton({
  plan,
  profile,
  label,
}: {
  plan: 'pro' | 'team'
  profile: { id: string; email: string } | null
  label: string
}) {
  const { t } = useLocale()
  if (!profile) return null

  const url = buildCheckoutUrl(plan, profile.id, profile.email)

  if (!url) {
    return (
      <button
        disabled
        title={t('billingPage.notConfiguredTooltip')}
        className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm text-neutral-500 opacity-50"
      >
        {t('billingPage.notConfigured', { label })}
      </button>
    )
  }

  return (
    <a
      href={url}
      className="block w-full rounded-xl bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90"
    >
      {label}
    </a>
  )
}
