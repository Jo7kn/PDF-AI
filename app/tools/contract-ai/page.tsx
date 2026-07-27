'use client'

import { useState } from 'react'
import {
  FileSignature,
  ScrollText,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { FaqSection } from '@/components/faq-section'
import { SaveButton } from '@/components/save-button'
import { AiLoadingState } from '@/components/ai-loading-state'
import { CopyIconSwap } from '@/components/animations/copy-icon-swap'
import { runContractAnalysis, runContractClauses } from '@/app/actions/contract-ai'
import type { ContractClause } from '@/lib/nvidia/contract'
import { useLocale } from '@/lib/i18n/locale-context'
import { TierGate } from '@/components/tier-gate'

type ContractMode = 'analyze' | 'clauses'

const RISK_STYLES: Record<ContractClause['risk'], string> = {
  basso: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  medio: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  alto: 'border-red-400/30 bg-red-400/10 text-red-200',
}

export default function ContractAiPage() {
  const { t } = useLocale()
  const [mode, setMode] = useState<ContractMode>('analyze')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [clauses, setClauses] = useState<ContractClause[] | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copia fallita:', err)
    }
  }

  const handleRun = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setClauses(null)

    if (mode === 'analyze') {
      const result = await runContractAnalysis(input)
      if ('error' in result) setError(result.error)
      else setAnalysis(result.result || null)
    } else {
      const result = await runContractClauses(input)
      if ('error' in result) setError(result.error)
      else setClauses(result.clauses || [])
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={FileSignature}
        title="Contract AI"
        subtitle={t('contractAiPage.subtitle')}
        gradient="from-slate-400 to-zinc-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Contract AI: analizza contratti e clausole a rischio</h1>
        <TierGate gradient="from-slate-400 to-zinc-500">
        <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
          {t('contractAiPage.disclaimer')}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => { setMode('analyze'); setAnalysis(null); setClauses(null); setError(null) }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
              mode === 'analyze'
                ? 'border-slate-300/40 bg-slate-300/15 text-neutral-100'
                : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
            }`}
          >
            <ScrollText className="h-4 w-4" />
            {t('contractAiPage.tabAnalysis')}
          </button>
          <button
            onClick={() => { setMode('clauses'); setAnalysis(null); setClauses(null); setError(null) }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
              mode === 'clauses'
                ? 'border-slate-300/40 bg-slate-300/15 text-neutral-100'
                : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            {t('contractAiPage.tabClauses')}
          </button>
        </div>

        <section className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-slate-400/10 backdrop-blur-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('contractAiPage.inputPlaceholder')}
            rows={12}
            className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-neutral-100 placeholder-neutral-600 focus:border-slate-300/50 focus:outline-none"
          />

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={loading || !input.trim()}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-500 to-zinc-600 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin-fast" />
                {t('contractAiPage.analyzing')}
              </>
            ) : (
              <>
                <FileSignature className="h-4 w-4" />
                {mode === 'analyze' ? t('contractAiPage.analyzeButton') : t('contractAiPage.findClausesButton')}
              </>
            )}
          </button>
        </section>

        {loading && (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-slate-400/10 backdrop-blur-xl">
            <AiLoadingState />
          </section>
        )}

        {!loading && !analysis && !clauses && !error && (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-slate-400/10 backdrop-blur-xl">
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-neutral-600">
              <Sparkles className="h-10 w-10" />
              <p className="text-sm">{t('common.resultPlaceholder')}</p>
            </div>
          </section>
        )}

        {!loading && analysis && (
          <section className="animate-fade-in-up rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-slate-400/10 backdrop-blur-xl">
            <div className="mb-3 flex justify-end gap-2">
              <SaveButton tool="contract-ai" title={t('contractAiPage.analysisTitle')} content={analysis} metadata={{ action: 'analyze' }} />
              <button
                onClick={() => handleCopy(analysis)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]"
              >
                <CopyIconSwap copied={copied} />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-100">{analysis}</div>
          </section>
        )}

        {!loading && clauses && (
          <div className="animate-fade-in-up space-y-3">
            {clauses.length > 0 && (
              <div className="flex justify-end gap-2">
                <SaveButton
                  tool="contract-ai"
                  title={t('contractAiPage.clausesTitle')}
                  content={clauses.map((c) => `${c.clause} (${t('contractAiPage.riskLabel')} ${c.risk})\n${c.explanation}`).join('\n\n')}
                  metadata={{ action: 'clauses', count: clauses.length }}
                />
                <button
                  onClick={() => handleCopy(clauses.map((c) => `${c.clause} (${t('contractAiPage.riskLabel')} ${c.risk})\n${c.explanation}`).join('\n\n'))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]"
                >
                  <CopyIconSwap copied={copied} />
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
              </div>
            )}
            {clauses.length === 0 && (
              <p className="text-sm text-neutral-400">{t('contractAiPage.noClauses')}</p>
            )}
            {clauses.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5  backdrop-blur-xl transition-colors duration-150 ease-out hover:border-white/20"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{c.clause}</p>
                  <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs capitalize ${RISK_STYLES[c.risk]}`}>
                    {t('contractAiPage.riskLabel')} {c.risk}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{c.explanation}</p>
              </div>
            ))}
          </div>
        )}
        </TierGate>
        <FaqSection slug="contract-ai" />
      </main>

      <AppFooter />
    </div>
  )
}
