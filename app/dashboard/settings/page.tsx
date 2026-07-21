'use client'

import { useEffect, useState } from 'react'
import { Settings, Mail, Globe } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations'
import { ChangePasswordForm } from '@/components/change-password-form'
import { Skeleton } from '@/components/skeleton'

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ email: string } | null>(null)
  const { locale, setLocale } = useLocale()

  useEffect(() => {
    getCurrentUserProfile().then((p) => p && setProfile(p))
  }, [])

  return (
    <div className="space-y-6">
      <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
        <div className="mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-300" />
          <h1 className="text-xl font-semibold text-white">Impostazioni account</h1>
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
          <Mail className="h-4 w-4" />
          Email
        </label>
        {profile ? (
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400"
          />
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
      </section>

      <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20" style={{ animationDelay: '60ms' }}>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-300" />
          <h2 className="text-lg font-semibold text-white">Lingua</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out active:scale-[0.97] ${
                locale === code
                  ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="text-base leading-none">{LOCALE_LABELS[code].flag}</span>
              {LOCALE_LABELS[code].name}
            </button>
          ))}
        </div>
      </section>

      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
