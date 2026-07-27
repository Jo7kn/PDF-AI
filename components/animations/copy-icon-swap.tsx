'use client'

// components/animations/copy-icon-swap.tsx
//
// Feedback ricco per i bottoni "copia" sparsi nei tool (oggi ovunque uno
// swap istantaneo Copy/Check): la nuova icona entra con un piccolo pop
// (scale-in) invece di scattare, cosi' il click si sente confermato.
// Riutilizzabile ovunque c'e' lo stesso pattern `copied ? Check : Copy`.

import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'

export function CopyIconSwap({ copied, className = 'h-3.5 w-3.5' }: { copied: boolean; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {copied ? (
        <motion.span
          key="check"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex"
        >
          <Check className={`${className} text-emerald-400`} />
        </motion.span>
      ) : (
        <motion.span
          key="copy"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex"
        >
          <Copy className={className} />
        </motion.span>
      )}
    </AnimatePresence>
  )
}
