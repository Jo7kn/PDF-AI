'use client'

// components/dashboard-sidebar.tsx
//
// Nav della sezione /dashboard/*. Su desktop e' un pannello agganciato al
// bordo sinistro dello schermo, a tutta altezza (non dentro il contenitore
// centrato del contenuto). Su mobile diventa una riga orizzontale
// scorrevole in cima al contenuto. "AI Tools" linka fuori verso /tools.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderOpen,
  Star,
  History,
  CreditCard,
  Settings,
  LayoutGrid,
  Users,
  type LucideIcon,
} from 'lucide-react'

const ITEMS: Array<{ href: string; label: string; icon: LucideIcon; exact?: boolean }> = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/files', label: 'File', icon: FolderOpen },
  { href: '/dashboard/favorites', label: 'Preferiti', icon: Star },
  { href: '/dashboard/history', label: 'Cronologia', icon: History },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/billing', label: 'Abbonamento', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Impostazioni', icon: Settings },
]

function useActiveMap() {
  const pathname = usePathname()
  return (item: (typeof ITEMS)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))
}

export function DashboardSidebar() {
  const isActive = useActiveMap()

  return (
    <>
      {/* Desktop: pannello agganciato a sinistra, a tutta altezza */}
      <aside className="hidden flex-shrink-0 border-r border-white/10 bg-slate-950/40 md:flex md:w-60 md:flex-col md:py-8 md:pl-4 md:pr-3">
        <nav className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.98] ${
                isActive(item)
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-200 ring-1 ring-inset ring-cyan-400/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/tools"
          className="mt-3 flex flex-shrink-0 items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.98]"
        >
          <LayoutGrid className="h-4 w-4 flex-shrink-0" />
          Tutti gli strumenti
        </Link>
      </aside>

      {/* Mobile: riga orizzontale scorrevole in cima al contenuto */}
      <nav className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-slate-950/40 px-4 py-3 md:hidden">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
              isActive(item)
                ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
        <Link
          href="/tools"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-400 transition-colors duration-150 ease-out hover:text-white active:scale-[0.97]"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Strumenti
        </Link>
      </nav>
    </>
  )
}
