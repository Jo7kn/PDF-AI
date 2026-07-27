'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Sostituisce l'intero root layout quando l'errore avviene lì (fuori dalla
// portata di app/error.tsx) — deve quindi renderizzare <html>/<body> da sé.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="it">
      <body className="flex min-h-screen items-center justify-center bg-[#050506] text-white">
        <div className="mx-4 max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-red-500/10 backdrop-blur-xl">
          <h1 className="mb-2 text-2xl font-semibold">Qualcosa è andato storto</h1>
          <p className="mb-6 text-sm text-slate-400">Il team è stato avvisato. Riprova.</p>
          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  )
}
