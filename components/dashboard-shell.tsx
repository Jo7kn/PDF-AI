'use client'

// components/dashboard-shell.tsx
//
// Estratto da app/dashboard/layout.tsx per poterlo tenere client component
// (AppHeader/Sidebar hanno hook) mentre il layout stesso diventa un Server
// Component che decide, leggendo il feature flag da Supabase, se montarlo
// oppure mostrare <ComingSoon /> — un Server Component non può fare
// data-fetching async e restare 'use client' allo stesso tempo.

import { FileText } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { PageTransition } from '@/components/animations/page-transition'

export function DashboardShell({ children, isAdmin }: { children: React.ReactNode; isAdmin?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#050506] text-white">
      <AppHeader
        icon={FileText}
        title="PDF AI"
        subtitle="Workspace"
        gradient=""
        active="documents"
      />

      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardSidebar isAdmin={isAdmin} />
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
