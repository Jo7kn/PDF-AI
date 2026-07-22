'use client'

// components/admin/export-waitlist-button.tsx
//
// La tabella a schermo (getWaitlistSummary) è troncata alle ultime 20 righe —
// questo esporta la lista intera via exportWaitlistCsv() come download diretto,
// niente round-trip su una route API dedicata.

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { exportWaitlistCsv } from '@/app/actions/admin'

export function ExportWaitlistButton() {
  const [isPending, setIsPending] = useState(false)

  const handleExport = async () => {
    if (isPending) return
    setIsPending(true)
    try {
      const result = await exportWaitlistCsv()
      if ('error' in result) return

      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-150 ease-out hover:bg-white/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin-fast" /> : <Download className="h-4 w-4" />}
      Esporta CSV
    </button>
  )
}
