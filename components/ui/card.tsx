'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

// rounded-3xl/shadow-xl invece di rounded-xl/shadow-lg: la maggior parte
// delle card reali nell'app (dashboard, admin) usa quella variante — questo
// primitivo era rimasto sul valore più vecchio e finiva reimplementato a
// mano ovunque invece di essere usato.
//
// backdrop-blur-xl + inset top-highlight (restyle): senza blur le card sono
// rettangoli scuri opachi, non vetro — il blur mancava ovunque tranne sulla
// hero card della home. L'inset highlight simula luce che colpisce il bordo
// superiore, l'unico dettaglio che distingue lo stato di riposo di una card
// da un semplice rettangolo con bordo.
const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-white backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_25px_-5px_rgba(0,0,0,0.3)]',
        className,
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-3', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold leading-none', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-slate-400', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }