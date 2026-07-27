'use client'

// components/app-header.tsx
//
// Header condiviso da tutte le pagine autenticate (home, dashboard, hub tool,
// singoli tool). Centralizza logo, nav (Home/Documenti/Tutti gli strumenti),
// selettore lingua, profilo utente e logout, cosi' aggiungere/cambiare una
// voce si fa in un solo posto invece che in ogni pagina.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, Home, FileText, LayoutGrid, Globe, Check, Zap, type LucideIcon } from 'lucide-react'
import { signOut, getCurrentUserProfile } from '@/app/actions/auth'
import { getTierByName } from '@/lib/pricing'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations'

export type AppHeaderNavKey = 'home' | 'documents' | 'tools'

interface AppHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  gradient: string // classi Tailwind complete, es. "from-fuchsia-400 to-pink-500"
  active?: AppHeaderNavKey
  logoHref?: string
}

export function AppHeader({ icon: Icon, title, subtitle, gradient, active, logoHref = '/home' }: AppHeaderProps) {
  const [profile, setProfile] = useState<{ id: string; email: string; tier: string; credits: number } | null>(null)
  const { t } = useLocale()

  useEffect(() => {
    getCurrentUserProfile().then(setProfile)
  }, [])

  const NAV_ITEMS: Array<{ key: AppHeaderNavKey; label: string; href: string; icon: LucideIcon }> = [
    { key: 'home', label: t('nav.home'), href: '/home', icon: Home },
    { key: 'documents', label: t('nav.documents'), href: '/dashboard/files', icon: FileText },
    { key: 'tools', label: t('nav.tools'), href: '/tools', icon: LayoutGrid },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050506]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href={logoHref} className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand shadow-[0_0_20px_-4px_rgba(94,106,210,0.7)] transition-transform duration-200 ease-spring group-hover:scale-105">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold leading-tight text-white">{title}</p>
            <p className="text-xs text-neutral-500">{subtitle}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                  isActive ? 'bg-brand text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {profile && (
            <div
              title={t('nav.credits')}
              className="hidden items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-200 sm:flex"
            >
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              {profile.credits}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition-colors duration-150 ease-out hover:border-white/[0.14] hover:bg-white/[0.06]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
              {(profile?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-[160px] truncate text-sm font-medium leading-tight text-white">{profile?.email || '...'}</p>
              <p className="text-xs leading-tight text-brand/80">
                {profile ? getTierByName(profile.tier)?.name || profile.tier : '...'}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title={t('nav.logout')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-sm font-medium text-neutral-200 transition-colors duration-150 ease-out hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200 active:scale-[0.97] sm:px-3 sm:py-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </form>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/[0.04] px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                isActive ? 'bg-brand text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  // Il pannello resta montato un istante in più per poter animare l'uscita
  // (altrimenti smonterebbe di scatto insieme a `open`).
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openMenu = () => {
    setVisible(true)
    requestAnimationFrame(() => setOpen(true))
  }
  const closeMenu = () => {
    setOpen(false)
    setTimeout(() => setVisible(false), 150)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => (open ? closeMenu() : openMenu())}
        title="Language"
        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-sm text-neutral-200 transition-colors duration-150 ease-out hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.97]"
      >
        <Globe className="h-4 w-4 text-brand" />
        <span className="hidden text-base leading-none sm:inline">{LOCALE_LABELS[locale].flag}</span>
      </button>

      {visible && (
        <div
          className={`absolute right-0 top-full z-30 mt-2 w-44 origin-top-right overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl transition-[opacity,transform] duration-200 ease-spring ${
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => { setLocale(code); closeMenu() }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ease-out active:scale-[0.98] ${
                locale === code ? 'bg-brand/15 text-brand' : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">{LOCALE_LABELS[code].flag}</span>
                {LOCALE_LABELS[code].name}
              </span>
              {locale === code && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
