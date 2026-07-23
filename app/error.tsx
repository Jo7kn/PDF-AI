'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center shadow-2xl shadow-red-500/10 backdrop-blur-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Qualcosa è andato storto</h1>
        <p className="mb-6 text-sm text-slate-400">Il team è stato avvisato. Riprova o torna alla home.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
