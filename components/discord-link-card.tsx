'use client'

// components/discord-link-card.tsx
//
// Web-side half of the Discord account link: generates the code that /link redeems in
// Discord (bot/src/commands/link.ts). See app/actions/discord.ts for why every call here
// goes through the service client instead of RLS.

import { useEffect, useState } from 'react'
import { Link2, Unlink } from 'lucide-react'
import { generateDiscordLinkCode, getDiscordLinkStatus, unlinkDiscordAccount } from '@/app/actions/discord'
import { CopyIconSwap } from '@/components/animations/copy-icon-swap'
import { Skeleton } from '@/components/skeleton'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

type Status = 'loading' | 'unlinked' | 'linked'

export function DiscordLinkCard() {
  const { locale, t } = useLocale()
  const [status, setStatus] = useState<Status>('loading')
  const [linkedAt, setLinkedAt] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [copied, setCopied] = useState(false)

  async function refreshStatus() {
    const result = await getDiscordLinkStatus()
    if ('error' in result) return
    setStatus(result.linked ? 'linked' : 'unlinked')
    setLinkedAt(result.linkedAt ?? null)
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  async function handleGenerate() {
    setGenerating(true)
    const result = await generateDiscordLinkCode()
    setGenerating(false)
    if (!('error' in result)) setCode(result.code)
  }

  async function handleCopy() {
    if (!code) return
    await navigator.clipboard.writeText(`/link code:${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handleUnlink() {
    setUnlinking(true)
    await unlinkDiscordAccount()
    setUnlinking(false)
    setCode(null)
    await refreshStatus()
  }

  return (
    <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20" style={{ animationDelay: '140ms' }}>
      <div className="mb-4 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-cyan-300" />
        <h2 className="text-lg font-semibold text-white">{t('discordCard.title')}</h2>
      </div>

      {status === 'loading' && <Skeleton className="h-10 w-full" />}

      {status === 'linked' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-300">{t('discordCard.connected')}</p>
            {linkedAt && <p className="mt-0.5 text-xs text-slate-400">{t('discordCard.since', { date: new Date(linkedAt).toLocaleDateString(LOCALE_DATE_TAG[locale]) })}</p>}
          </div>
          <button
            onClick={handleUnlink}
            disabled={unlinking}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-red-400/15 hover:text-red-300 active:scale-[0.97] disabled:opacity-50"
          >
            <Unlink className="h-3.5 w-3.5" />
            {unlinking ? t('discordCard.disconnecting') : t('discordCard.disconnect')}
          </button>
        </div>
      )}

      {status === 'unlinked' && !code && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">{t('discordCard.connectPrompt')}</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-lg bg-cyan-400/15 px-4 py-2 text-sm text-cyan-200 transition-colors duration-150 ease-out hover:bg-cyan-400/25 active:scale-[0.97] disabled:opacity-50"
          >
            {generating ? t('discordCard.generating') : t('discordCard.generateCode')}
          </button>
        </div>
      )}

      {status === 'unlinked' && code && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
            <code className="text-sm text-cyan-200">/link code:{code}</code>
            <button onClick={handleCopy} className="text-slate-300 transition-colors duration-150 ease-out hover:text-white" title="Copy command">
              <CopyIconSwap copied={copied} />
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {t('discordCard.runCommand')}
          </p>
          <button onClick={refreshStatus} className="text-xs text-cyan-300 underline-offset-2 hover:underline">
            {t('discordCard.checkStatus')}
          </button>
        </div>
      )}
    </section>
  )
}
