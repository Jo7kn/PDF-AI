'use client'

import { useEffect, useState } from 'react'
import { Settings, Mail, Globe } from 'lucide-react'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations'
import { ChangePasswordForm } from '@/components/change-password-form'
import { DiscordLinkCard } from '@/components/discord-link-card'
import { Skeleton } from '@/components/skeleton'

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ email: string } | null>(null)
  const { locale, setLocale, t } = useLocale()

  useEffect(() => {
    getCurrentUserProfile().then((p) => p && setProfile(p))
  }, [])

  return (
    <div className="space-y-6">
      <section className="animate-fade-in-up rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 ">
        <div className="mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand" />
          <h1 className="text-xl font-semibold text-white">{t('settingsPage.title')}</h1>
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <Mail className="h-4 w-4" />
          {t('settingsPage.emailLabel')}
        </label>
        {profile ? (
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-neutral-400"
          />
        ) : (
          <Skeleton className="h-10 w-full" />
        )}
      </section>

      <section className="animate-fade-in-up rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 " style={{ animationDelay: '60ms' }}>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-white">{t('settingsPage.languageTitle')}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => setLocale(code)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out active:scale-[0.97] ${
                locale === code
                  ? 'border-brand/40 bg-brand/15 text-brand'
                  : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
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

      <DiscordLinkCard />
    </div>
  )
}
