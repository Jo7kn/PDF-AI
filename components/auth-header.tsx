'use client'

import Link from 'next/link'
import { Sparkle } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { LanguageSwitcher } from '@/components/app-header'
import { MobileNavMenu } from '@/components/mobile-nav-menu'

export function AuthHeader() {
  const { t } = useLocale()

  const navItems = [
    { href: '/#features', label: t('nav.features') },
    { href: '/#pricing', label: t('nav.pricing') },
    { href: '/#support', label: t('nav.support') },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050506]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-[0_0_20px_-4px_rgba(94,106,210,0.7)]">
            <Sparkle className="h-4.5 w-4.5 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">AI Toolbox</p>
            <p className="text-xs text-neutral-500">{t('nav.tagline')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-400 transition-colors duration-150 ease-out hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-neutral-300 transition-[transform,background-color,border-color] duration-200 ease-spring hover:border-white/[0.14] hover:text-white active:scale-[0.97] sm:inline-flex"
          >
            {t('nav.login')}
          </Link>
          <Link
            href="/signup"
            className="inline-flex rounded-xl bg-brand px-3 py-2 text-xs font-medium text-white transition-[transform,background-color] duration-200 ease-spring hover:bg-[#6D79E0] active:scale-[0.97] sm:px-4 sm:text-sm"
          >
            {t('nav.signup')}
          </Link>
          <MobileNavMenu navItems={navItems}>
            <Link href="/login" className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-center text-sm font-medium text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.04] hover:text-white">
              {t('nav.login')}
            </Link>
          </MobileNavMenu>
        </div>
      </div>
    </header>
  )
}
