'use client'

import { useMemo, useState } from 'react'
import { Sparkles, Search, X, LayoutGrid } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { ToolCard } from '@/components/tool-card'
import { AI_TOOLS, AI_TOOL_CATEGORIES } from '@/lib/tools'
import { useLocale, translate, translateList } from '@/lib/i18n/locale-context'

export default function ToolsPage() {
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    return AI_TOOLS.filter((tool) => {
      const matchesCategory = !activeCategory || tool.category === activeCategory
      const description = translate(locale, `toolsData.${tool.slug}.description`).toLowerCase()
      const features = translateList(locale, `toolsData.${tool.slug}.features`)
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        description.includes(q) ||
        features.some((f) => f.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [query, activeCategory, locale])

  const availableCount = AI_TOOLS.filter((tool) => tool.status === 'available').length

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={Sparkles}
        title="AI Toolbox"
        subtitle={t('home.readyTitle')}
        gradient="from-cyan-400 to-violet-500"
        active="tools"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                <LayoutGrid className="h-4 w-4" />
                {t('tools.badgeCount', { available: availableCount, total: AI_TOOLS.length })}
              </div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t('tools.title')}
              </h1>
              <p className="text-lg text-slate-300">{t('tools.subtitle')}</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tools.searchPlaceholder')}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-150 ease-out hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ease-out ${
              activeCategory === null
                ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {t('tools.allCategories')}
          </button>
          {AI_TOOL_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory((prev) => (prev === category ? null : category))}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-150 ease-out ${
                activeCategory === category
                  ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 py-16 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <p className="text-slate-400">{t('tools.noResults')}</p>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
