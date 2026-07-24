import Link from 'next/link'
import { cn } from '@/lib/utils'

// components/ui/cta-link.tsx
//
// Bottone primario/secondario a pillola per le pagine marketing (home,
// pricing, about) — ruolo diverso da <Button> (rounded-lg, per form/azioni
// dashboard): i CTA marketing sono sempre stati rounded-full a mano, con
// transition-colors che escludeva transform (lo scale in :active non
// interpolava) e l'easing debole di default invece di ease-out-strong.
// Un componente solo invece di stringhe duplicate in ogni pagina.

interface CtaLinkProps {
  href: string
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'lg'
  className?: string
  children: React.ReactNode
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out-strong active:scale-[0.97]'

const VARIANTS = {
  primary: 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-violet-400',
  secondary: 'border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/30 hover:bg-white/10',
}

const SIZES = {
  default: 'px-6 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export function CtaLink({ href, variant = 'primary', size = 'default', className, children }: CtaLinkProps) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)}>
      {children}
    </Link>
  )
}
