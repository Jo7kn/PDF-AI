'use client'

import { useState } from 'react'
import {
  Code2,
  Bug,
  Wand2,
  BookOpen,
  RefreshCw,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { runCodeAi } from '@/app/actions/code-ai'
import type { CodeAction } from '@/lib/nvidia/code'

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C',
  'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'HTML/CSS',
]

const MODES: Array<{ key: CodeAction; label: string; icon: typeof Code2; placeholder: string }> = [
  { key: 'generate', label: 'Genera', icon: Code2, placeholder: 'Descrivi cosa vuoi generare, es. "una funzione che valida un\'email"' },
  { key: 'debug', label: 'Debug', icon: Bug, placeholder: 'Incolla il codice con il bug...' },
  { key: 'refactor', label: 'Refactor', icon: Wand2, placeholder: 'Incolla il codice da migliorare...' },
  { key: 'explain', label: 'Spiega', icon: BookOpen, placeholder: 'Incolla il codice da spiegare...' },
  { key: 'convert', label: 'Converti', icon: RefreshCw, placeholder: 'Incolla il codice da convertire...' },
]

export default function CodeAiPage() {
  const [mode, setMode] = useState<CodeAction>('generate')
  const [language, setLanguage] = useState('JavaScript')
  const [targetLanguage, setTargetLanguage] = useState('Python')
  const [input, setInput] = useState('')
  const [extraNote, setExtraNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const activeMode = MODES.find((m) => m.key === mode)!

  const handleRun = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)

    const result = await runCodeAi({
      action: mode,
      code: mode !== 'generate' ? input : undefined,
      prompt: mode === 'generate' ? input : (extraNote || undefined),
      language,
      targetLanguage: mode === 'convert' ? targetLanguage : undefined,
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
        icon={Code2}
        title="Code AI"
        subtitle="Generazione, debug e refactoring"
        gradient="from-emerald-400 to-teal-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setOutput(null); setError(null) }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                mode === m.key
                  ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
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
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {mode === 'convert' ? (
                <>
                  <LanguageSelect label="Da" value={language} onChange={setLanguage} />
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  <LanguageSelect label="A" value={targetLanguage} onChange={setTargetLanguage} />
                </>
              ) : (
                <LanguageSelect label="Linguaggio" value={language} onChange={setLanguage} />
              )}
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeMode.placeholder}
              rows={14}
              spellCheck={false}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
            />

            {mode === 'debug' || mode === 'refactor' ? (
              <input
                type="text"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                placeholder={mode === 'debug' ? 'Facoltativo: descrivi l\'errore che ottieni...' : 'Facoltativo: istruzioni specifiche (es. "usa async/await")'}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none"
              />
            ) : null}

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={loading || !input.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin-fast" />
                  Elaborazione...
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
              <h2 className="text-lg font-semibold text-white">Risultato</h2>
              {output && (
                <div className="flex items-center gap-2">
                  <SaveButton
                    tool="code-ai"
                    title={`Code AI · ${activeMode.label} (${language})`}
                    content={output}
                    metadata={{ action: mode, language, targetLanguage: mode === 'convert' ? targetLanguage : undefined }}
                  />
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copiato' : 'Copia'}
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin-fast" />
                <p className="text-sm">Il modello sta lavorando...</p>
              </div>
            )}

            {!loading && !output && !error && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-600">
                <Code2 className="h-10 w-10" />
                <p className="text-sm">Il risultato apparirà qui</p>
              </div>
            )}

            {!loading && output && (
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm text-slate-100">
                {output}
              </pre>
            )}
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

function LanguageSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
        ))}
      </select>
    </label>
  )
}
