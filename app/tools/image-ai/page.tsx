'use client'

import { useState } from 'react'
import {
  Image as ImageIcon,
  Wand2,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { TierGate } from '@/components/tier-gate'
import { runImageAi } from '@/app/actions/image-ai'
import type { ImageAspect } from '@/lib/nvidia/image'
import { useLocale } from '@/lib/i18n/locale-context'

export default function ImageAiPage() {
  const { t } = useLocale()
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [aspect, setAspect] = useState<ImageAspect>('square')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const ASPECTS: Array<{ key: ImageAspect; label: string; ratio: string }> = [
    { key: 'square', label: t('imageAiPage.aspectSquare'), ratio: '1:1' },
    { key: 'landscape', label: t('imageAiPage.aspectLandscape'), ratio: '16:9' },
    { key: 'portrait', label: t('imageAiPage.aspectPortrait'), ratio: '9:16' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setImageUrl(null)

    const result = await runImageAi({
      prompt,
      negativePrompt: negativePrompt || undefined,
      aspect,
    })

    if ('error' in result) {
      setError(result.error)
    } else {
      setImageUrl(result.dataUrl || null)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={ImageIcon}
        title="Image AI"
        subtitle={t('imageAiPage.subtitle')}
        gradient="from-orange-400 to-rose-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <TierGate gradient="from-orange-400 to-rose-500">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <label className="mb-2 block text-sm font-medium text-slate-300">{t('imageAiPage.describeLabel')}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('imageAiPage.promptPlaceholder')}
              rows={6}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-orange-400/50 focus:outline-none"
            />

            <label className="mb-2 mt-4 block text-sm font-medium text-slate-300">{t('imageAiPage.avoidLabel')}</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder={t('imageAiPage.negativePromptPlaceholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none"
            />

            <p className="mb-2 mt-4 text-sm font-medium text-slate-300">{t('imageAiPage.formatLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAspect(a.key)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out ${
                    aspect === a.key
                      ? 'border-orange-400/40 bg-orange-400/15 text-orange-200'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {a.label} <span className="text-xs text-slate-500">({a.ratio})</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin-fast" />
                  {t('imageAiPage.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {t('imageAiPage.generateButton')}
                </>
              )}
            </button>
          </section>

          <section className="flex flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t('common.result')}</h2>
              {imageUrl && (
                <div className="flex items-center gap-2">
                  <SaveButton
                    tool="image-ai"
                    title={prompt.slice(0, 80)}
                    content={imageUrl}
                    contentType="image"
                    metadata={{ aspect }}
                  />
                  <a
                    href={imageUrl}
                    download="image-ai.jpg"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t('common.download')}
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              {loading && (
                <div className="flex flex-col items-center gap-3 p-8 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin-fast" />
                  <p className="text-sm">{t('imageAiPage.drawing')}</p>
                </div>
              )}

              {!loading && !imageUrl && (
                <div className="flex flex-col items-center gap-3 p-8 text-slate-600">
                  <ImageIcon className="h-10 w-10" />
                  <p className="text-sm">{t('imageAiPage.imagePlaceholder')}</p>
                </div>
              )}

              {!loading && imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={prompt} className="max-h-[32rem] w-full object-contain" />
              )}
            </div>
          </section>
        </div>
        </TierGate>
      </main>

      <AppFooter />
    </div>
  )
}
