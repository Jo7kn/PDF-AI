'use client'

// components/admin/console-log.tsx
//
// "Console" richiesta dall'utente: log reali del server (vedi lib/logger.ts),
// non i log del SUO terminale locale — su Vercel non esiste un terminale da
// mostrare, questa è la cosa più vicina che si può servire via web. Polling
// invece di websocket/SSE: a questa scala (pannello admin, un solo viewer
// alla volta) non giustifica l'infrastruttura in più.

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'lucide-react'
import { getRecentLogs, type AppLogEntry } from '@/app/actions/admin'

const LEVEL_STYLE: Record<AppLogEntry['level'], string> = {
  error: 'text-red-300',
  warn: 'text-amber-300',
  info: 'text-slate-400',
}

const POLL_MS = 5000

export function ConsoleLog() {
  const [logs, setLogs] = useState<AppLogEntry[] | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = async () => {
      const result = await getRecentLogs(50)
      if ('data' in result) setLogs(result.data)
    }
    load()
    timer.current = setInterval(load, POLL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Terminal className="h-4 w-4 text-emerald-300" /> Console
        <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          live
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-xs leading-relaxed">
        {!logs ? (
          <p className="text-slate-600">Caricamento…</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-600">Nessun evento registrato ancora.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2 whitespace-pre-wrap break-all">
              <span className="flex-shrink-0 text-slate-600">{new Date(log.createdAt).toLocaleTimeString('it-IT')}</span>
              <span className={`flex-shrink-0 uppercase ${LEVEL_STYLE[log.level]}`}>[{log.level}]</span>
              <span className="text-slate-300">
                {log.message}
                {log.meta && <span className="text-slate-500"> {JSON.stringify(log.meta)}</span>}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
