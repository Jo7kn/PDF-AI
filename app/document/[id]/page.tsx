'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Send, FileText, Calendar, Loader2, User, Bot,
  AlertCircle, Clock, RotateCcw, CalendarDays, Link2, Check,
  Users, X, Trash2, Eye, Sparkles
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { Skeleton } from '@/components/skeleton'
import { CopyIconSwap } from '@/components/animations/copy-icon-swap'
import { getDocument } from '@/app/actions/documents'
import { getMessages } from '@/app/actions/messages'
import { chatWithDocument, processDocument } from '@/app/actions/processing'
import { shareDocument, unshareDocument, getDocumentShares } from '@/app/actions/sharing'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

const POLL_INTERVAL_MS = 4000

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doc, setDoc] = useState<any>(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [docError, setDocError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadDocument = useCallback(async (): Promise<any> => {
    const result = await getDocument(params.id)
    if (result.error) {
      setDocError(result.error)
      setDoc(null)
      return null
    }
    setDocError(null)
    setDoc(result.document)
    return result.document
  }, [params.id])

  const loadMessages = useCallback(async () => {
    const result = await getMessages(params.id)
    if (result.success && result.messages && result.messages.length > 0) {
      setMessages(result.messages)
    } else if (result.success) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Ciao! Ho analizzato il tuo documento. Chiedimi pure qualsiasi cosa sul suo contenuto, le scadenze o le informazioni chiave.",
          created_at: new Date().toISOString(),
        },
      ])
    } else {
      setError('Impossibile caricare i messaggi')
    }
  }, [params.id])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoadingDoc(true)
      const d = await loadDocument()
      if (cancelled) return
      await loadMessages()
      if (cancelled) return
      setLoadingDoc(false)

      if (d && (d.processing_status === 'pending' || d.processing_status === 'processing')) {
        pollUntilDone()
      }
    }

    async function pollUntilDone() {
      while (!cancelled) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
        if (cancelled) return
        const d = await loadDocument()
        if (!d || d.processing_status === 'completed' || d.processing_status === 'failed') {
          if (d?.processing_status === 'completed') {
            await loadMessages()
          }
          return
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [params.id, loadDocument, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isProcessing = doc?.processing_status === 'pending' || doc?.processing_status === 'processing'
  const hasFailed = doc?.processing_status === 'failed'
  const isOwner = doc?.isOwner !== false 

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading || isProcessing) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev: any[]) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const result = await chatWithDocument(params.id, content)
      if (result.error) throw new Error(result.error)
      await loadMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      setMessages((prev: any[]) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Mi dispiace, ho incontrato un errore. Riprova.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
  }

  const handleRetry = async () => {
    if (!doc || retrying) return
    setRetrying(true)
    setError(null)
    try {
      await processDocument(doc.id, doc.file_url)
      await loadDocument()
    } catch (err) {
      setError("Impossibile riavviare l'elaborazione. Riprova tra poco.")
    } finally {
      setRetrying(false)
    }
  }

  const handleExportCalendar = () => {
    if (!doc?.deadlines_json?.length) return

    const escapeICS = (s: string) => String(s).replace(/[,;\\]/g, m => `\\${m}`)
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PDF AI//Deadlines//IT']

    doc.deadlines_json.forEach((d: any, i: number) => {
      const dateStr = String(d.date).replace(/-/g, '')
      if (!/^\d{8}$/.test(dateStr)) return 
      lines.push(
        'BEGIN:VEVENT',
        `UID:${doc.id}-${i}@pdfai`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:${escapeICS(d.description || 'Scadenza')}`,
        'END:VEVENT'
      )
    })
    lines.push('END:VCALENDAR')

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(doc.name || 'documento').replace(/\.[^/.]+$/, '')}-scadenze.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      setError('Impossibile copiare il link')
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={FileText}
        title="PDF AI"
        subtitle={doc?.name || 'Documento'}
        gradient="from-cyan-400 to-violet-500"
        active="documents"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/files"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors duration-150 ease-out hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai documenti
        </Link>

        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <aside className="space-y-6">
            {loadingDoc ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 flex-shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ) : docError ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{docError}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-white">{doc?.name}</h2>
                      <p className="text-sm text-slate-400">{doc?.total_pages || 0} pagine</p>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setShareOpen(true)}
                      title="Condividi documento"
                      className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!isOwner && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-sm text-violet-200">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Documento condiviso da {doc?.ownerEmail || 'un altro utente'}
                      {doc?.sharePermission === 'view' ? ' · sola lettura' : ''}
                    </span>
                  </div>
                )}

                {isProcessing && (
                  <div className="animate-fade-in-up mb-4 flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-200">
                    <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin-fast" />
                    <span>Documento in elaborazione, un momento...</span>
                  </div>
                )}

                {hasFailed && isOwner && (
                  <div className="animate-fade-in-up mb-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{doc?.error_message || 'Elaborazione fallita.'}</span>
                    </div>
                    <button
                      onClick={handleRetry}
                      disabled={retrying}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-150 ease-out hover:bg-white/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                    >
                      {retrying ? (
                        <Loader2 className="h-4 w-4 animate-spin-fast" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      Riprova elaborazione
                    </button>
                  </div>
                )}

                {!isProcessing && !hasFailed && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-white">Riassunto</h3>
                      <p className="text-sm text-slate-400">{doc?.summary || 'Nessun riassunto disponibile.'}</p>
                    </div>

                    {doc?.deadlines_json && doc.deadlines_json.length > 0 && (
                      <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                          <Calendar className="h-4 w-4 text-cyan-300" />
                          Scadenze
                        </h3>
                        <div className="space-y-2">
                          {doc.deadlines_json.map((deadline: any, index: number) => (
                            <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-3">
                              <p className="text-sm font-medium text-white">{deadline.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">Azioni rapide</h3>
              <div className="space-y-2">
                <button
                  onClick={() => sendMessage('Fammi un riassunto dettagliato del documento, punto per punto.')}
                  disabled={isProcessing || loading}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                  <span>Riassumi il documento</span>
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                </button>
                <button
                  onClick={() => sendMessage('Elenca tutte le scadenze e le date importanti presenti nel documento.')}
                  disabled={isProcessing || loading}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                  <span>Estrai tutte le scadenze</span>
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                </button>
                <button
                  onClick={handleExportCalendar}
                  disabled={!doc?.deadlines_json?.length}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                  <span>Esporta nel calendario</span>
                  <CalendarDays className="h-4 w-4 flex-shrink-0" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
                >
                  <span>{linkCopied ? 'Link copiato!' : 'Copia link documento'}</span>
                  {linkCopied ? <Check className="h-4 w-4 flex-shrink-0 text-cyan-300" /> : <Link2 className="h-4 w-4 flex-shrink-0" />}
                </button>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20">
            <div className="flex h-[calc(100vh-200px)] flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.map((message) => (
                  <div key={message.id} className="animate-fade-in-up">
                    <MessageBubble message={message} />
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-3 text-cyan-300">
                    <Loader2 className="h-5 w-5 animate-spin-fast" />
                    <span className="text-sm">L'AI sta pensando...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 p-4">
                {isProcessing && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>La chat sarà disponibile appena l'elaborazione termina</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Fai una domanda su questo documento..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none disabled:opacity-50"
                    disabled={loading || isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={loading || isProcessing || !input.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin-fast" /> : <Send className="h-5 w-5" />}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      {shareOpen && doc && (
        <ShareModal documentId={doc.id} onClose={() => setShareOpen(false)} />
      )}

      <AppFooter />
    </div>
  )
}

function ShareModal({ documentId, onClose }: { documentId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [shares, setShares] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Ingresso/uscita animati, stesso pattern di GlobalSearchModal
  // (dashboard/files/page.tsx): senza show=true al mount la transizione
  // non ha uno stato "da" da cui partire e scatta istantanea.
  const [show, setShow] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 150)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getDocumentShares(documentId)
    if (result.success) {
      setShares(result.shares || [])
      setError(null)
    } else {
      setError(result.error || 'Impossibile caricare le condivisioni')
    }
    setLoading(false)
  }, [documentId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    const result = await shareDocument(documentId, email.trim())
    if (result.error) {
      setError(result.error)
    } else {
      setEmail('')
      await load()
    }
    setSubmitting(false)
  }

  const handleRemove = async (shareId: string) => {
    const result = await unshareDocument(documentId, shareId)
    if (result.error) {
      setError(result.error)
    } else {
      await load()
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
        className={`w-full max-w-md origin-center rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl transition-[opacity,transform] duration-200 ease-out-strong ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Users className="h-5 w-5 text-cyan-300" />
            Condividi documento
          </h3>
          <button onClick={handleClose} className="text-slate-400 transition-colors duration-150 ease-out hover:text-white active:scale-90">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@esempio.com"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors duration-150 ease-out focus:border-cyan-400/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : 'Invita'}
          </button>
        </form>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Persone con accesso
        </p>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin-fast text-cyan-300" />
          </div>
        ) : shares.length === 0 ? (
          <p className="text-sm text-slate-500">Non hai ancora condiviso questo documento con nessuno.</p>
        ) : (
          <div className="space-y-2">
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-2 min-w-0">
                  {share.permission === 'view' ? (
                    <Eye className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
                  ) : (
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-cyan-300" />
                  )}
                  <span className="truncate text-sm text-slate-200">{share.email}</span>
                </div>
                <button
                  onClick={() => handleRemove(share.id)}
                  className="flex-shrink-0 text-slate-500 transition-colors duration-150 ease-out hover:text-red-300"
                  title="Rimuovi accesso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Nota: la persona deve avere già un account su AI Toolbox con questa email.
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: any }) {
  const { locale } = useLocale()
  const isUser = message.role === 'user'
  const timestamp = message.created_at ? new Date(message.created_at) : null
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-gradient-to-br from-cyan-400 to-violet-500' : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
        }`}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>
      <div
        className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
            : 'border border-white/10 bg-white/5 text-slate-200'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -right-9 top-2 rounded-lg bg-white/5 p-1.5 text-slate-400 opacity-0 transition-[opacity,background-color,color] duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-90 group-hover:opacity-100"
            title="Copia testo"
          >
            <CopyIconSwap copied={copied} className="h-4 w-4" />
          </button>
        )}

        {timestamp && (
          <p className="mt-2 text-xs text-white/50">{timestamp.toLocaleTimeString(LOCALE_DATE_TAG[locale])}</p>
        )}
      </div>
    </div>
  )
}
