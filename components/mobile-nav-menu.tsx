'use client'

// components/mobile-nav-menu.tsx
//
// Menu hamburger condiviso da LandingHeader/AuthHeader: su mobile i link e
// i CTA login/signup erano semplicemente `hidden`, senza alcun fallback —
// un visitatore da telefono non aveva modo di navigare a Features/Pricing
// né di trovare il pulsante di registrazione. Solo il selettore lingua
// restava visibile.

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface MobileNavMenuProps {
  navItems: Array<{ href: string; label: string }>
  children?: React.ReactNode
}

export function MobileNavMenu({ navItems, children }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-300 transition-colors duration-150 ease-out hover:bg-neutral-800 hover:text-neutral-50 active:scale-[0.95]"
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="animate-fade-in-up absolute inset-x-0 top-full z-40 border-b border-neutral-800 bg-neutral-950 px-4 py-4 shadow-xl shadow-black/40">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-300 transition-colors duration-150 ease-out hover:bg-neutral-900 hover:text-neutral-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {children && (
            <div className="mt-3 flex flex-col gap-2 border-t border-neutral-800 pt-3" onClick={() => setOpen(false)}>
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
