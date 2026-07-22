'use client'

import { useMemo, useState } from 'react'
import {
  Sparkles,
  Database,
  Upload,
  Loader2,
  AlertCircle,
  BarChart3,
  Rows3,
  Columns3,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { FaqSection } from '@/components/faq-section'
import { SaveButton } from '@/components/save-button'
import { runDataInsights } from '@/app/actions/data-ai'
import { parseCsv, isNumericColumn, type ParsedCsv } from '@/lib/csv'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'
import { TierGate } from '@/components/tier-gate'

export default function DataAiPage() {
  const { t, locale } = useLocale()
  const [csvText, setCsvText] = useState('')
  const [parsed, setParsed] = useState<ParsedCsv | null>(null)
  const [numericCol, setNumericCol] = useState<string>('')
  const [groupCol, setGroupCol] = useState<string>('')
  const [insights, setInsights] = useState<string | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const numericColumns = useMemo(() => {
    if (!parsed) return []
    return parsed.headers.filter((_, i) => isNumericColumn(parsed, i))
  }, [parsed])

  const categoricalColumns = useMemo(() => {
    if (!parsed) return []
    return parsed.headers.filter((_, i) => !isNumericColumn(parsed, i))
  }, [parsed])

  const handleParse = (text: string) => {
    setCsvText(text)
    setInsights(null)
    setError(null)
    setFileError(null)
    try {
      const result = parseCsv(text)
      if (result.headers.length === 0) {
        setParsed(null)
        return
      }
      setParsed(result)
      const firstNumeric = result.headers.find((_, i) => isNumericColumn(result, i))
      const firstCategorical = result.headers.find((_, i) => !isNumericColumn(result, i))
      setNumericCol(firstNumeric || '')
      setGroupCol(firstCategorical || '')
    } catch {
      setFileError(t('dataAiPage.csvErrorParse'))
      setParsed(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError(t('dataAiPage.csvErrorFormat'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => handleParse(String(reader.result || ''))
    reader.readAsText(file)
  }

  const chartData = useMemo(() => {
    if (!parsed || !numericCol) return []
    const numIndex = parsed.headers.indexOf(numericCol)
    const groupIndex = groupCol ? parsed.headers.indexOf(groupCol) : -1

    if (groupIndex === -1) {
      return parsed.rows.slice(0, 12).map((row, i) => ({
        label: `${t('dataAiPage.rowLabel')} ${i + 1}`,
        value: Number(row[numIndex]) || 0,
      }))
    }

    const totals = new Map<string, number>()
    for (const row of parsed.rows) {
      const key = row[groupIndex] || '(vuoto)'
      const value = Number(row[numIndex]) || 0
      totals.set(key, (totals.get(key) || 0) + value)
    }

    return Array.from(totals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }, [parsed, numericCol, groupCol])

  const buildSummary = (): string => {
    if (!parsed) return ''
    const lines: string[] = []
    lines.push(`Righe: ${parsed.rows.length}, Colonne: ${parsed.headers.length}`)
    lines.push(`Colonne: ${parsed.headers.join(', ')}`)
    lines.push(`Colonne numeriche: ${numericColumns.join(', ') || 'nessuna'}`)

    for (const col of numericColumns) {
      const idx = parsed.headers.indexOf(col)
      const values = parsed.rows.map((r) => Number(r[idx])).filter((v) => !Number.isNaN(v))
      if (values.length === 0) continue
      const sum = values.reduce((a, b) => a + b, 0)
      const min = Math.min(...values)
      const max = Math.max(...values)
      lines.push(`- ${col}: min=${min}, max=${max}, media=${(sum / values.length).toFixed(2)}`)
    }

    lines.push('\nPrime righe di esempio:')
    lines.push(parsed.headers.join(' | '))
    parsed.rows.slice(0, 5).forEach((row) => lines.push(row.join(' | ')))

    return lines.join('\n')
  }

  const handleGenerateInsights = async () => {
    if (!parsed || loadingInsights) return
    setLoadingInsights(true)
    setError(null)
    const result = await runDataInsights(buildSummary())
    if ('error' in result) setError(result.error)
    else setInsights(result.result || null)
    setLoadingInsights(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={Database}
        title="Data AI"
        subtitle={t('dataAiPage.subtitle')}
        gradient="from-sky-400 to-blue-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Data AI: analizza CSV ed Excel con l’AI</h1>
        <TierGate gradient="from-sky-400 to-blue-500">
        {!parsed && (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div
              className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center transition-colors duration-150 ease-out hover:border-sky-400/40"
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-2 text-white">{t('dataAiPage.uploadTitle')}</p>
              <p className="text-sm text-slate-500">{t('dataAiPage.uploadSubtitle')}</p>
              <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </div>

            {fileError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <textarea
              value={csvText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder={t('dataAiPage.csvPlaceholder')}
              rows={8}
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-sky-400/50 focus:outline-none"
            />
          </section>
        )}

        {parsed && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-3">
                <StatTile icon={Rows3} label={t('dataAiPage.rows')} value={parsed.rows.length.toString()} />
                <StatTile icon={Columns3} label={t('dataAiPage.columns')} value={parsed.headers.length.toString()} />
              </div>
              <button
                onClick={() => { setParsed(null); setCsvText(''); setInsights(null) }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10"
              >
                {t('dataAiPage.loadAnother')}
              </button>
            </div>

            <section className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-sky-300" />
                  <h2 className="text-lg font-semibold">{t('dataAiPage.chartTitle')}</h2>
                </div>
                <label className="ml-auto flex items-center gap-2 text-sm text-slate-400">
                  {t('dataAiPage.valueLabel')}
                  <select
                    value={numericCol}
                    onChange={(e) => setNumericCol(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                  >
                    {numericColumns.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  {t('dataAiPage.groupByLabel')}
                  <select
                    value={groupCol}
                    onChange={(e) => setGroupCol(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400/50 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900">{t('dataAiPage.noneByRow')}</option>
                    {categoricalColumns.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </label>
              </div>

              {numericColumns.length === 0 ? (
                <p className="text-sm text-slate-500">{t('dataAiPage.noNumericColumns')}</p>
              ) : (
                <BarChart data={chartData} locale={locale} />
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{t('dataAiPage.insightsTitle')}</h2>
                <button
                  onClick={handleGenerateInsights}
                  disabled={loadingInsights}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                  {loadingInsights ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <Sparkles className="h-4 w-4" />}
                  {t('dataAiPage.generateInsights')}
                </button>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!insights && !loadingInsights && (
                <p className="text-sm text-slate-500">{t('dataAiPage.insightsEmpty')}</p>
              )}

              {insights && (
                <>
                  <div className="mb-3 flex justify-end">
                    <SaveButton tool="data-ai" title={t('dataAiPage.insightsSavedTitle')} content={insights} />
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{insights}</div>
                </>
              )}
            </section>
          </>
        )}
        </TierGate>
        <FaqSection slug="data-ai" />
      </main>

      <AppFooter />
    </div>
  )
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Rows3; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 shadow-xl shadow-black/20">
      <div className="mb-1 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

// Bar chart a singola serie (una sola tonalità cyan, coerente col brand):
// barre sottili, angoli arrotondati 4px in cima, gap 2px tra le barre,
// gridline hairline, tooltip on-hover, valore diretto solo sulla barra max.
function BarChart({ data, locale }: { data: { label: string; value: number }[]; locale: keyof typeof LOCALE_DATE_TAG }) {
  const { t } = useLocale()
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">{t('dataAiPage.noChartData')}</p>
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const maxIndex = data.findIndex((d) => d.value === maxValue)
  const chartHeight = 220

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[480px] items-end gap-2" style={{ height: chartHeight + 48 }}>
        {data.map((d, i) => {
          const barHeight = Math.max((d.value / maxValue) * chartHeight, 2)
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
              <div className="relative flex w-full flex-col items-center justify-end" style={{ height: chartHeight }}>
                {i === maxIndex && (
                  <span className="mb-1 text-xs font-medium text-slate-300">{d.value.toLocaleString(LOCALE_DATE_TAG[locale])}</span>
                )}
                {hovered === i && i !== maxIndex && (
                  <span className="absolute -top-6 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg">
                    {d.value.toLocaleString(LOCALE_DATE_TAG[locale])}
                  </span>
                )}
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full max-w-[24px] rounded-t-[4px] bg-cyan-400 transition-opacity hover:opacity-80"
                  style={{ height: barHeight }}
                />
              </div>
              <p className="mt-2 w-full truncate text-center text-[11px] text-slate-500" title={d.label}>
                {d.label}
              </p>
            </div>
          )
        })}
      </div>
      <div className="mt-1 h-px w-full min-w-[480px] bg-white/10" />
    </div>
  )
}
