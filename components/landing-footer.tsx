'use client'

// components/landing-footer.tsx
//
// Footer per le pagine marketing pubbliche (home, /pricing): a differenza
// di AppFooter non linka rotte autenticate (/home, /dashboard/files), che
// per un visitatore anonimo rimbalzerebbero al login. Copre il gap
// segnalato nell'audit SEO/GEO: la home pubblica non aveva nessun footer,
// quindi nessun segnale di contatto/fiducia.

import Link from 'next/link'
import { Terminal, Mail } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { CONTACT_EMAIL } from '@/lib/seo'
import { SocialLinks } from '@/components/social-links'

export function LandingFooter() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
            <Terminal className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-50">AI Toolbox</p>
            <p className="text-xs text-neutral-500">© {year} · {t('footer.rights')}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-neutral-400">
          <Link href="/tools" className="transition-colors duration-150 ease-out hover:text-neutral-50">{t('nav.tools')}</Link>
          <Link href="/pricing" className="transition-colors duration-150 ease-out hover:text-neutral-50">{t('nav.pricing')}</Link>
          <Link href="/about" className="transition-colors duration-150 ease-out hover:text-neutral-50">{t('nav.about')}</Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 transition-colors duration-150 ease-out hover:text-neutral-50"
          >
            <Mail className="h-3.5 w-3.5" />
            {CONTACT_EMAIL}
          </a>
        </nav>

        <SocialLinks />
      </div>
    </footer>
  )
}
