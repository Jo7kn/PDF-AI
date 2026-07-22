'use client'

// components/admin/announcement-composer.tsx
//
// Form per mandare un annuncio al canale Discord dedicato (vedi
// app/actions/discord-announce.ts). Ottimistico solo nel senso che disabilita
// il form durante l'invio — niente stato locale dei messaggi già mandati,
// la fonte di verità resta Discord stesso.

import { useState } from 'react'
import { Send, Loader2, Check, AlertCircle } from 'lucide-react'
import { sendDiscordAnnouncement } from '@/app/actions/discord-announce'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Non autorizzato.',
  empty: 'Scrivi un messaggio prima di inviare.',
  'too-long': 'Messaggio troppo lungo (max 4096 caratteri).',
  'title-too-long': 'Titolo troppo lungo (max 256 caratteri).',
  'not-configured': 'DISCORD_BOT_TOKEN o DISCORD_ANNOUNCEMENTS_CHANNEL_ID non configurati.',
  network: 'Errore di rete, riprova.',
}

function errorLabel(code?: string): string {
  if (!code) return 'Invio fallito, riprova.'
  return ERROR_MESSAGES[code] || (code.startsWith('discord-') ? `Discord ha rifiutato il messaggio (${code}).` : 'Invio fallito, riprova.')
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
    const result = await sendDiscordAnnouncement(title, message)
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
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Scrivi l'annuncio da postare nel canale Discord..."
        rows={4}
        maxLength={4096}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {status === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Annuncio inviato su Discord.
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-300">
              <AlertCircle className="h-3.5 w-3.5" /> {errorLabel(error)}
            </span>
          )}
          {status === 'idle' && <span className="text-slate-500">{message.length}/4096 caratteri</span>}
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !message.trim()}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <Send className="h-4 w-4" />}
          Invia annuncio
        </button>
      </div>
    </form>
  )
}
