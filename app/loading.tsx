'use client'

// app/loading.tsx
//
// Fallback Suspense automatico di Next.js. La barra/overlay affidabile che
// l'utente vede sempre è components/route-progress.tsx (agganciata al
// click, non al Suspense) — questo file resta come rete di sicurezza per i
// rari casi in cui Next sospende davvero il render, con LO STESSO stile
// visivo (sfondo con glow ciano, badge Sparkles) per coerenza totale.

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'

export default function Loading() {
  const { t } = useLocale()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    // Progresso simulato: non sappiamo mai il tempo reale di compilazione,
    // quindi accelera all'inizio e rallenta avvicinandosi al 97% — non
    // arriva mai al 100% da solo, ci pensa Next.js sostituendo la pagina
    // reale non appena è pronta.
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const next = 97 * (1 - Math.exp(-elapsed / 900))
      setProgress(next)
      if (next < 96.5) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
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
    </div>
  )
}
