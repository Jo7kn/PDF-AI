'use client'

// components/saved-item-card.tsx
//
// Mirror di components/document-card.tsx, ma per i risultati salvati dagli
// altri tool (saved_items) invece dei documenti PDF.

import { useState } from 'react'
import { Calendar, Star, Tag as TagIcon, Trash2 } from 'lucide-react'
import { getToolBySlug } from '@/lib/tools'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

export interface SavedItem {
  id: string
  tool: string
  title: string
  content: string
  content_type: 'text' | 'image'
  folder_id: string | null
  is_favorite: boolean
  created_at: string
  tags?: { id: string; name: string }[]
}

export function SavedItemCard({
  item,
  folders = [],
  onToggleFavorite,
  onMoveToFolder,
  onAddTag,
  onRemoveTag,
  onDelete,
}: {
  item: SavedItem
  folders?: any[]
  onToggleFavorite: (itemId: string) => void
  onMoveToFolder: (itemId: string, folderId: string | null) => void
  onAddTag: (itemId: string, tagName: string) => void
  onRemoveTag: (itemId: string, tagId: string) => void
  onDelete: (itemId: string) => void
}) {
  const { locale } = useLocale()
  const [tagInput, setTagInput] = useState('')
  const tool = getToolBySlug(item.tool)
  const Icon = tool?.icon

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagInput.trim()) return
    onAddTag(item.id, tagInput)
    setTagInput('')
  }

  return (
    <div className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-[transform,background-color,border-color] duration-200 ease-spring hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.06]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {item.content_type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.content} alt={item.title} className="h-12 w-12 flex-shrink-0 rounded-lg object-cover transition-transform duration-200 ease-spring group-hover:scale-105" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-200 ease-spring group-hover:scale-105">
              {Icon && <Icon className="h-6 w-6" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(item.id)}
                title={item.is_favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                className="flex-shrink-0 active:scale-90"
              >
                <Star className={`h-4 w-4 transition-colors duration-150 ease-out ${item.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-500 hover:text-amber-400'}`} />
              </button>
              <h3 className="truncate font-semibold text-white">{item.title}</h3>
              <span className="flex-shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-neutral-400">
                {tool?.name || item.tool}
              </span>
            </div>

            {item.content_type === 'text' && (
              <p className="mb-2 line-clamp-2 text-sm text-neutral-400">{item.content}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.created_at).toLocaleDateString(LOCALE_DATE_TAG[locale])}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(item.tags || []).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onRemoveTag(item.id, tag.id)}
                    title="Rimuovi tag"
                    className="flex items-center gap-1 rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 text-xs text-brand transition-colors duration-150 ease-out hover:bg-red-500/10 hover:text-red-300 active:scale-95"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </button>
                ))}
                <form onSubmit={handleTagSubmit} className="inline-flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="+ tag"
                    className="w-16 rounded-full border border-white/[0.08] bg-transparent px-2 py-0.5 text-xs text-neutral-300 placeholder-neutral-600 transition-[width,border-color] duration-150 ease-out focus:w-24 focus:border-brand/50 focus:outline-none"
                  />
                </form>
              </div>

              <select
                value={item.folder_id || ''}
                onChange={(e) => onMoveToFolder(item.id, e.target.value || null)}
                className="rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1 text-xs text-neutral-300 transition-colors duration-150 ease-out focus:border-brand/50 focus:outline-none"
              >
                <option value="" className="bg-[#0a0a0c]">Nessuna cartella</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id} className="bg-[#0a0a0c]">{folder.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          title="Elimina"
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-neutral-400 transition-colors duration-150 ease-out hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 active:scale-90"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
