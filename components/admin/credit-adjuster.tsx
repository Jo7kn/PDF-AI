'use client'

// components/admin/credit-adjuster.tsx
//
// Strumento di supporto: rettifica manuale del saldo crediti di un utente
// per email (vedi app/actions/admin.ts adjustUserCredits). Pensato per casi
// come "webhook Stripe perso" o "gesto commerciale", non per l'uso normale.

import { useState } from 'react'
import { Zap, Loader2, Check, AlertCircle } from 'lucide-react'
import { adjustUserCredits } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Non autorizzato.',
  'email-required': 'Inserisci un’email.',
  'invalid-amount': 'Inserisci un importo diverso da zero.',
  'user-not-found': 'Nessun utente trovato con questa email.',
}

export function CreditAdjuster() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const delta = Number(amount)
    if (status === 'loading' || !email.trim() || !Number.isFinite(delta) || delta === 0) return

    setStatus('loading')
    const result = await adjustUserCredits(email, delta)

    if (result.success) {
      setStatus('success')
      setMessage(`${result.email}: ${result.previousBalance} → ${result.newBalance} crediti`)
      setAmount('')
    } else {
      setStatus('error')
      setMessage(ERROR_MESSAGES[result.error || ''] || 'Operazione fallita.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
          placeholder="email@utente.it"
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setStatus('idle') }}
          placeholder="+50 o -20"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none sm:w-32"
        />
        <Button type="submit" variant="subtle" className="flex-shrink-0 gap-2" disabled={status === 'loading' || !email.trim() || !amount}>
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <Zap className="h-4 w-4" />}
          Applica
        </Button>
      </div>
      {status === 'success' && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-300">
          <Check className="h-3.5 w-3.5" /> {message}
        </p>
      )}
      {status === 'error' && (
        <p className="flex items-center gap-1.5 text-xs text-red-300">
          <AlertCircle className="h-3.5 w-3.5" /> {message}
        </p>
      )}
    </form>
  )
}
