'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  ShieldCheck,
  BarChart3,
  Clock3,
  Bell,
  X,
  ExternalLink,
  Users,
  Folder,
  FolderPlus,
  Star,
  ArrowUpDown,
  Trash2,
  Bookmark,
} from 'lucide-react'
import { DocumentCard } from '@/components/document-card'
import { SavedItemCard, type SavedItem } from '@/components/saved-item-card'
import { createDocument } from '@/app/actions/documents'
import { askAcrossDocuments } from '@/app/actions/search'
import { getSharedWithMeDocuments } from '@/app/actions/sharing'
import { createFolder, getFolders, deleteFolder } from '@/app/actions/folders'
import { addTagToDocument, removeTagFromDocument } from '@/app/actions/tags'
import {
  getSavedItems,
  toggleSavedItemFavorite,
  moveSavedItemToFolder,
  addTagToSavedItem,
  removeTagFromSavedItem,
  deleteSavedItem,
} from '@/app/actions/saved-items'
import type { GetDocumentsFilters } from '@/app/actions/documents'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

export default function FilesPage() {
  const { t } = useLocale()
  const [view, setView] = useState<'pdf' | 'saved'>('pdf')

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setView('pdf')}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
            view === 'pdf'
              ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t('filesPage.tabPdf')}
        </button>
        <button
          onClick={() => setView('saved')}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
            view === 'saved'
              ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          {t('filesPage.tabSaved')}
        </button>
      </div>

      {view === 'pdf' ? <PdfFilesView /> : <SavedItemsSection />}
    </div>
  )
}

function PdfFilesView() {
  const { locale, t } = useLocale()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [sharedDocuments, setSharedDocuments] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  // Organizzazione documenti: cartelle, preferiti, ricerca/ordinamento
  const [folders, setFolders] = useState<any[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string | null | undefined>(undefined) // undefined = tutte
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [nameFilter, setNameFilter] = useState('')
  const [sortBy, setSortBy] = useState<GetDocumentsFilters['sortBy']>('created_at')
  const [sortDir, setSortDir] = useState<GetDocumentsFilters['sortDir']>('desc')
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)

  useEffect(() => {
    loadFolders()
    loadSharedDocuments()
  }, [])

  // Ricarica i documenti ogni volta che cambia un filtro/ordinamento
  useEffect(() => {
    loadDocuments()
  }, [activeFolderId, favoritesOnly, nameFilter, sortBy, sortDir])

  const loadFolders = async () => {
    const result = await getFolders()
    if (result.success) setFolders(result.folders || [])
  }

  const loadSharedDocuments = async () => {
    const result = await getSharedWithMeDocuments()
    if (result.success) {
      setSharedDocuments(result.documents || [])
    }
  }

  const loadDocuments = async () => {
    try {
      const { getDocuments } = await import('@/app/actions/documents')
      const result = await getDocuments(undefined, {
        folderId: activeFolderId,
        favoritesOnly,
        search: nameFilter || undefined,
        sortBy,
        sortDir,
      })
      if (result.success && result.documents) {
        setDocuments(result.documents)
      } else {
        setDocuments([])
      }
    } catch (err) {
      setError(t('filesPage.errorLoadDocuments'))
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || creatingFolder) return
    setCreatingFolder(true)
    const result = await createFolder(newFolderName)
    if (result.success) {
      setNewFolderName('')
      await loadFolders()
    } else {
      setError(result.error || t('filesPage.errorCreateFolder'))
    }
    setCreatingFolder(false)
  }

  const handleDeleteFolder = async (folderId: string) => {
    const result = await deleteFolder(folderId)
    if (result.success) {
      if (activeFolderId === folderId) setActiveFolderId(undefined)
      await loadFolders()
      await loadDocuments()
    } else {
      setError(result.error || t('filesPage.errorDeleteFolder'))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError(t('filesPage.uploadErrorSelectPdf'))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError(t('filesPage.uploadErrorSelectFile'))
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      const result = await createDocument(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      clearInterval(interval)
      setUploadProgress(100)

      await loadDocuments()
      setFile(null)
      setUploading(false)
      setUploadProgress(0)

    } catch (err) {
      setError(err instanceof Error ? err.message : t('filesPage.uploadErrorFailed'))
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleToggleFavorite = async (documentId: string) => {
    const { toggleFavorite } = await import('@/app/actions/documents')
    const result = await toggleFavorite(documentId)
    if (result.success) {
      setDocuments(prev => prev.map(d => d.id === documentId ? { ...d, is_favorite: result.isFavorite } : d))
    }
  }

  const handleMoveToFolder = async (documentId: string, folderId: string | null) => {
    const { moveDocumentToFolder } = await import('@/app/actions/documents')
    const result = await moveDocumentToFolder(documentId, folderId)
    if (result.success) {
      await loadDocuments()
    }
  }

  const handleAddTag = async (documentId: string, tagName: string) => {
    const result = await addTagToDocument(documentId, tagName)
    if (result.success) {
      await loadDocuments()
    } else {
      setError(result.error || t('filesPage.errorAddTag'))
    }
  }

  const handleRemoveTag = async (documentId: string, tagId: string) => {
    const result = await removeTagFromDocument(documentId, tagId)
    if (result.success) {
      await loadDocuments()
    }
  }

  const totalDocuments = documents.length
  const totalPages = documents.reduce((sum, doc) => sum + (doc.total_pages || 0), 0)
  const lastUpload = documents.length > 0
    ? new Date(documents[0]?.created_at).toLocaleDateString(LOCALE_DATE_TAG[locale])
    : t('filesPage.statNone')

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              {t('filesPage.welcomeBadge')}
            </div>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t('filesPage.heroTitle')}
            </h1>
            <p className="text-lg text-slate-300">
              {t('filesPage.heroSubtitle')}
            </p>
            {totalDocuments > 0 && (
              <button
                onClick={() => setSearchOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition-colors duration-150 ease-out hover:bg-cyan-400/20 active:scale-[0.97]"
              >
                <Search className="h-4 w-4" />
                {t('filesPage.searchAllDocs')}
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: t('filesPage.statDocuments'), value: totalDocuments.toString(), icon: FileText },
              { label: t('filesPage.statPagesUsed'), value: totalPages > 0 ? `${totalPages}/10` : '0', icon: BarChart3 },
              { label: t('filesPage.statLastUpload'), value: lastUpload, icon: Clock3 },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="truncate text-xl font-semibold text-white" title={stat.value}>{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center gap-2 text-white">
              <Upload className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-semibold">{t('filesPage.uploadTitle')}</h2>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div
                className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center transition-colors duration-150 ease-out hover:border-cyan-400/40"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-2 text-white">{t('filesPage.uploadDragText')}</p>
                <p className="text-sm text-slate-500">{t('filesPage.uploadOrClick')}</p>
                <input id="file-input" type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                {file && <p className="mt-3 text-sm text-cyan-300">{file.name}</p>}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>{t('filesPage.uploading')}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full origin-left bg-gradient-to-r from-cyan-400 to-violet-500 transition-transform duration-300 ease-out"
                      style={{ transform: `scaleX(${uploadProgress / 100})` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 font-semibold text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin-fast" />
                    {t('filesPage.uploading')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t('filesPage.uploadButton')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center gap-2">
              <Folder className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold text-white">{t('filesPage.foldersTitle')}</h3>
            </div>

            <div className="space-y-1 mb-4">
              <button
                onClick={() => { setActiveFolderId(undefined); setFavoritesOnly(false) }}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors duration-150 ease-out active:scale-[0.98] ${
                  activeFolderId === undefined && !favoritesOnly ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                {t('filesPage.allDocuments')}
              </button>
              <button
                onClick={() => { setFavoritesOnly(true); setActiveFolderId(undefined) }}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors duration-150 ease-out active:scale-[0.98] ${
                  favoritesOnly ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Star className="h-4 w-4 flex-shrink-0" />
                {t('filesPage.favorites')}
              </button>
              <button
                onClick={() => { setActiveFolderId(null); setFavoritesOnly(false) }}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors duration-150 ease-out active:scale-[0.98] ${
                  activeFolderId === null ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Folder className="h-4 w-4 flex-shrink-0" />
                {t('filesPage.noFolder')}
              </button>

              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                    activeFolderId === folder.id ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <button
                    onClick={() => { setActiveFolderId(folder.id); setFavoritesOnly(false) }}
                    className="flex flex-1 items-center gap-2 text-left min-w-0 active:scale-[0.98]"
                  >
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="flex-shrink-0 text-slate-500 opacity-0 transition-[color,opacity] duration-150 ease-out hover:text-red-300 group-hover:opacity-100 active:scale-90"
                    title={t('filesPage.deleteFolderTitle')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateFolder} className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={t('filesPage.newFolderPlaceholder')}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={creatingFolder || !newFolderName.trim()}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t('filesPage.tipsTitle')}</h3>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">{t('filesPage.tip1')}</li>
              <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">{t('filesPage.tip2')}</li>
              <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">{t('filesPage.tip3')}</li>
            </ul>
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{t('filesPage.yourDocuments')}</h2>
              <p className="text-sm text-slate-400">
                {favoritesOnly ? t('filesPage.favorites') : activeFolderId === null ? t('filesPage.noFolder') : activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : t('filesPage.allDocuments')}
              </p>
            </div>
            <Link href="/dashboard/files" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 active:scale-[0.97]">
              {t('filesPage.newUpload')}
            </Link>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder={t('filesPage.searchByName')}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as GetDocumentsFilters['sortBy'])}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none"
              >
                <option value="created_at" className="bg-slate-900">{t('filesPage.sortDate')}</option>
                <option value="name" className="bg-slate-900">{t('filesPage.sortName')}</option>
                <option value="total_pages" className="bg-slate-900">{t('filesPage.sortPages')}</option>
              </select>
              <button
                onClick={() => setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97]"
                title={sortDir === 'asc' ? t('filesPage.sortAsc') : t('filesPage.sortDesc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                <DocumentCard
                  document={doc}
                  folders={folders}
                  onToggleFavorite={handleToggleFavorite}
                  onMoveToFolder={handleMoveToFolder}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-slate-600" />
              <p className="text-slate-400">{t('filesPage.noDocuments')}</p>
            </div>
          )}

          {sharedDocuments.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-300" />
                <h3 className="text-lg font-semibold text-white">{t('filesPage.sharedWithMe')}</h3>
              </div>
              <div className="space-y-4">
                {sharedDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} sharedByEmail={doc.ownerEmail} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const { t } = useLocale()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<any[]>([])
  // Ingresso/uscita animati: senza show=true al mount la transizione non ha
  // uno stato "da" da cui partire e scatta istantanea.
  const [show, setShow] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 150)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])

    try {
      const result = await askAcrossDocuments(query)
      if (result.error) {
        setError(result.error)
      } else {
        setAnswer(result.answer || null)
        setSources(result.sources || [])
      }
    } catch (err) {
      setError(t('filesPage.searchFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm transition-opacity duration-200 ease-out ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl origin-center rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl transition-[opacity,transform] duration-200 ease-out-strong ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Search className="h-5 w-5 text-cyan-300" />
            {t('filesPage.searchModalTitle')}
          </h3>
          <button onClick={handleClose} className="text-slate-400 transition-colors duration-150 ease-out hover:text-white active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('filesPage.searchPlaceholderQuestion')}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 font-semibold text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin-fast" /> : t('filesPage.searchButton')}
          </button>
        </form>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {answer && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-200">{answer}</p>
            </div>

            {sources.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('filesPage.sources')}</p>
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <Link
                      key={i}
                      href={`/document/${source.documentId}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.98]"
                    >
                      <span className="truncate">
                        [{t('filesPage.source')} {i + 1}] {source.documentName}
                        {source.pageNumber ? ` — ${t('filesPage.page')} ${source.pageNumber}` : ''}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SavedItemsSection() {
  const { t } = useLocale()
  const [items, setItems] = useState<SavedItem[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFolders().then((r) => r.success && setFolders(r.folders || []))
    loadItems()
  }, [])

  const loadItems = async () => {
    setLoading(true)
    const result = await getSavedItems()
    setItems(result.success ? (result.items as SavedItem[]) || [] : [])
    setLoading(false)
  }

  const handleToggleFavorite = async (itemId: string) => {
    const result = await toggleSavedItemFavorite(itemId)
    if (result.success) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, is_favorite: result.isFavorite! } : i)))
    }
  }

  const handleMoveToFolder = async (itemId: string, folderId: string | null) => {
    const result = await moveSavedItemToFolder(itemId, folderId)
    if (result.success) await loadItems()
  }

  const handleAddTag = async (itemId: string, tagName: string) => {
    const result = await addTagToSavedItem(itemId, tagName)
    if (result.success) await loadItems()
  }

  const handleRemoveTag = async (itemId: string, tagId: string) => {
    const result = await removeTagFromSavedItem(itemId, tagId)
    if (result.success) await loadItems()
  }

  const handleDelete = async (itemId: string) => {
    const result = await deleteSavedItem(itemId)
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <h2 className="mb-6 text-xl font-semibold text-white">{t('filesPage.savedItemsTitle')}</h2>

      {loading && <p className="text-sm text-slate-500">{t('common.loading')}</p>}

      {!loading && items.length === 0 && (
        <div className="py-12 text-center">
          <Bookmark className="mx-auto mb-4 h-16 w-16 text-slate-600" />
          <p className="text-slate-400">{t('filesPage.noSavedItems')}</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
            <SavedItemCard
              item={item}
              folders={folders}
              onToggleFavorite={handleToggleFavorite}
              onMoveToFolder={handleMoveToFolder}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
