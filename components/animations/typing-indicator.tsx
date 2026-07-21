'use client'

// components/animations/typing-indicator.tsx
//
// Tre puntini che salgono e scendono in cascata, il linguaggio visivo
// standard di "sta scrivendo" nelle chat. bg-current cosi' eredita il
// colore testo del contesto in cui viene messo, invece di un colore fisso.

import { motion } from 'framer-motion'

export function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}
