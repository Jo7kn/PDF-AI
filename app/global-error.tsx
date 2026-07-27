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
        <div className="mx-4 max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-xl">
          <h1 className="mb-2 text-2xl font-semibold">Qualcosa è andato storto</h1>
          <p className="mb-6 text-sm text-neutral-400">Il team è stato avvisato. Riprova.</p>
          <button
            onClick={reset}
            className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  )
}
