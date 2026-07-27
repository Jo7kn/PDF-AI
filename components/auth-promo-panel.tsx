'use client'

// components/auth-promo-panel.tsx
//
// Pannello promo a sinistra di login/signup (vedi app/(auth)/layout.tsx).
// Estratto in un componente client separato perché quel layout resta un
// Server Component (export const metadata richiede che non sia 'use client'),
// ma il testo qui sotto deve seguire la lingua scelta come il resto della UI.

import { useLocale } from '@/lib/i18n/locale-context'

export function AuthPromoPanel() {
  const { t } = useLocale()
  const features = [
    t('authPromo.feature1'),
    t('authPromo.feature2'),
    t('authPromo.feature3'),
    t('authPromo.feature4'),
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -left-20 -top-20 h-[360px] w-[360px] rounded-full bg-brand/15 blur-[100px]" />
      </div>
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm text-brand">
        <span className="h-2 w-2 rounded-full bg-brand" />
        {t('authPromo.badge')}
      </div>
      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {t('authPromo.title')}
      </h1>
      <p className="mb-8 max-w-xl text-lg text-neutral-400">
        {t('authPromo.subtitle')}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((item) => (
          <div key={item} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-neutral-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
