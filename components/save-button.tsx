'use client'

// components/save-button.tsx
//
// Pulsante "Salva" riusato in tutte le pagine tool (tranne PDF AI, che ha
// gia' il proprio salvataggio via upload). Salvataggio esplicito: l'utente
// sceglie cosa tenere, niente auto-save di ogni generazione.

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { saveItem, saveImageItem } from '@/app/actions/saved-items'
import type { ToolSlug } from '@/lib/credits'

interface SaveButtonProps {
  tool: ToolSlug
  title: string
  content: string // testo, oppure data URL "data:image/..." se contentType è "image"
  contentType?: 'text' | 'image'
  metadata?: Record<string, unknown>
}

export function SaveButton({ tool, title, content, contentType = 'text', metadata }: SaveButtonProps) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSave = async () => {
    if (state === 'saving' || state === 'saved' || !content.trim()) return
    setState('saving')

    const result =
      contentType === 'image'
        ? await saveImageItem({ tool, title, dataUrl: content, metadata })
        : await saveItem({ tool, title, content, metadata })

    setState('error' in result ? 'error' : 'saved')
    if ('error' in result) {
      setTimeout(() => setState('idle'), 2500)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={state === 'saving' || state === 'saved'}
      title={state === 'error' ? 'Salvataggio fallito, riprova' : 'Salva nei tuoi file'}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 ${
        state === 'saved'
          ? 'bg-emerald-400/15 text-emerald-300'
          : state === 'error'
            ? 'bg-red-400/15 text-red-300'
            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {state === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin-fast" />}
      {state === 'saved' && <BookmarkCheck className="h-3.5 w-3.5" />}
      {(state === 'idle' || state === 'error') && <Bookmark className="h-3.5 w-3.5" />}
      {state === 'saved' ? 'Salvato' : state === 'error' ? 'Errore' : 'Salva'}
    </button>
  )
}
