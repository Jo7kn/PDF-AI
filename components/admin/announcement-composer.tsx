'use client'

// components/admin/announcement-composer.tsx
//
// Form per pubblicare un annuncio sul sito (riquadro console su landing/home,
// vedi components/announcement-console.tsx + app/actions/announcements.ts).
// Canale indipendente da Discord (vedi discord-announcement-composer.tsx):
// l'admin sceglie separatamente cosa mandare dove.

import { useState } from 'react'
import { Send, Loader2, Check, AlertCircle } from 'lucide-react'
import { postAnnouncement } from '@/app/actions/announcements'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Non autorizzato.',
  empty: 'Scrivi un messaggio prima di inviare.',
  'too-long': 'Messaggio troppo lungo (max 4096 caratteri).',
  'title-too-long': 'Titolo troppo lungo (max 256 caratteri).',
  db: 'Salvataggio annuncio fallito, riprova.',
}

function errorLabel(code?: string): string {
  if (!code) return 'Invio fallito, riprova.'
  return ERROR_MESSAGES[code] || 'Invio fallito, riprova.'
}

export function AnnouncementComposer() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading' || !message.trim()) return
    setStatus('loading')
    setError(undefined)
    const result = await postAnnouncement(title, message)
    if (result.success) {
      setStatus('success')
      setTitle('')
      setMessage('')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo (opzionale — es. 🚀 Nuovo strumento disponibile)"
        maxLength={256}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Scrivi l'annuncio da mostrare nel riquadro console del sito..."
        rows={4}
        maxLength={4096}
        className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-brand/50 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {status === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Annuncio pubblicato sul sito.
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-300">
              <AlertCircle className="h-3.5 w-3.5" /> {errorLabel(error)}
            </span>
          )}
          {status === 'idle' && <span className="text-neutral-500">{message.length}/4096 caratteri</span>}
        </div>
        <Button type="submit" className="flex-shrink-0 gap-2" disabled={status === 'loading' || !message.trim()}>
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <Send className="h-4 w-4" />}
          Pubblica sul sito
        </Button>
      </div>
    </form>
  )
}
