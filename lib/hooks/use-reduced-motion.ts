'use client'

// lib/hooks/use-reduced-motion.ts
//
// Punto unico per leggere prefers-reduced-motion. Prima era duplicato
// localmente in route-progress.tsx; qualunque componente (Framer Motion o
// puro CSS/JS) che ha bisogno di sapere se ridurre le animazioni passa da
// qui invece di reimplementare il proprio matchMedia listener. I componenti
// Framer Motion prendono comunque la riduzione "gratis" da <MotionConfig
// reducedMotion="user"> in app/layout.tsx — questo hook serve per la logica
// che NON passa da Framer Motion (es. setInterval di route-progress).

import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)
    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return reduced
}
