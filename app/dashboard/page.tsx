'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Calendar,
  MessageSquare,
  Plus,
  Sparkles,
  Loader2,
  AlertCircle,
  LogOut,
  Search,
  ShieldCheck,
  BarChart3,
  Clock3,
  Bell,
  X,
  ExternalLink,
  Users,
} from 'lucide-react'
import { createDocument } from '@/app/actions/documents'
import { signOut, getCurrentUserProfile } from '@/app/actions/auth'
import { askAcrossDocuments } from '@/app/actions/search'
import { getSharedWithMeDocuments } from '@/app/actions/sharing'
import { buildCheckoutUrl } from '@/lib/lemonsqueezy'
import { getTierByName } from '@/lib/pricing'

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [sharedDocuments, setSharedDocuments] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profile, setProfile] = useState<{ id: string; email: string; tier: string } | null>(null)

  useEffect(() => {
    loadDocuments()
    loadSharedDocuments()
    getCurrentUserProfile().then(setProfile)
  }, [])

  const loadSharedDocuments = async () => {
    const result = await getSharedWithMeDocuments()
    if (result.success) {
      setSharedDocuments(result.documents || [])
    }
  }

  const loadDocuments = async () => {
    try {
      const { getDocuments } = await import('@/app/actions/documents')
      const result = await getDocuments()
      if (result.success && result.documents) {
        setDocuments(result.documents)
      } else {
        setDocuments([])
      }
    } catch (err) {
      setError('Failed to load documents')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError(null)
    } else {
      setError('Please select a PDF file')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first')
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
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const totalDocuments = documents.length
  const totalPages = documents.reduce((sum, doc) => sum + (doc.total_pages || 0), 0)
  const lastUpload = documents.length > 0
    ? new Date(documents[0]?.created_at).toLocaleDateString()
    : 'Nessuno'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">PDF AI</p>
              <p className="text-xs text-slate-400">Workspace</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-medium text-cyan-300">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Documenti
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Impostazioni
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              disabled={totalDocuments === 0}
              className="hidden rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:block"
              title={totalDocuments === 0 ? 'Carica almeno un documento per cercare' : 'Cerca in tutti i documenti'}
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-white">
                {(profile?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="max-w-[160px] truncate text-sm font-medium text-white">{profile?.email || '...'}</p>
                <p className="text-xs text-slate-400">
                  {profile ? getTierByName(profile.tier)?.name || profile.tier : '...'}
                </p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                <ShieldCheck className="h-4 w-4" />
                Benvenuto nella tua workspace
              </div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Carica, organizza e interagisci con i tuoi PDF in modo semplice.
              </h1>
              <p className="text-lg text-slate-300">
                Gestisci i tuoi documenti, monitora l'uso e continua le conversazioni con l'AI senza disconnetterti.
              </p>
              {totalDocuments > 0 && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/20"
                >
                  <Search className="h-4 w-4" />
                  Cerca in tutti i tuoi documenti
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Documenti', value: totalDocuments.toString(), icon: FileText },
                { label: 'Pagine usate', value: totalPages > 0 ? `${totalPages}/10` : '0', icon: BarChart3 },
                { label: 'Ultimo upload', value: lastUpload, icon: Clock3 },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
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
                <h2 className="text-xl font-semibold">Carica un documento</h2>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center transition hover:border-cyan-400/40"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                  <p className="mb-2 text-white">Trascina qui il tuo PDF</p>
                  <p className="text-sm text-slate-500">oppure clicca per cercarlo</p>
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
                      <span>Caricamento...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Upload PDF
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Consigli rapidi</h3>
                <Bell className="h-4 w-4 text-slate-400" />
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Carica documenti di grandi dimensioni per ottenere risposte più dettagliate.</li>
                <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Usa la ricerca per trovare informazioni tra tutti i tuoi documenti insieme, senza doverli aprire uno a uno.</li>
                <li className="rounded-xl border border-white/10 bg-slate-950/40 p-3">Controlla lo stato dei processi prima di avviare nuove operazioni.</li>
              </ul>
            </div>

            {profile && profile.tier !== 'team' && (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <h3 className="mb-1 text-lg font-semibold text-white">Il tuo piano</h3>
                <p className="mb-4 text-sm text-slate-400">
                  Sei sul piano <span className="text-cyan-300">{getTierByName(profile.tier)?.name || profile.tier}</span>.
                  {profile.tier === 'free' ? ' Passa a un piano superiore per più pagine e progetti.' : ' Passa a Team per condividere i documenti con il tuo gruppo.'}
                </p>
                <div className="space-y-2">
                  {profile.tier === 'free' && (
                    <UpgradeButton plan="pro" userId={profile.id} email={profile.email} label={`Passa a Pro — ${getTierByName('Pro')?.price}€/mese`} />
                  )}
                  <UpgradeButton plan="team" userId={profile.id} email={profile.email} label={`Passa a Team — ${getTierByName('Team')?.price}€/mese`} />
                </div>
              </div>
            )}
          </aside>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">I tuoi documenti</h2>
                <p className="text-sm text-slate-400">Tieni tutto in ordine e accedi subito ai PDF caricati.</p>
              </div>
              <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10">
                Nuovo upload
              </Link>
            </div>

            <div className="space-y-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>

            {documents.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-slate-600" />
                <p className="text-slate-400">Non hai ancora documenti. Carica il tuo primo PDF.</p>
              </div>
            )}

            {sharedDocuments.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-300" />
                  <h3 className="text-lg font-semibold text-white">Condivisi con me</h3>
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
      </main>

      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function UpgradeButton({ plan, userId, email, label }: { plan: 'pro' | 'team'; userId: string; email: string; label: string }) {
  const url = buildCheckoutUrl(plan, userId, email)

  if (!url) {
    // LEMONSQUEEZY_CHECKOUT_URLS non ancora compilato in lib/constants.ts
    return (
      <button
        disabled
        title="Configura LEMONSQUEEZY_CHECKOUT_URLS in lib/constants.ts"
        className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-500 opacity-50"
      >
        {label} (non configurato)
      </button>
    )
  }

  return (
    <a
      href={url}
      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      {label}
    </a>
  )
}

function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<any[]>([])

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
      setError('Ricerca fallita, riprova')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Search className="h-5 w-5 text-cyan-300" />
            Cerca in tutti i tuoi documenti
          </h3>
          <button onClick={onClose} className="text-slate-400 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Es. quando scade il contratto di affitto?"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Cerca'}
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Fonti</p>
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <Link
                      key={i}
                      href={`/document/${source.documentId}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="truncate">
                        [Fonte {i + 1}] {source.documentName}
                        {source.pageNumber ? ` — pag. ${source.pageNumber}` : ''}
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

function DocumentCard({ document, sharedByEmail }: { document: any; sharedByEmail?: string }) {
  // Ora basato su processing_status invece del vecchio controllo
  // !parsed_text && total_pages === 0, che non rifletteva mai lo stato
  // "failed" e poteva restare bloccato su "in elaborazione" per sempre
  // se il job falliva prima di scrivere parsed_text.
  const isProcessing = document.processing_status === 'pending' || document.processing_status === 'processing'
  const hasFailed = document.processing_status === 'failed'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <FileText className="h-6 w-6 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-semibold text-white">{document.name}</h3>
              {sharedByEmail && (
                <div className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-1 text-xs text-violet-300">
                  <Users className="h-3 w-3" />
                  <span className="truncate max-w-[140px]">{sharedByEmail}</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
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
            <p className="mb-2 line-clamp-2 text-sm text-slate-400">
              {document.summary || (hasFailed ? (document.error_message || 'Elaborazione fallita') : 'In attesa di elaborazione...')}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {document.total_pages || 0} pagine
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(document.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/document/${document.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <MessageSquare className="h-4 w-4" />
          Apri chat
        </Link>
      </div>
    </div>
  )
}