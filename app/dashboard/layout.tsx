'use client'

// app/dashboard/layout.tsx
//
// Shell condivisa da tutte le sotto-pagine di /dashboard: header globale +
// sidebar agganciata a sinistra + footer, una sola volta invece che
// ripetuti in ogni page.tsx. flex-col + flex-1 sul blocco centrale tiene il
// footer ancorato in fondo alla viewport anche quando il contenuto (es.
// Favoriti vuoto) è più corto dello schermo.

import { FileText } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { PageTransition } from '@/components/animations/page-transition'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={FileText}
        title="PDF AI"
        subtitle="Workspace"
        gradient="from-cyan-400 to-violet-500"
        active="documents"
      />

      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      <AppFooter />
    </div>
  )
}
