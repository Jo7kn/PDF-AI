'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { verifyEmailCode, resendVerificationCode } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, KeyRound, Mail, RotateCw, Check } from 'lucide-react'

// Supabase throttla il resend a ~60s lato server di default — un cooldown
// più corto qui garantirebbe quasi sempre un primo tentativo fallito.
const RESEND_COOLDOWN_S = 60

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown > 0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return

    setLoading(true)
    setError(null)

    const result = await verifyEmailCode(email, code.trim())

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleResend = async () => {
    if (!email || cooldown > 0) return
    setResent(false)
    const result = await resendVerificationCode(email)
    if (!result.error) {
      setResent(true)
      setCooldown(RESEND_COOLDOWN_S)
    } else {
      setError(result.error)
    }
  }

  return (
    <Card className="w-full border border-white/10 bg-slate-900/85 p-2 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
          <KeyRound className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">Verifica la tua email</CardTitle>
          <CardDescription className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
            Codice inviato a {email || 'la tua email'}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Codice di verifica</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              className="w-full border-white/10 bg-slate-950/80 text-center text-lg tracking-[0.5em] text-white placeholder:text-slate-500"
              icon={<KeyRound className="w-4 h-4 text-slate-400" />}
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
          )}
          <Button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400" disabled={loading || code.trim().length < 6}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin-fast" />
                Verifica...
              </>
            ) : (
              'Verifica'
            )}
          </Button>
        </form>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="flex w-full items-center justify-center gap-1.5 text-sm text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200 disabled:cursor-not-allowed disabled:text-slate-500"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {cooldown > 0 ? `Rinvia codice (${cooldown}s)` : 'Rinvia codice'}
        </button>
        {resent && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-300">
            <Check className="h-3.5 w-3.5" /> Nuovo codice inviato.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
        <p className="text-sm text-slate-400">
          Email sbagliata?{' '}
          <Link href="/signup" className="font-semibold text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
            Torna alla registrazione
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}
