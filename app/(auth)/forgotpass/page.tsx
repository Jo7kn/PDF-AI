'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await resetPassword(email)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">Reset Password</CardTitle>
          <CardDescription className="text-slate-300">
            Ti invieremo un link per reimpostare la password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700">Email inviata!</h3>
              <p className="text-sm text-gray-600 mt-2">
                Controlla la tua casella di posta per le istruzioni.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input
                  type="email"
                  placeholder="esempio@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 text-white"
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Invio...
                  </>
                ) : (
                  'Invia link di reset'
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Torna al login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}