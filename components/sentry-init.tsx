'use client'

import { useEffect } from 'react'

// Import dinamico dietro un env var vuoto in build: Next inlinea
// NEXT_PUBLIC_SENTRY_DSN come stringa costante, quindi finche' resta ""
// il minifier elimina questo intero ramo (e con esso @sentry/nextjs) dal
// bundle — costo zero finche' non e' configurato un DSN reale.
export function SentryInit() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.1,
      })
    })
  }, [])

  return null
}
