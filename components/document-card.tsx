'use client'

// components/document-card.tsx
//
// Estratta da app/dashboard/page.tsx: riusata da Files e Favorites (Fase 2
// della dashboard), stesso identico markup/comportamento di prima.

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
  Users,
  Star,
  Tag as TagIcon,
} from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

export function DocumentCard({
  document,
  sharedByEmail,
  folders = [],
  onToggleFavorite,
  onMoveToFolder,
  onAddTag,
  onRemoveTag,
}: {
  document: any
  sharedByEmail?: string
  folders?: any[]
  onToggleFavorite?: (documentId: string) => void
  onMoveToFolder?: (documentId: string, folderId: string | null) => void
  onAddTag?: (documentId: string, tagName: string) => void
  onRemoveTag?: (documentId: string, tagId: string) => void
}) {
  const { locale } = useLocale()
  const [tagInput, setTagInput] = useState('')
  // I documenti condivisi non hanno organizzazione propria (cartella/tag/
  // preferito appartengono a chi possiede il documento, non a chi lo riceve)
  const canOrganize = !sharedByEmail && onToggleFavorite

  const isProcessing = document.processing_status === 'pending' || document.processing_status === 'processing'
  const hasFailed = document.processing_status === 'failed'

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagInput.trim() || !onAddTag) return
    onAddTag(document.id, tagInput)
    setTagInput('')
  }

  return (
    <div className="group rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-[transform,background-color,border-color] duration-200 ease-spring hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.06]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-200 ease-spring group-hover:scale-105">
            <FileText className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {canOrganize && (
                <button
                  onClick={() => onToggleFavorite!(document.id)}
                  title={document.is_favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                  className="flex-shrink-0 active:scale-90"
                >
                  <Star className={`h-4 w-4 transition-colors duration-150 ease-out ${document.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-500 hover:text-amber-400'}`} />
                </button>
              )}
              <h3 className="truncate font-semibold text-white">{document.name}</h3>
              {sharedByEmail && (
                <div className="flex items-center gap-1 rounded-full bg-brand/15 px-2 py-1 text-xs text-brand">
                  <Users className="h-3 w-3" />
                  <span className="truncate max-w-[140px]">{sharedByEmail}</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
                  <Loader2 className="h-3 w-3 animate-spin-fast" />
                  <span>Elaborazione in corso...</span>
                </div>
              )}
              {hasFailed && (
                <div className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-300">
                  <AlertCircle className="h-3 w-3" />
                  <span>Errore</span>
                </div>
              )}
              {document.processing_status === 'completed' && (
                <div className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-1 text-xs text-green-300">
                  <span>Pronto</span>
                </div>
              )}
            </div>
            <p className="mb-2 line-clamp-2 text-sm text-neutral-400">
              {document.summary || (hasFailed ? (document.error_message || 'Elaborazione fallita') : 'In attesa di elaborazione...')}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mb-2">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {document.total_pages || 0} pagine
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(document.created_at).toLocaleDateString(LOCALE_DATE_TAG[locale])}
              </span>
            </div>

            {canOrganize && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(document.tags || []).map((tag: any) => (
                    <button
                      key={tag.id}
                      onClick={() => onRemoveTag?.(document.id, tag.id)}
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
                  value={document.folder_id || ''}
                  onChange={(e) => onMoveToFolder?.(document.id, e.target.value || null)}
                  className="rounded-lg border border-white/[0.08] bg-black/20 px-2 py-1 text-xs text-neutral-300 transition-colors duration-150 ease-out focus:border-brand/50 focus:outline-none"
                >
                  <option value="" className="bg-[#0a0a0c]">Nessuna cartella</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id} className="bg-[#0a0a0c]">{folder.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <Link
          href={`/document/${document.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-white/[0.1] active:scale-[0.97]"
        >
          <MessageSquare className="h-4 w-4" />
          Apri chat
        </Link>
      </div>
    </div>
  )
}
