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
    <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
        <span className="h-2 w-2 rounded-full bg-cyan-300" />
        {t('authPromo.badge')}
      </div>
      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {t('authPromo.title')}
      </h1>
      <p className="mb-8 max-w-xl text-lg text-slate-300">
        {t('authPromo.subtitle')}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
