// components/coming-soon.tsx
//
// Placeholder mostrato al posto delle pagine funzionanti durante la fase di
// pre-lancio (vedi lib/feature-flags.ts): il link pubblico si può già
// condividere senza esporre strumenti, PDF AI o pagamento non ancora pronti
// per utenti reali.

import Link from 'next/link'
import { Clock, ArrowLeft, Sparkles, type LucideIcon } from 'lucide-react'

export function ComingSoon({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string
  description: string
  icon?: LucideIcon
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] px-4 text-center text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
        <Clock className="h-3.5 w-3.5" />
        Presto disponibile
      </div>
      <h1 className="mb-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mb-8 max-w-md text-slate-300">{description}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla home
      </Link>
    </div>
  )
}
