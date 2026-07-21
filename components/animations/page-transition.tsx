'use client'

// components/animations/page-transition.tsx
//
// Transizione del CONTENUTO tra le sotto-pagine di /dashboard. Non duplica
// la barra di caricamento globale (components/route-progress.tsx, che
// reagisce al click e copre l'attesa di compilazione/navigazione): questo
// componente entra in gioco dopo, quando il nuovo contenuto è già montato,
// per farlo assestare invece di scattare a schermo. AnimatePresence anima
// in overlap (niente mode="wait") cosi il cambio pagina resta percepito
// come istantaneo — il vecchio contenuto sfuma mentre il nuovo è già lì.
// prefers-reduced-motion è gestito automaticamente da <MotionConfig
// reducedMotion="user"> in app/layout.tsx, non serve ripeterlo qui.

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

const EASE_OUT_STRONG = [0.23, 1, 0.32, 1] as const

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE_OUT_STRONG }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
