'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, CheckCircle, KeyRound } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await resetPassword(email)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <Card className="w-full p-0">
      <CardHeader className="space-y-3 px-6 pt-6 text-left">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand shadow-[0_0_20px_-4px_rgba(94,106,210,0.7)]">
          <KeyRound className="h-5 w-5 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold text-white">Password dimenticata</CardTitle>
          <CardDescription className="mt-2 text-sm text-neutral-400">
            Ti invieremo un link per reimpostare la password.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-300">Email inviata!</h3>
            <p className="mt-2 text-sm text-neutral-400">Controlla la tua casella di posta per le istruzioni.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Email</label>
              <Input
                type="email"
                placeholder="esempio@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-4 h-4" />}
              />
            </div>
            {error && (
              <div className="animate-fade-in-up rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin-fast" />
                  Invio...
                </>
              ) : (
                'Invia link di reset'
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/[0.08] px-6 py-4">
        <Link href="/login" className="text-sm font-semibold text-brand transition-colors duration-150 ease-out hover:text-[#7A85E5]">
          Torna al login
        </Link>
      </CardFooter>
    </Card>
  )
}
