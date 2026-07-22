'use client'

import { useState } from 'react'
import {
  Sparkles,
  Mail,
  Reply,
  Wand2,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { runEmailAi } from '@/app/actions/email-ai'
import type { EmailAction } from '@/lib/nvidia/email'
import { useLocale } from '@/lib/i18n/locale-context'

const TONES = ['Professionale', 'Formale', 'Amichevole', 'Diretto', 'Diplomatico']

export default function EmailAiPage() {
  const { t } = useLocale()
  const [mode, setMode] = useState<EmailAction>('compose')
  const [input, setInput] = useState('')
  const [extraNote, setExtraNote] = useState('')
  const [tone, setTone] = useState('Professionale')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const MODES: Array<{ key: EmailAction; label: string; icon: typeof Mail; placeholder: string; needsOriginal: boolean }> = [
    { key: 'compose', label: t('emailAiPage.modeCompose'), icon: Mail, placeholder: t('emailAiPage.placeholderCompose'), needsOriginal: false },
    { key: 'reply', label: t('emailAiPage.modeReply'), icon: Reply, placeholder: t('emailAiPage.placeholderReply'), needsOriginal: true },
    { key: 'improve', label: t('emailAiPage.modeImprove'), icon: Wand2, placeholder: t('emailAiPage.placeholderImprove'), needsOriginal: true },
  ]

  const activeMode = MODES.find((m) => m.key === mode)!

  const handleRun = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)

    const result = await runEmailAi({
      action: mode,
      instructions: activeMode.needsOriginal ? (extraNote || undefined) : input,
      originalEmail: activeMode.needsOriginal ? input : undefined,
      tone,
    })

    if ('error' in result) {
      setError(result.error)
    } else {
      setOutput(result.result || null)
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copia fallita:', err)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={Mail}
        title="Email AI"
        subtitle={t('emailAiPage.subtitle')}
        gradient="from-blue-400 to-cyan-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Email AI: scrivi email professionali in pochi secondi</h1>
        <div className="mb-6 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setOutput(null); setError(null); setInput(''); setExtraNote('') }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                mode === m.key
                  ? 'border-blue-400/40 bg-blue-400/15 text-blue-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-400">
                {t('emailAiPage.toneLabel')}
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-400/50 focus:outline-none"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t} className="bg-slate-900">{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeMode.placeholder}
              rows={14}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-blue-400/50 focus:outline-none"
            />

            {activeMode.needsOriginal && (
              <input
                type="text"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                placeholder={t('emailAiPage.extraNotePlaceholder')}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
              />
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={loading || !input.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin-fast" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <activeMode.icon className="h-4 w-4" />
                  {activeMode.label}
                </>
              )}
            </button>
          </section>

          <section className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t('common.result')}</h2>
              {output && (
                <div className="flex items-center gap-2">
                  <SaveButton
                    tool="email-ai"
                    title={`Email AI · ${activeMode.label}`}
                    content={output}
                    metadata={{ action: mode, tone }}
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-blue-300" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? t('common.copied') : t('common.copy')}
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin-fast" />
                <p className="text-sm">{t('emailAiPage.writing')}</p>
              </div>
            )}

            {!loading && !output && !error && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-600">
                <Sparkles className="h-10 w-10" />
                <p className="text-sm">{t('emailAiPage.emailPlaceholder')}</p>
              </div>
            )}

            {!loading && output && (
              <div className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-relaxed text-slate-100">
                {output}
              </div>
            )}
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
