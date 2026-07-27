'use client'

import { useState } from 'react'
import {
  Sparkles,
  Languages,
  ArrowLeftRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { FaqSection } from '@/components/faq-section'
import { SaveButton } from '@/components/save-button'
import { AiLoadingState } from '@/components/ai-loading-state'
import { CopyIconSwap } from '@/components/animations/copy-icon-swap'
import { runTranslatorAi } from '@/app/actions/translator-ai'
import { useLocale } from '@/lib/i18n/locale-context'

const LANGUAGES = [
  'Italiano', 'Inglese', 'Spagnolo', 'Francese', 'Tedesco', 'Portoghese',
  'Olandese', 'Russo', 'Cinese (semplificato)', 'Giapponese', 'Coreano', 'Arabo',
]

const AUTO_DETECT = 'Rileva automaticamente'

export default function TranslatorAiPage() {
  const { t } = useLocale()
  const [sourceLanguage, setSourceLanguage] = useState(AUTO_DETECT)
  const [targetLanguage, setTargetLanguage] = useState('Inglese')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSwap = () => {
    if (sourceLanguage === AUTO_DETECT) return
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    if (output) {
      setInput(output)
      setOutput(null)
    }
  }

  const handleTranslate = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)

    const result = await runTranslatorAi({
      text: input,
      targetLanguage,
      sourceLanguage: sourceLanguage === AUTO_DETECT ? undefined : sourceLanguage,
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
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={Languages}
        title="Translator AI"
        subtitle={t('translatorAiPage.subtitle')}
        gradient="from-teal-400 to-cyan-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Translator AI: traduci documenti mantenendo il formato</h1>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
          <LanguageSelect value={sourceLanguage} onChange={setSourceLanguage} options={[AUTO_DETECT, ...LANGUAGES]} />
          <button
            onClick={handleSwap}
            disabled={sourceLanguage === AUTO_DETECT}
            title={t('translatorAiPage.swapTitle')}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] p-2.5 text-neutral-300 transition-[transform,background-color,color] duration-150 ease-out-strong hover:bg-white/[0.06] hover:text-white active:scale-[0.95] disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <LanguageSelect value={targetLanguage} onChange={setTargetLanguage} options={LANGUAGES} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-teal-500/10 backdrop-blur-xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('translatorAiPage.inputPlaceholder')}
              rows={14}
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-neutral-100 placeholder-neutral-600 focus:border-teal-400/50 focus:outline-none"
            />

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleTranslate}
              disabled={loading || !input.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin-fast" />
                  {t('translatorAiPage.translating')}
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  {t('translatorAiPage.translateButton')}
                </>
              )}
            </button>
          </section>

          <section className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-teal-500/10 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t('translatorAiPage.translationHeading')}</h2>
              {output && (
                <div className="flex items-center gap-2">
                  <SaveButton
                    tool="translator-ai"
                    title={`Traduzione · ${sourceLanguage} → ${targetLanguage}`}
                    content={output}
                    metadata={{ sourceLanguage, targetLanguage }}
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]"
                  >
                    <CopyIconSwap copied={copied} />
                    {copied ? t('common.copied') : t('common.copy')}
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <AiLoadingState />
            )}

            {!loading && !output && !error && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-600">
                <Sparkles className="h-10 w-10" />
                <p className="text-sm">{t('translatorAiPage.translationPlaceholder')}</p>
              </div>
            )}

            {!loading && output && (
              <div className="animate-fade-in-up max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm leading-relaxed text-neutral-100">
                {output}
              </div>
            )}
          </section>
        </div>
        <FaqSection slug="translator-ai" />
      </main>

      <AppFooter />
    </div>
  )
}

function LanguageSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-teal-400/50 focus:outline-none"
    >
      {options.map((lang) => (
        <option key={lang} value={lang} className="bg-[#0a0a0c]">{lang}</option>
      ))}
    </select>
  )
}
