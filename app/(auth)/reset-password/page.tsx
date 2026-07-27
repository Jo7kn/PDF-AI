import { KeyRound } from 'lucide-react'
import { ChangePasswordForm } from '@/components/change-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand shadow-[0_0_20px_-4px_rgba(94,106,210,0.7)]">
          <KeyRound className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-white">Imposta una nuova password</h1>
        <p className="mt-2 text-sm text-neutral-400">Scegli una nuova password per il tuo account.</p>
      </div>

      <ChangePasswordForm title="Nuova password" successMessage="Fatto! Verrai reindirizzato al login..." />
    </div>
  )
}
