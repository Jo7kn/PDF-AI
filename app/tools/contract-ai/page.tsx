'use client'

import { useState } from 'react'
import {
  FileSignature,
  ScrollText,
  ShieldAlert,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { runContractAnalysis, runContractClauses } from '@/app/actions/contract-ai'
import type { ContractClause } from '@/lib/nvidia/contract'
import { useLocale } from '@/lib/i18n/locale-context'

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
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={FileSignature}
        title="Contract AI"
        subtitle={t('contractAiPage.subtitle')}
        gradient="from-slate-400 to-zinc-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-200">
          {t('contractAiPage.disclaimer')}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => { setMode('analyze'); setAnalysis(null); setClauses(null); setError(null) }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
              mode === 'analyze'
                ? 'border-slate-300/40 bg-slate-300/15 text-slate-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ScrollText className="h-4 w-4" />
            {t('contractAiPage.tabAnalysis')}
          </button>
          <button
            onClick={() => { setMode('clauses'); setAnalysis(null); setClauses(null); setError(null) }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
              mode === 'clauses'
                ? 'border-slate-300/40 bg-slate-300/15 text-slate-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            {t('contractAiPage.tabClauses')}
          </button>
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('contractAiPage.inputPlaceholder')}
            rows={12}
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-slate-300/50 focus:outline-none"
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

        {analysis && (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-3 flex justify-end">
              <SaveButton tool="contract-ai" title={t('contractAiPage.analysisTitle')} content={analysis} metadata={{ action: 'analyze' }} />
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{analysis}</div>
          </section>
        )}

        {clauses && (
          <div className="space-y-3">
            {clauses.length > 0 && (
              <div className="flex justify-end">
                <SaveButton
                  tool="contract-ai"
                  title={t('contractAiPage.clausesTitle')}
                  content={clauses.map((c) => `${c.clause} (${t('contractAiPage.riskLabel')} ${c.risk})\n${c.explanation}`).join('\n\n')}
                  metadata={{ action: 'clauses', count: clauses.length }}
                />
              </div>
            )}
            {clauses.length === 0 && (
              <p className="text-sm text-slate-400">{t('contractAiPage.noClauses')}</p>
            )}
            {clauses.map((c, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{c.clause}</p>
                  <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs capitalize ${RISK_STYLES[c.risk]}`}>
                    {t('contractAiPage.riskLabel')} {c.risk}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{c.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
