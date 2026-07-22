'use client'

// components/dashboard-sidebar.tsx
//
// Nav della sezione /dashboard/*. Su desktop e' un pannello agganciato al
// bordo sinistro dello schermo, a tutta altezza (non dentro il contenitore
// centrato del contenuto). Su mobile diventa una riga orizzontale
// scorrevole in cima al contenuto. "AI Tools" linka fuori verso /tools.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FolderOpen,
  Star,
  History,
  CreditCard,
  Settings,
  LayoutGrid,
  Users,
  Gift,
  type LucideIcon,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'

type ItemKey = 'home' | 'files' | 'favorites' | 'history' | 'team' | 'invites' | 'billing' | 'settings'

const ITEMS: Array<{ href: string; key: ItemKey; icon: LucideIcon; exact?: boolean }> = [
  { href: '/dashboard', key: 'home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/files', key: 'files', icon: FolderOpen },
  { href: '/dashboard/favorites', key: 'favorites', icon: Star },
  { href: '/dashboard/history', key: 'history', icon: History },
  { href: '/dashboard/team', key: 'team', icon: Users },
  { href: '/dashboard/invites', key: 'invites', icon: Gift },
  { href: '/dashboard/billing', key: 'billing', icon: CreditCard },
  { href: '/dashboard/settings', key: 'settings', icon: Settings },
]

function useActiveMap() {
  const pathname = usePathname()
  return (item: (typeof ITEMS)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))
}

export function DashboardSidebar() {
  const isActive = useActiveMap()
  const { t } = useLocale()

  return (
    <>
      {/* Desktop: pannello agganciato a sinistra, a tutta altezza */}
      <aside className="hidden flex-shrink-0 border-r border-white/10 bg-slate-950/40 md:flex md:w-60 md:flex-col md:py-8 md:pl-4 md:pr-3">
        <nav className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-3.5 py-2.5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] ${
                  active ? 'text-cyan-200' : 'text-slate-400 hover:text-white'
                }`}
              >
                {/* Pillola condivisa: layoutId fa animare Framer Motion tra
                    la posizione precedente e quella nuova quando cambia la
                    voce attiva, invece del semplice dissolvi di una classe
                    su ciascun elemento — un vero indicatore che scivola. */}
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 ring-1 ring-inset ring-cyan-400/30"
                  />
                )}
                <span
                  className={`absolute inset-0 rounded-xl bg-white/5 opacity-0 transition-opacity duration-150 ease-out ${
                    active ? '' : 'group-hover:opacity-100'
                  }`}
                />
                <item.icon className="relative z-10 h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5" />
                <span className="relative z-10">{t(`sidebar.${item.key}`)}</span>
              </Link>
            )
          })}
        </nav>

        <Link
          href="/tools"
          className="group mt-3 flex flex-shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:border-cyan-400/20 hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <LayoutGrid className="h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5" />
          {t('sidebar.allTools')}
        </Link>
      </aside>

      {/* Mobile: riga orizzontale scorrevole in cima al contenuto */}
      <nav className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-slate-950/40 px-4 py-3 md:hidden">
        {ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.97] ${
                active ? 'text-white' : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {/* layoutId separato da quello desktop: le due nav sono
                  montate entrambe nel DOM (solo nascoste via breakpoint),
                  condividere l'id confonderebbe il tracking di Framer Motion. */}
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill-mobile"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                />
              )}
              <item.icon className="relative z-10 h-3.5 w-3.5" />
              <span className="relative z-10">{t(`sidebar.${item.key}`)}</span>
            </Link>
          )
        })}
        <Link
          href="/tools"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-400 transition-colors duration-150 ease-out hover:text-white active:scale-[0.97]"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          {t('sidebar.tools')}
        </Link>
      </nav>
    </>
  )
}
