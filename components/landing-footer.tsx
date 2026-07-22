'use client'

// components/landing-footer.tsx
//
// Footer per le pagine marketing pubbliche (home, /pricing): a differenza
// di AppFooter non linka rotte autenticate (/home, /dashboard/files), che
// per un visitatore anonimo rimbalzerebbero al login. Copre il gap
// segnalato nell'audit SEO/GEO: la home pubblica non aveva nessun footer,
// quindi nessun segnale di contatto/fiducia.

import Link from 'next/link'
import { Sparkles, Mail } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { CONTACT_EMAIL } from '@/lib/seo'

export function LandingFooter() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Toolbox</p>
            <p className="text-xs text-slate-500">© {year} · {t('footer.rights')}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400">
          <Link href="/tools" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.tools')}</Link>
          <Link href="/pricing" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.pricing')}</Link>
          <Link href="/about" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.about')}</Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 transition-colors duration-150 ease-out hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </footer>
  )
}
