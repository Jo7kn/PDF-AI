'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { getOAuthOptions } from '@/lib/auth/oauth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, Chrome, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('error')
    if (oauthError) {
      setError(oauthError)
    }
  }, [])

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {  // ← TIPO ESPLICITO
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn(email, password)
    
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
      setError(err instanceof Error ? err.message : 'Google login failed')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-white/10 bg-slate-900/85 p-2 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Accesso sicuro
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">Bentornato</CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-400">
            Accedi al tuo account e riprendi da dove hai lasciato.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                Accedi
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
          Accedi con Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
        <p className="text-sm text-slate-400">
          Non hai un account?{' '}
          <Link href="/signup" className="font-semibold text-cyan-300 transition hover:text-cyan-200">
            Registrati
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}