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
      <div className="max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Qualcosa è andato storto</h1>
        <p className="mb-6 text-sm text-neutral-400">Il team è stato avvisato. Riprova o torna alla home.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-white/[0.06]"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
