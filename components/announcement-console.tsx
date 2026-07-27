'use client'

// components/announcement-console.tsx
//
// Riquadro "console" pubblico sulla landing page: mostra gli ultimi annunci
// pubblicati da /admin (vedi components/admin/announcement-composer.tsx +
// app/actions/announcements.ts). Stessa estetica terminale del pannello
// admin (components/admin/console-log.tsx) per coerenza visiva, ma fetch +
// polling lato client invece che lettura server-side: la home è generata
// staticamente in build, un fetch server-side qui resterebbe congelato allo
// stato del build finché non arriva un nuovo deploy — client-side invece
// mostra sempre l'ultimo annuncio, anche postato un minuto fa.

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'lucide-react'
import { getAnnouncements, type Announcement } from '@/app/actions/announcements'
import { ScrollReveal } from '@/components/scroll-reveal'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

const POLL_MS = 45000

export function AnnouncementConsole({ className = 'mx-auto max-w-4xl px-4 sm:px-6 lg:px-8' }: { className?: string }) {
  const { t, locale } = useLocale()
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const formatTimestamp = (iso: string): string =>
    new Date(iso).toLocaleString(LOCALE_DATE_TAG[locale], {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAnnouncements(6)
        setAnnouncements(data)
      } catch (err) {
        // Senza questo, un rifiuto della server action (rete, action non
        // raggiungibile) lasciava announcements a null per sempre — il
        // riquadro restava bloccato su "Caricamento…" senza mai mostrare
        // lo stato vuoto reale.
        console.error('AnnouncementConsole: fetch fallito', err)
        setAnnouncements([])
      }
    }
    load()
    timer.current = setInterval(load, POLL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return (
    <section className={className}>
      <ScrollReveal>
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          {/* Barra titolo in stile finestra terminale */}
          <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-950/60 px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              annunci@ai-toolbox
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              {t('announcementConsole.live')}
            </span>
          </div>

          {/* Corpo log */}
          <div className="max-h-80 overflow-y-auto p-5 font-mono text-sm leading-relaxed">
            {announcements === null ? (
              <p className="text-neutral-600">{t('announcementConsole.loading')}</p>
            ) : announcements.length === 0 ? (
              <p className="flex items-center gap-2 text-neutral-500">
                <span className="text-amber-400">❯</span>
                {t('announcementConsole.empty')}
                <span className="inline-block h-4 w-[7px] animate-pulse bg-amber-400/80" />
              </p>
            ) : (
              announcements.map((a, i) => (
                <div
                  key={a.id}
                  className="animate-fade-in-up mb-4 last:mb-0"
                  style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-amber-400">❯</span>
                    <span className="text-neutral-600">[{formatTimestamp(a.createdAt)}]</span>
                    {a.title && <span className="font-semibold text-neutral-50">{a.title}</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words pl-5 text-neutral-300">
                    {a.message}
                    {i === 0 && <span className="ml-1 inline-block h-4 w-[7px] translate-y-[3px] animate-pulse bg-amber-400/80" />}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
