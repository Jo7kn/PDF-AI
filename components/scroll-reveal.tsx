'use client'

// components/scroll-reveal.tsx
//
// Equivalente "on-scroll" della classe CSS animate-fade-in-up (vedi
// tailwind.config.ts) usata in tutto il resto dell'app: stessa curva,
// stessa distanza, stessa durata. Le pagine marketing (home, pricing,
// about, tools) hanno sezioni sotto la piega — una classe CSS che parte al
// mount sarebbe già finita, invisibile, prima che l'utente scrolli fin lì.
// whileInView con viewport once:true anima solo alla prima apparizione
// reale nel viewport, non ad ogni mount.

import { motion } from 'framer-motion'

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const

export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.26, ease: EASE_OUT_STRONG, delay }}
    >
      {children}
    </motion.div>
  )
}
