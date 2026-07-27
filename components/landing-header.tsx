'use client'

// components/landing-header.tsx
//
// Header della landing page pubblica (utenti non autenticati). Separato da
// app/page.tsx (Server Component) perché useLocale richiede un client
// component; condivide LanguageSwitcher con AppHeader invece di duplicarlo.

import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { LanguageSwitcher } from '@/components/app-header'
import { MobileNavMenu } from '@/components/mobile-nav-menu'

export function LandingHeader() {
  const { t } = useLocale()

  const navItems = [
    { href: '#features', label: t('nav.features') },
    { href: '#pricing', label: t('nav.pricing') },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
            <Terminal className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-neutral-50">AI Toolbox</p>
            <p className="font-mono text-xs text-neutral-500">{t('nav.tagline')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-neutral-400 transition-colors duration-150 ease-out hover:text-neutral-50">
            {t('nav.features')}
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-neutral-400 transition-colors duration-150 ease-out hover:text-neutral-50">
            {t('nav.pricing')}
          </Link>
          <Link href="/login" className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition-[transform,background-color,border-color] duration-150 ease-out-strong hover:border-neutral-600 hover:text-neutral-50 active:scale-[0.97]">
            {t('nav.login')}
          </Link>
          <Link href="/signup" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-[transform,background-color] duration-150 ease-out-strong hover:bg-amber-300 active:scale-[0.97]">
            {t('nav.signup')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <MobileNavMenu navItems={navItems}>
            <Link href="/login" className="rounded-lg border border-neutral-800 px-4 py-2.5 text-center text-sm font-medium text-neutral-300 transition-colors duration-150 ease-out hover:bg-neutral-900 hover:text-neutral-50">
              {t('nav.login')}
            </Link>
            <Link href="/signup" className="rounded-lg bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-neutral-950 transition-opacity duration-150 ease-out hover:bg-amber-300">
              {t('nav.signup')}
            </Link>
          </MobileNavMenu>
        </div>
      </div>
    </header>
  )
}
