'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkle, Search, X, LayoutGrid } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { ToolCard } from '@/components/tool-card'
import { AI_TOOLS, AI_TOOL_CATEGORIES } from '@/lib/tools'
import { getCurrentUserProfile } from '@/app/actions/auth'
import { getPublicFeatureFlags } from '@/app/actions/feature-flags'
import { useLocale, translate, translateList } from '@/lib/i18n/locale-context'

export default function ToolsPage() {
  const { t, locale } = useLocale()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<string | undefined>(undefined)
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getCurrentUserProfile().then((p) => setUserTier(p?.tier || 'free'))
    getPublicFeatureFlags().then((list) => {
      setFlags(Object.fromEntries(list.map((f) => [f.slug, f.enabled])))
    })
  }, [])

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

  const availableCount = AI_TOOLS.filter((tool) => tool.status === 'available' && flags[tool.slug]).length

  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={Sparkle}
        title="AI Toolbox"
        subtitle={t('home.readyTitle')}
        gradient=""
        active="tools"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <section className="animate-fade-in-up mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-sm text-neutral-300">
                <LayoutGrid className="h-4 w-4 text-brand" />
                {t('tools.badgeCount', { available: availableCount, total: AI_TOOLS.length })}
              </div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t('tools.title')}
              </h1>
              <p className="text-lg text-neutral-400">{t('tools.subtitle')}</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tools.searchPlaceholder')}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-9 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors duration-150 ease-out hover:text-white"
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
                ? 'border-brand/40 bg-brand/15 text-brand'
                : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
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
                  ? 'border-brand/40 bg-brand/15 text-brand'
                  : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
              }`}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool, i) => (
              <div key={tool.slug} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <ToolCard tool={tool} userTier={userTier} flagEnabled={flags[tool.slug]} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] py-16 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-neutral-600" />
            <p className="text-neutral-400">{t('tools.noResults')}</p>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
