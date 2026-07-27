'use client'

// components/ui/spotlight-card.tsx
//
// Card con alone che segue il cursore — pattern "spotlight" più salvato su
// 21st.dev (componenti community React/Tailwind). Un radial-gradient CSS
// ancorato a --x/--y aggiornate via onMouseMove: nessuna libreria in più,
// solo custom properties + Tailwind arbitrary values.

import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300 ease-spring hover:border-white/[0.14]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(94,106,210,0.14), transparent 65%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
