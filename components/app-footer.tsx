'use client'

// components/app-footer.tsx
//
// Footer condiviso da tutte le pagine autenticate della piattaforma.

import Link from 'next/link'
import { Sparkle, Heart } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { SocialLinks } from '@/components/social-links'

export function AppFooter() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] bg-[#050506]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Sparkle className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Toolbox</p>
            <p className="text-xs text-neutral-500">© {year} · {t('footer.rights')}</p>
          </div>
        </div>

        <nav className="flex items-center gap-5 text-sm text-neutral-400">
          <Link href="/home" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.home')}</Link>
          <Link href="/tools" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.tools')}</Link>
          <Link href="/dashboard/files" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.documents')}</Link>
          <Link href="/about" className="transition-colors duration-150 ease-out hover:text-white">{t('nav.about')}</Link>
        </nav>

        <p className="flex items-center gap-1.5 text-sm text-neutral-500">
          {t('footer.madeBy')} <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" /> {t('footer.by')}
          <span className="font-medium text-neutral-300">jxhn</span>
        </p>

        <SocialLinks />
      </div>
    </footer>
  )
}
