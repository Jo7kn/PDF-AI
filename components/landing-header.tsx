'use client'

// components/landing-header.tsx
//
// Header della landing page pubblica (utenti non autenticati). Separato da
// app/page.tsx (Server Component) perché useLocale richiede un client
// component; condivide LanguageSwitcher con AppHeader invece di duplicarlo.

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { LanguageSwitcher } from '@/components/app-header'

export function LandingHeader() {
  const { t } = useLocale()

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">PDF AI</p>
            <p className="text-xs text-slate-400">{t('nav.tagline')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:text-white">
            {t('nav.features')}
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:text-white">
            {t('nav.pricing')}
          </Link>
          <Link href="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:border-cyan-400/30 hover:text-white active:scale-[0.97]">
            {t('nav.login')}
          </Link>
          <Link href="/signup" className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-white/20 active:scale-[0.97]">
            {t('nav.signup')}
          </Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  )
}
