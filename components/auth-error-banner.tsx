'use client'

// components/auth-error-banner.tsx
//
// Estratto da app/page.tsx: leggere searchParams come prop del Server
// Component forzava l'intera home a rendering dinamico (niente più static
// generation), e la home finiva per servire solo lo shell di app/loading.tsx
// ai crawler/tool che non eseguono JS (zero H1, zero link interni — vedi
// audit SEO). useSearchParams() qui dentro isola la dinamicità a questo solo
// banner: il resto della pagina torna statico.

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/i18n/locale-context'

export function AuthErrorBanner() {
  const { t } = useLocale()
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error_code') === 'otp_expired'
  const authErrored = !linkExpired && searchParams.get('error') === 'access_denied'

  if (!linkExpired && !authErrored) return null

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
          {linkExpired ? t('landing.linkExpired') : t('landing.linkInvalid')}{' '}
          <Link href="/forgotpass" className="font-semibold underline underline-offset-2 hover:text-amber-100">
            {t('landing.requestNewLink')}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
