'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { LanguageSwitcher } from '@/components/app-header'

export function AuthHeader() {
  const { t } = useLocale()

  const navItems = [
    { href: '/#features', label: t('nav.features') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/#support', label: t('nav.support') },
  ]

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">AI Toolbox</p>
            <p className="text-xs text-slate-400">{t('nav.tagline')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-[transform,background-color,border-color] duration-150 ease-out-strong hover:border-cyan-400/30 hover:text-white active:scale-[0.97] sm:inline-flex"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out-strong hover:bg-white/20 active:scale-[0.97] sm:inline-flex"
          >
            {t('nav.signup')}
          </Link>
        </div>
      </div>
    </header>
  )
}
