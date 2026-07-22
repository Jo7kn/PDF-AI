'use client'

import { useEffect, useState } from 'react'
import { Star, Bookmark } from 'lucide-react'
import { useLocale } from '@/lib/i18n/locale-context'
import { DocumentCard } from '@/components/document-card'
import { SavedItemCard, type SavedItem } from '@/components/saved-item-card'
import { SkeletonRow } from '@/components/skeleton'
import { getDocuments, toggleFavorite, moveDocumentToFolder } from '@/app/actions/documents'
import { getFolders } from '@/app/actions/folders'
import { addTagToDocument, removeTagFromDocument } from '@/app/actions/tags'
import {
  getSavedItems,
  toggleSavedItemFavorite,
  moveSavedItemToFolder,
  addTagToSavedItem,
  removeTagFromSavedItem,
  deleteSavedItem,
} from '@/app/actions/saved-items'

export default function FavoritesPage() {
  const { t } = useLocale()
  const [documents, setDocuments] = useState<any[]>([])
  const [items, setItems] = useState<SavedItem[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFolders().then((r) => r.success && setFolders(r.folders || []))
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [docsResult, itemsResult] = await Promise.all([
      getDocuments({ favoritesOnly: true }),
      getSavedItems({ favoritesOnly: true }),
    ])
    setDocuments(docsResult.success ? docsResult.documents || [] : [])
    setItems(itemsResult.success ? (itemsResult.items as SavedItem[]) || [] : [])
    setLoading(false)
  }

  const handleToggleDocFavorite = async (documentId: string) => {
    const result = await toggleFavorite(documentId)
    if (result.success) setDocuments((prev) => prev.filter((d) => d.id !== documentId))
  }
  const handleMoveDocToFolder = async (documentId: string, folderId: string | null) => {
    if ((await moveDocumentToFolder(documentId, folderId)).success) await loadAll()
  }
  const handleAddDocTag = async (documentId: string, tagName: string) => {
    if ((await addTagToDocument(documentId, tagName)).success) await loadAll()
  }
  const handleRemoveDocTag = async (documentId: string, tagId: string) => {
    if ((await removeTagFromDocument(documentId, tagId)).success) await loadAll()
  }

  const handleToggleItemFavorite = async (itemId: string) => {
    const result = await toggleSavedItemFavorite(itemId)
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== itemId))
  }
  const handleMoveItemToFolder = async (itemId: string, folderId: string | null) => {
    if ((await moveSavedItemToFolder(itemId, folderId)).success) await loadAll()
  }
  const handleAddItemTag = async (itemId: string, tagName: string) => {
    if ((await addTagToSavedItem(itemId, tagName)).success) await loadAll()
  }
  const handleRemoveItemTag = async (itemId: string, tagId: string) => {
    if ((await removeTagFromSavedItem(itemId, tagId)).success) await loadAll()
  }
  const handleDeleteItem = async (itemId: string) => {
    if ((await deleteSavedItem(itemId)).success) setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const isEmpty = !loading && documents.length === 0 && items.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        <h1 className="text-xl font-semibold text-white">{t('favoritesPage.title')}</h1>
      </div>

      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 py-12 text-center shadow-xl shadow-black/20">
          <Star className="mx-auto mb-4 h-16 w-16 text-slate-600" />
          <p className="text-slate-400">{t('favoritesPage.empty')}</p>
        </div>
      )}

      {documents.length > 0 && (
        <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{t('filesPage.tabPdf')}</h2>
          <div className="space-y-4">
            {documents.map((doc, i) => (
              <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <DocumentCard
                  document={doc}
                  folders={folders}
                  onToggleFavorite={handleToggleDocFavorite}
                  onMoveToFolder={handleMoveDocToFolder}
                  onAddTag={handleAddDocTag}
                  onRemoveTag={handleRemoveDocTag}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Bookmark className="h-4 w-4" />
            {t('filesPage.tabSaved')}
          </h2>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <SavedItemCard
                  item={item}
                  folders={folders}
                  onToggleFavorite={handleToggleItemFavorite}
                  onMoveToFolder={handleMoveItemToFolder}
                  onAddTag={handleAddItemTag}
                  onRemoveTag={handleRemoveItemTag}
                  onDelete={handleDeleteItem}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
