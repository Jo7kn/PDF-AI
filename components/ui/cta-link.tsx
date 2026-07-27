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
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[transform,background-color,border-color,box-shadow] duration-200 ease-spring active:scale-[0.97]'

const VARIANTS = {
  primary: 'bg-brand text-white shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_8px_24px_-8px_rgba(94,106,210,0.6)] hover:bg-[#6D79E0]',
  secondary: 'border border-white/[0.08] bg-white/[0.03] text-neutral-200 hover:border-white/[0.14] hover:bg-white/[0.06]',
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
