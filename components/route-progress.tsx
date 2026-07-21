'use client'

// components/route-progress.tsx
//
// Overlay di caricamento affidabile per le navigazioni client-side, con lo
// stesso stile visivo del resto della piattaforma (sfondo con glow ciano,
// badge Sparkles ciano->viola — vedi AppHeader/home/dashboard). Si aggancia
// direttamente al click sui link (non al meccanismo Suspense di Next.js:
// le nostre pagine sono client component che caricano i dati via useEffect
// DOPO il mount, quindi non sospendono mai il render e app/loading.tsx da
// solo non scatta in modo affidabile).

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion'

export function RouteProgress() {
  const { t } = useLocale()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<number>()
  const hideTimeoutRef = useRef<number>()
  const prevPathname = useRef(pathname)

  // start()/complete() sono richiamate da un listener di click registrato
  // una sola volta (effetto con deps [], vedi sotto): leggono da un ref,
  // non dallo stato reattivo dell'hook, cosi' vedono sempre il valore
  // aggiornato invece di restare agganciate a quello della prima render.
  const reducedMotionHook = useReducedMotion()
  const reducedMotion = useRef(false)
  useEffect(() => {
    reducedMotion.current = reducedMotionHook
  }, [reducedMotionHook])

  // La pathname è già cambiata: la navigazione è arrivata, completa e nascondi.
  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname
    complete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement)?.closest('a')
      if (!anchor) return
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname) return
      } catch {
        return
      }

      start()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function start() {
    window.clearTimeout(hideTimeoutRef.current)
    window.clearInterval(intervalRef.current)
    setVisible(true)
    setProgress(15)
    if (reducedMotion.current) {
      setProgress(90)
      return
    }
    // Avanza rallentando verso il 92%: non arriva mai da sola al 100%, ci
    // pensa complete() quando la navigazione è davvero finita.
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => (p < 92 ? p + (92 - p) * 0.15 : p))
    }, 160)
  }

  function complete() {
    window.clearInterval(intervalRef.current)
    setProgress(100)
    hideTimeoutRef.current = window.setTimeout(
      () => {
        setVisible(false)
        window.setTimeout(() => setProgress(0), 200)
      },
      reducedMotion.current ? 0 : 200,
    )
  }

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className={`flex flex-col items-center gap-5 transition-[opacity,transform] duration-500 ease-out-strong ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <p className="text-2xl font-bold tracking-tight text-white">AI Toolbox</p>
        <div className="h-px w-40 bg-white/15" />
        <div className="flex w-40 items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-[0.2em] text-slate-500">{t('common.loading')}</span>
          <span className="font-mono tabular-nums text-slate-300">{Math.floor(progress)}%</span>
        </div>
      </div>

      {/* Barra sottile in cima: feedback immediato anche prima che l'overlay
          diventi visivamente prominente, coerente col resto della UI. */}
      <div
        className={`absolute left-0 top-0 h-[3px] w-full transition-opacity duration-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          className="h-full origin-left bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.55)] transition-transform duration-[400ms] ease-out-strong"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  )
}
