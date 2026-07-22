'use client'

// components/coming-soon.tsx
//
// Placeholder mostrato al posto delle pagine funzionanti durante la fase di
// pre-lancio (vedi lib/feature-flags.ts): il link pubblico si può già
// condividere senza esporre strumenti, PDF AI o pagamento non ancora pronti
// per utenti reali.
//
// 'use client' perché il testo deve seguire la lingua scelta (useLocale) —
// i layout che lo montano sono Server Component e non possono leggere il
// LocaleContext direttamente, quindi la traduzione avviene qui dentro.

import Link from 'next/link'
import { useState } from 'react'
import { Clock, ArrowLeft, Sparkles, Mail, Check, Loader2, type LucideIcon } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { joinWaitlist } from '@/app/actions/waitlist'

// Nomi tool: non tradotti, stessa convenzione di AppHeader title="AI Writer"
// ecc. — sono nomi di prodotto, non stringhe di interfaccia.
const TOOL_NAMES: Record<string, string> = {
  'ai-writer': 'AI Writer',
  'code-ai': 'Code AI',
  'chat-ai': 'Chat AI',
  'file-converter': 'File Converter',
  'translator-ai': 'Translator AI',
  'data-ai': 'Data AI',
  'study-ai': 'Study AI',
  'contract-ai': 'Contract AI',
  'image-ai': 'Image AI',
  'email-ai': 'Email AI',
}

type ComingSoonProps =
  | { variant: 'tool'; tool: keyof typeof TOOL_NAMES; icon?: LucideIcon }
  | { variant: 'dashboard'; icon?: LucideIcon }
  | { variant: 'document'; icon?: LucideIcon }
  | { variant: 'billing'; icon?: LucideIcon }

type WaitlistStatus = 'idle' | 'loading' | 'success' | 'already-joined' | 'invalid-email' | 'rate-limited' | 'error'

export function ComingSoon(props: ComingSoonProps) {
  const { t } = useLocale()
  const Icon = props.icon ?? Sparkles
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<WaitlistStatus>('idle')

  let title: string
  let description: string
  let source: string
  switch (props.variant) {
    case 'tool': {
      const name = TOOL_NAMES[props.tool]
      title = name
      description = t('comingSoon.toolDescription', { tool: name })
      source = props.tool
      break
    }
    case 'dashboard':
      title = t('comingSoon.dashboardTitle')
      description = t('comingSoon.dashboardDescription')
      source = 'dashboard'
      break
    case 'document':
      title = t('comingSoon.documentTitle')
      description = t('comingSoon.documentDescription')
      source = 'document'
      break
    case 'billing':
      title = t('comingSoon.billingTitle')
      description = t('comingSoon.billingDescription')
      source = 'billing'
      break
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    const result = await joinWaitlist(email, source)
    setStatus(result.status === 'success' ? 'success' : result.status)
  }

  const joined = status === 'success' || status === 'already-joined'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] px-4 text-center text-white">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
        <Clock className="h-3.5 w-3.5" />
        {t('comingSoon.badge')}
      </div>
      <h1 className="mb-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mb-8 max-w-md text-slate-300">{description}</p>

      {joined ? (
        <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-200">
          <Check className="h-4 w-4 flex-shrink-0" />
          {status === 'already-joined' ? t('comingSoon.notifyAlreadyJoined') : t('comingSoon.notifySuccess')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status !== 'loading') setStatus('idle') }}
              placeholder={t('comingSoon.notifyPlaceholder')}
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin-fast" />}
            {t('comingSoon.notifyButton')}
          </button>
        </form>
      )}

      {(status === 'invalid-email' || status === 'rate-limited' || status === 'error') && (
        <p className="mb-4 max-w-sm text-sm text-red-300">
          {status === 'invalid-email' && t('comingSoon.notifyInvalidEmail')}
          {status === 'rate-limited' && t('comingSoon.notifyRateLimited')}
          {status === 'error' && t('comingSoon.notifyError')}
        </p>
      )}

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-150 ease-out hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('comingSoon.backHome')}
      </Link>
    </div>
  )
}
