'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  User,
  Send,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { runChatAi } from '@/app/actions/chat-ai'
import type { ChatMessage } from '@/lib/nvidia/chat'

export default function ChatAiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: input.trim() }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    const result = await runChatAi(nextMessages)

    if ('error' in result) {
      setError(result.error)
    } else {
      setMessages([...nextMessages, { role: 'assistant', content: result.result }])
    }
    setLoading(false)
  }

  const handleReset = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={Bot}
        title="Chat AI"
        subtitle="Assistente AI generico"
        gradient="from-violet-400 to-fuchsia-500"
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">Conversazione libera, senza documenti collegati.</p>
          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <SaveButton
                tool="chat-ai"
                title={messages.find((m) => m.role === 'user')?.content.slice(0, 60) || 'Conversazione'}
                content={messages.map((m) => `${m.role === 'user' ? 'Tu' : 'AI'}: ${m.content}`).join('\n\n')}
                metadata={{ messageCount: messages.length }}
              />
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Nuova conversazione
              </button>
            </div>
          )}
        </div>

        <div className="flex min-h-[28rem] flex-1 flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 sm:p-6">
          <div className="flex-1 space-y-5 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center text-slate-600">
                <Sparkles className="h-10 w-10" />
                <p className="text-sm">Scrivi qualcosa per iniziare la conversazione</p>
              </div>
            )}

            {messages.map((message, i) => (
              <MessageBubble key={i} message={message} />
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin-fast" />
                  <span className="text-sm">Sto scrivendo...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t border-white/10 pt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-400/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copia fallita:', err)
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
        className={`group relative max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
            : 'border border-white/10 bg-white/5 text-slate-200'
        }`}
      >
        {message.content}

        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -right-9 top-2 rounded-lg bg-white/5 p-1.5 text-slate-400 opacity-0 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white group-hover:opacity-100"
            title="Copia testo"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-cyan-300" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}
