'use client'

// components/smooth-scroll-provider.tsx
//
// Lenis smooth scroll globale — inerzia sullo scroll nativo, stessa libreria
// dietro Linear/motionsites.ai. useReducedMotion disabilita l'inerzia (scroll
// nativo istantaneo) invece di lasciarla attiva: chi chiede reduced motion
// non vuole nemmeno il "drift" dello scroll smorzato.

import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return

    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) })
    let frame: number
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reduceMotion])

  return <>{children}</>
}
