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
import { useLocale } from '@/lib/i18n/locale-context'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLocale()
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
      setError(t('signup.errorPasswordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('signup.errorPasswordTooShort'))
      return
    }

    if (!agreed) {
      setError(t('signup.errorTermsRequired'))
      return
    }

    setLoading(true)
    setError(null)

    const result = await signUp(email, password, fullName, refCode || undefined)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.needsVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
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
        options: getOAuthOptions(window.location.origin, refCode ? { ref: refCode } : undefined),
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
    <Card className="w-full border border-white/10 bg-slate-900/85 p-0 shadow-2xl shadow-fuchsia-500/10">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1 text-sm text-fuchsia-200">
          <Sparkles className="h-4 w-4" />
          {t('signup.badge')}
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">{t('signup.title')}</CardTitle>
          <CardDescription className="mt-2 text-sm text-slate-400">
            {t('signup.description')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t('signup.fullNameLabel')}</label>
            <Input
              type="text"
              placeholder={t('signup.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t('signup.emailLabel')}</label>
            <Input
              type="email"
              placeholder="esempio@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Mail className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t('signup.passwordLabel')}</label>
            <Input
              type="password"
              placeholder={t('signup.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">{t('signup.confirmPasswordLabel')}</label>
            <Input
              type="password"
              placeholder={t('signup.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
          {error && (
            <div className="animate-fade-in-up rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              {t('signup.agreePrefix')}{' '}
              <Link href="/terms" className="font-medium text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
                {t('signup.agreeTerms')}
              </Link>
            </label>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin-fast" />
                {t('common.loading')}
              </>
            ) : (
              <>
                {t('signup.submit')}
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
            <span className="bg-slate-900/80 px-2 text-slate-400">{t('signup.or')}</span>
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
          {t('signup.googleSubmit')}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 px-6 py-4">
        <p className="text-sm text-slate-400">
          {t('signup.haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-cyan-300 transition-colors duration-150 ease-out hover:text-cyan-200">
            {t('signup.loginLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}