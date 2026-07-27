'use client'

// components/change-password-form.tsx
//
// Riusata da /dashboard/settings (utente loggato che cambia password) e da
// /reset-password (utente arrivato dal link email "password dimenticata").
// In entrambi i casi chiama updatePassword() (app/actions/auth.ts), che
// richiede una sessione Supabase attiva — in /reset-password la sessione è
// quella temporanea creata dallo scambio del code nell'URL.

import { useState } from 'react'
import { KeyRound, Loader2, AlertCircle, Check } from 'lucide-react'
import { updatePassword } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/locale-context'

export function ChangePasswordForm({
  title,
  successMessage,
}: {
  title?: string
  successMessage?: string
}) {
  const { t } = useLocale()
  const resolvedTitle = title ?? t('changePasswordForm.title')
  const resolvedSuccessMessage = successMessage ?? t('changePasswordForm.successMessage')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t('changePasswordForm.errorMinLength'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('changePasswordForm.errorMismatch'))
      return
    }

    setLoading(true)
    const result = await updatePassword(password)
    // updatePassword reindirizza a /login su successo (throw interno di
    // Next.js): se il codice arriva qui, significa che ha restituito un
    // errore invece di reindirizzare.
    if (result && 'error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-semibold text-white">{resolvedTitle}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('changePasswordForm.newPasswordPlaceholder')}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('changePasswordForm.confirmPasswordPlaceholder')}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
        />

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            <Check className="h-4 w-4 flex-shrink-0" />
            <span>{resolvedSuccessMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[#6D79E0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin-fast" />}
          {t('changePasswordForm.updateButton')}
        </button>
      </form>
    </section>
  )
}
