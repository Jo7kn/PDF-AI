'use client'

import { useState } from 'react'
import {
  Sparkles,
  RefreshCw,
  FileCode,
  FileJson,
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { AiLoadingState } from '@/components/ai-loading-state'
import { CopyIconSwap } from '@/components/animations/copy-icon-swap'
import { FaqSection } from '@/components/faq-section'
import { SaveButton } from '@/components/save-button'
import { runTextConversion, convertPdfToText, convertImageFormat, type ImageOutputFormat } from '@/app/actions/file-converter'
import { parseCsv, csvRowsToObjects, objectsToCsv } from '@/lib/csv'
import type { TextFormat } from '@/lib/nvidia/converter'
import { useLocale } from '@/lib/i18n/locale-context'

type ConverterMode = 'text' | 'csv-json' | 'pdf-text' | 'image'

const TEXT_FORMATS: TextFormat[] = ['markdown', 'html', 'testo semplice']
const IMAGE_FORMATS: ImageOutputFormat[] = ['png', 'jpeg', 'webp']

export default function FileConverterPage() {
  const { t } = useLocale()
  const [mode, setMode] = useState<ConverterMode>('text')

  const MODES: Array<{ key: ConverterMode; label: string; icon: typeof FileCode }> = [
    { key: 'text', label: t('fileConverterPage.modeText'), icon: FileCode },
    { key: 'csv-json', label: t('fileConverterPage.modeCsvJson'), icon: FileJson },
    { key: 'pdf-text', label: t('fileConverterPage.modePdfText'), icon: FileText },
    { key: 'image', label: t('fileConverterPage.modeImage'), icon: ImageIcon },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={RefreshCw}
        title="File Converter"
        subtitle={t('fileConverterPage.subtitle')}
        gradient="from-lime-400 to-emerald-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-xl font-semibold text-white sm:text-2xl">File Converter: converti file con l’intelligenza artificiale</h1>
        <div className="mb-6 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                mode === m.key
                  ? 'border-lime-400/40 bg-lime-400/15 text-lime-200'
                  : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
              }`}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        <p className="mb-6 text-sm text-neutral-500">
          {t('fileConverterPage.unsupportedFormats')}
        </p>

        {mode === 'text' && <TextConverter />}
        {mode === 'csv-json' && <CsvJsonConverter />}
        {mode === 'pdf-text' && <PdfToTextConverter />}
        {mode === 'image' && <ImageConverter />}
        <FaqSection slug="file-converter" />
      </main>

      <AppFooter />
    </div>
  )
}

function TextConverter() {
  const { t } = useLocale()
  const [from, setFrom] = useState<TextFormat>('markdown')
  const [to, setTo] = useState<TextFormat>('html')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)
    const result = await runTextConversion(input, from, to)
    if ('error' in result) setError(result.error)
    else setOutput(result.result || null)
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <FormatSelect value={from} onChange={setFrom} />
          <ArrowRight className="h-4 w-4 text-neutral-500" />
          <FormatSelect value={to} onChange={setTo} />
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('fileConverterPage.textInputPlaceholder')}
          rows={14}
          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400/50 focus:outline-none"
        />
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={handleConvert}
          disabled={loading || !input.trim() || from === to}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <RefreshCw className="h-4 w-4" />}
          {t('fileConverterPage.convertButton')}
        </button>
      </section>

      <section className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('common.result')}</h2>
          {output && (
            <div className="flex items-center gap-2">
              <SaveButton tool="file-converter" title={`Conversione ${from} → ${to}`} content={output} metadata={{ from, to }} />
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]">
                <CopyIconSwap copied={copied} />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}
        </div>
        {loading && <AiLoadingState />}
        {!loading && !output && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-600">
            <Sparkles className="h-10 w-10" />
            <p className="text-sm">{t('common.resultPlaceholder')}</p>
          </div>
        )}
        {!loading && output && (
          <pre className="animate-fade-in-up max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-sm text-neutral-100">{output}</pre>
        )}
      </section>
    </div>
  )
}

function FormatSelect({ value, onChange }: { value: TextFormat; onChange: (v: TextFormat) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TextFormat)}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm capitalize text-white focus:border-lime-400/50 focus:outline-none"
    >
      {TEXT_FORMATS.map((f) => (
        <option key={f} value={f} className="bg-[#0a0a0c] capitalize">{f}</option>
      ))}
    </select>
  )
}

function CsvJsonConverter() {
  const { t } = useLocale()
  const [direction, setDirection] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    setError(null)
    setOutput(null)
    try {
      if (direction === 'csv-to-json') {
        const parsed = parseCsv(input)
        const objects = csvRowsToObjects(parsed)
        setOutput(JSON.stringify(objects, null, 2))
      } else {
        const objects = JSON.parse(input)
        if (!Array.isArray(objects)) throw new Error(t('fileConverterPage.jsonArrayError'))
        setOutput(objectsToCsv(objects))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('fileConverterPage.conversionFailed'))
    }
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setDirection('csv-to-json'); setInput(''); setOutput(null); setError(null) }}
            className={`rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out active:scale-[0.97] ${direction === 'csv-to-json' ? 'border-lime-400/40 bg-lime-400/15 text-lime-200' : 'border-white/[0.08] bg-white/[0.03] text-neutral-300'}`}
          >
            CSV → JSON
          </button>
          <button
            onClick={() => { setDirection('json-to-csv'); setInput(''); setOutput(null); setError(null) }}
            className={`rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out active:scale-[0.97] ${direction === 'json-to-csv' ? 'border-lime-400/40 bg-lime-400/15 text-lime-200' : 'border-white/[0.08] bg-white/[0.03] text-neutral-300'}`}
          >
            JSON → CSV
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={direction === 'csv-to-json' ? t('fileConverterPage.csvToJsonPlaceholder') : t('fileConverterPage.jsonToCsvPlaceholder')}
          rows={14}
          className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400/50 focus:outline-none"
        />
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={handleConvert}
          disabled={!input.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <RefreshCw className="h-4 w-4" />
          {t('fileConverterPage.instantConvertButton')}
        </button>
      </section>

      <section className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('common.result')}</h2>
          {output && (
            <div className="flex items-center gap-2">
              <SaveButton tool="file-converter" title={direction === 'csv-to-json' ? 'CSV → JSON' : 'JSON → CSV'} content={output} metadata={{ direction }} />
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]">
                <CopyIconSwap copied={copied} />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}
        </div>
        {!output && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-600">
            <FileJson className="h-10 w-10" />
            <p className="text-sm">{t('common.resultPlaceholder')}</p>
          </div>
        )}
        {output && (
          <pre className="animate-fade-in-up max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.08] bg-black/20 p-4 font-mono text-sm text-neutral-100">{output}</pre>
        )}
      </section>
    </div>
  )
}

function PdfToTextConverter() {
  const { t } = useLocale()
  const [file, setFile] = useState<File | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type === 'application/pdf') {
      setFile(selected)
      setError(null)
      setOutput(null)
    } else {
      setError(t('fileConverterPage.selectPdfError'))
    }
  }

  const handleConvert = async () => {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    setOutput(null)
    const formData = new FormData()
    formData.append('file', file)
    const result = await convertPdfToText(formData)
    if (result.error) setError(result.error)
    else setOutput(result.text || null)
    setLoading(false)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div
          className="cursor-pointer rounded-2xl border-2 border-dashed border-white/[0.12] bg-white/[0.03] p-8 text-center transition-colors duration-150 ease-out hover:border-lime-400/40"
          onClick={() => document.getElementById('pdf-input')?.click()}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <p className="mb-2 text-white">{t('fileConverterPage.uploadPdfTitle')}</p>
          <p className="text-sm text-neutral-500">{t('fileConverterPage.uploadPdfSubtitle')}</p>
          <input id="pdf-input" type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
          {file && <p className="mt-3 text-sm text-lime-300">{file.name}</p>}
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          onClick={handleConvert}
          disabled={loading || !file}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <FileText className="h-4 w-4" />}
          {t('fileConverterPage.extractButton')}
        </button>
      </section>

      <section className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('fileConverterPage.extractedTextTitle')}</h2>
          {output && (
            <div className="flex items-center gap-2">
              <SaveButton tool="file-converter" title={`PDF → Testo · ${file?.name || ''}`} content={output} metadata={{ from: 'pdf', to: 'text' }} />
              <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.95]">
                <CopyIconSwap copied={copied} />
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>
          )}
        </div>
        {!output && !loading && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-neutral-600">
            <FileText className="h-10 w-10" />
            <p className="text-sm">{t('fileConverterPage.extractedTextPlaceholder')}</p>
          </div>
        )}
        {loading && <AiLoadingState />}
        {output && (
          <pre className="animate-fade-in-up max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-neutral-100">{output}</pre>
        )}
      </section>
    </div>
  )
}

function ImageConverter() {
  const { t } = useLocale()
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageOutputFormat>('png')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected)
      setError(null)
      setResultUrl(null)
    } else {
      setError(t('fileConverterPage.selectImageError'))
    }
  }

  const handleConvert = async () => {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    setResultUrl(null)
    const formData = new FormData()
    formData.append('file', file)
    const result = await convertImageFormat(formData, format)
    if (result.error) setError(result.error)
    else setResultUrl(result.dataUrl || null)
    setLoading(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div
          className="cursor-pointer rounded-2xl border-2 border-dashed border-white/[0.12] bg-white/[0.03] p-8 text-center transition-colors duration-150 ease-out hover:border-lime-400/40"
          onClick={() => document.getElementById('image-input')?.click()}
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <p className="mb-2 text-white">{t('fileConverterPage.uploadImageTitle')}</p>
          <p className="text-sm text-neutral-500">{t('fileConverterPage.uploadImageSubtitle')}</p>
          <input id="image-input" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          {file && <p className="mt-3 text-sm text-lime-300">{file.name}</p>}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
          {t('fileConverterPage.convertToLabel')}
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ImageOutputFormat)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm uppercase text-white focus:border-lime-400/50 focus:outline-none"
          >
            {IMAGE_FORMATS.map((f) => (
              <option key={f} value={f} className="bg-[#0a0a0c] uppercase">{f}</option>
            ))}
          </select>
        </label>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={loading || !file}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <RefreshCw className="h-4 w-4" />}
          {t('fileConverterPage.convertButton')}
        </button>
      </section>

      <section className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-xl shadow-lime-500/10 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('common.result')}</h2>
          {resultUrl && (
            <div className="flex items-center gap-2">
              <SaveButton tool="file-converter" title={`Immagine convertita in ${format.toUpperCase()}`} content={resultUrl} contentType="image" metadata={{ format }} />
              <a
                href={resultUrl}
                download={`converted.${format}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-xs text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                {t('common.download')}
              </a>
            </div>
          )}
        </div>
        <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
          {loading && <AiLoadingState className="p-8" />}
          {!loading && !resultUrl && (
            <div className="flex flex-col items-center gap-3 p-8 text-neutral-600">
              <ImageIcon className="h-10 w-10" />
              <p className="text-sm">{t('fileConverterPage.convertedImagePlaceholder')}</p>
            </div>
          )}
          {!loading && resultUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt="Convertita" className="animate-fade-in-up max-h-[32rem] w-full object-contain" />
          )}
        </div>
      </section>
    </div>
  )
}
