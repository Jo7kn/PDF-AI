'use client'

// components/ai-loading-state.tsx
//
// Placeholder mostrato mentre un tool AI aspetta risposta dal modello.
// Con retry (vedi lib/nvidia/fetch-with-retry.ts) un'attesa può arrivare a
// ~110s: uno spinner con un solo messaggio statico per 2 minuti sembra
// bloccato. Il messaggio ruota nel tempo per far percepire che qualcosa sta
// ancora succedendo, non per mostrare un progresso reale (il server non
// espone stadi intermedi — la action è una singola chiamata opaca).

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale } from '@/lib/i18n/locale-context'

const STAGE_KEYS = ['aiLoading.stage1', 'aiLoading.stage2', 'aiLoading.stage3', 'aiLoading.stage4'] as const
const STAGE_DELAYS_MS = [0, 8000, 20000, 45000]

export function AiLoadingState({ className = 'h-64' }: { className?: string }) {
  const { t } = useLocale()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    setStage(0)
    const timers = STAGE_DELAYS_MS.slice(1).map((delay, i) => setTimeout(() => setStage(i + 1), delay))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin-fast" />
      {/* transition-opacity da solo non bastava: `stage` cambia via
          re-render, nessun valore di opacity veniva mai toggled — il
          messaggio scattava invece di dissolversi. AnimatePresence anima
          davvero l'entrata/uscita di ogni stadio. */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-sm"
        >
          {t(STAGE_KEYS[stage])}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
