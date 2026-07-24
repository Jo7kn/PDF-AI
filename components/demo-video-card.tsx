'use client'

// components/demo-video-card.tsx
//
// Box "anteprima video" di fianco alla console annunci su landing/home.
// Stessa estetica a finestra (barra + pallini) per coerenza visiva.
// public/in_inglese.mp4 ha audio reale (narrazione) — niente autoplay muto:
// oltre a togliere senso all'audio, l'autoplay CON audio è comunque bloccato
// di default da tutti i browser. Controls nativi, play avviato dall'utente.

import { useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useLocale } from '@/lib/i18n/locale-context'

const VIDEO_SRC = '/in_inglese.mp4'

export function DemoVideoCard({ className = 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8' }: { className?: string }) {
  const { t } = useLocale()
  const [hasError, setHasError] = useState(false)

  return (
    <section className={className}>
      <ScrollReveal delay={0.08}>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clapperboard className="h-3.5 w-3.5 text-violet-300" />
              {t('demoVideo.windowTitle')}
            </div>
          </div>

          <div className="relative aspect-video w-full bg-black">
            {hasError ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
                <Clapperboard className="h-8 w-8" />
                <p className="text-sm">{t('demoVideo.comingSoon')}</p>
              </div>
            ) : (
              <video
                className="h-full w-full object-cover"
                src={VIDEO_SRC}
                controls
                loop
                playsInline
                preload="metadata"
                onError={() => setHasError(true)}
              />
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
