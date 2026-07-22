'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { getOAuthOptions } from '@/lib/auth/oauth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, User, Chrome, ArrowRight, Sparkles } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('error')
    if (oauthError) {
      setError(oauthError)
    }
    const ref = params.get('ref')
    if (ref) setRefCode(ref)
  }, [])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere almeno 6 caratteri')
      return
    }

    if (!agreed) {
      setError('Devi accettare i termini e condizioni')
      return
    }

    setLoading(true)
    setError(null)

    const result = await signUp(email, password, fullName, refCode || undefined)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: getOAuthOptions(window.location.origin),
      })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-white/10 bg-slate-900/85 p-2 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1 text-sm text-fuchsia-200">
          <Sparkles className="h-4 w-4" />
          Inizia gratis
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">Crea il tuo account</CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-400">
            Inizia oggi la tua prova gratuita e sfrutta subito l’AI sui tuoi PDF.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome completo</label>
            <Input
              type="text"
              placeholder="Mario Rossi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <Input
              type="email"
              placeholder="esempio@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <Input
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Conferma password</label>
            <Input
              type="password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              Accetto i{' '}
              <Link href="/terms" className="font-medium text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
                termini e condizioni
              </Link>
            </label>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin-fast" />
                Caricamento...
              </>
            ) : (
              <>
                Registrati
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/80 px-2 text-slate-400">Oppure</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Registrati con Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
        <p className="text-sm text-slate-400">
          Hai già un account?{' '}
          <Link href="/login" className="font-semibold text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
            Accedi
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}