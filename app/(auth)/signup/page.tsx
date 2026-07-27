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
import { Loader2, Mail, Lock, User, Chrome, ArrowRight, Sparkle } from 'lucide-react'
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
    <Card className="w-full p-0">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-sm text-brand">
          <Sparkle className="h-4 w-4" fill="currentColor" />
          {t('signup.badge')}
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">{t('signup.title')}</CardTitle>
          <CardDescription className="mt-2 text-sm text-neutral-400">
            {t('signup.description')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">{t('signup.fullNameLabel')}</label>
            <Input
              type="text"
              placeholder={t('signup.fullNamePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">{t('signup.emailLabel')}</label>
            <Input
              type="email"
              placeholder="esempio@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">{t('signup.passwordLabel')}</label>
            <Input
              type="password"
              placeholder={t('signup.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">{t('signup.confirmPasswordLabel')}</label>
            <Input
              type="password"
              placeholder={t('signup.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
          {error && (
            <div className="animate-fade-in-up rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="flex items-start gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#0a0a0c] text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-[#050506]"
            />
            <label htmlFor="terms" className="text-sm text-neutral-400">
              {t('signup.agreePrefix')}{' '}
              <Link href="/terms" className="font-medium text-brand transition-colors duration-150 ease-out hover:text-[#7A85E5]">
                {t('signup.agreeTerms')}
              </Link>
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
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
            <span className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0c] px-2 text-neutral-500">{t('signup.or')}</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
          <Chrome className="mr-2 h-4 w-4" />
          {t('signup.googleSubmit')}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/[0.08] px-6 py-4">
        <p className="text-sm text-neutral-400">
          {t('signup.haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-brand transition-colors duration-150 ease-out hover:text-[#7A85E5]">
            {t('signup.loginLink')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}