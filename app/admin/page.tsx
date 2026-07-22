import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Shield, Users, FileText, Zap, TrendingUp, Mail, type LucideIcon } from 'lucide-react'
import { checkIsAdmin, getCurrentAdminEmail, getAnalyticsSummary, getActivityLog, getWaitlistSummary } from '@/app/actions/admin'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import { FeatureFlagToggle } from '@/components/admin/feature-flag-toggle'

// Pagina interna: mai indicizzata, mai linkata dal sito pubblico.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')

  const [flags, analyticsResult, activityResult, waitlistResult, email] = await Promise.all([
    getAllFeatureFlags(),
    getAnalyticsSummary(),
    getActivityLog(50),
    getWaitlistSummary(20),
    getCurrentAdminEmail(),
  ])

  const analytics = 'data' in analyticsResult ? analyticsResult.data : null
  const activity = 'data' in activityResult ? activityResult.data : []
  const waitlist = 'data' in waitlistResult ? waitlistResult.data : null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Admin</h1>
            <p className="text-sm text-slate-400">{email}</p>
          </div>
        </header>

        <section>
          <h2 className="mb-1 text-lg font-semibold text-white">Strumenti disponibili al pubblico</h2>
          <p className="mb-4 text-xs text-slate-500">
            Tutto parte spento durante il pre-lancio. Accendi ogni voce quando è pronta per utenti reali — l'effetto è immediato, nessun deploy necessario.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {flags.map((flag) => (
              <FeatureFlagToggle key={flag.slug} flag={flag} />
            ))}
          </div>
          {flags.length === 0 && (
            <p className="text-sm text-amber-300">
              Nessun feature flag trovato: applica la migration supabase/migrations/011_admin_and_feature_flags.sql sul database.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Analitiche</h2>
          {!analytics ? (
            <p className="text-sm text-red-300">{'error' in analyticsResult ? analyticsResult.error : 'Errore nel caricamento'}</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="Utenti totali" value={analytics.totalUsers} />
                <StatCard icon={TrendingUp} label="Nuovi utenti (7gg)" value={analytics.newUsersLast7Days} />
                <StatCard icon={FileText} label="Documenti caricati" value={analytics.totalDocuments} />
                <StatCard icon={Zap} label="Crediti usati (30gg)" value={analytics.creditsUsedLast30Days} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <StatCard label="Piano Free" value={analytics.usersByTier.free} />
                <StatCard label="Piano Pro" value={analytics.usersByTier.pro} />
                <StatCard label="Piano Team" value={analytics.usersByTier.team} />
              </div>

              {analytics.toolUsageLast30Days.length > 0 && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="mb-4 text-sm font-semibold text-white">Utilizzo per strumento (ultimi 30 giorni)</p>
                  <div className="space-y-2">
                    {analytics.toolUsageLast30Days.map((t) => (
                      <div key={t.tool} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{t.tool}</span>
                        <span className="text-slate-500">{t.count} usi · {t.creditsUsed} crediti</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-lg font-semibold text-white">Lista d'attesa</h2>
          <p className="mb-4 text-xs text-slate-500">
            Chi si è iscritto dal form "avvisami al lancio" sulle pagine Coming Soon (vedi components/coming-soon.tsx).
          </p>
          {!waitlist ? (
            <p className="text-sm text-red-300">{'error' in waitlistResult ? waitlistResult.error : 'Errore nel caricamento'}</p>
          ) : (
            <>
              <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Mail} label="Iscritti totali" value={waitlist.total} />
                {waitlist.bySource.slice(0, 3).map((s) => (
                  <StatCard key={s.source} label={s.source} value={s.count} />
                ))}
              </div>

              {waitlist.recent.length === 0 ? (
                <p className="text-sm text-slate-500">Nessuna iscrizione ancora.</p>
              ) : (
                <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/80">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Da</th>
                        <th className="px-4 py-3">Quando</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waitlist.recent.map((signup) => (
                        <tr key={signup.email} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-3 text-slate-300">{signup.email}</td>
                          <td className="px-4 py-3 text-slate-500">{signup.source || '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(signup.createdAt).toLocaleString('it-IT')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-lg font-semibold text-white">Log attività</h2>
          <p className="mb-4 text-xs text-slate-500">
            Registro reale degli eventi (tabella usage_events) — non è l'output stdout del server, che questo stack non persiste da nessuna parte.
          </p>
          {'error' in activityResult ? (
            <p className="text-sm text-red-300">{activityResult.error}</p>
          ) : activity.length === 0 ? (
            <p className="text-sm text-slate-500">Nessuna attività registrata ancora.</p>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/80">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Utente</th>
                    <th className="px-4 py-3">Strumento</th>
                    <th className="px-4 py-3">Azione</th>
                    <th className="px-4 py-3">Crediti</th>
                    <th className="px-4 py-3">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((event) => (
                    <tr key={event.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-slate-300">{event.userEmail}</td>
                      <td className="px-4 py-3 text-slate-300">{event.tool}</td>
                      <td className="px-4 py-3 text-slate-500">{event.action || '—'}</td>
                      <td className="px-4 py-3 text-amber-300/80">-{event.creditsCost}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(event.createdAt).toLocaleString('it-IT')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon?: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      {Icon && (
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
