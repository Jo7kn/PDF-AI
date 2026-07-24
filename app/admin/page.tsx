import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  Shield,
  Users,
  FileText,
  Zap,
  TrendingUp,
  Mail,
  Sliders,
  BarChart3,
  Megaphone,
  Wallet,
  Activity,
  ArrowLeft,
  UserPlus,
  Gift,
  Terminal,
  type LucideIcon,
} from 'lucide-react'
import {
  checkIsAdmin,
  getCurrentAdminEmail,
  getAnalyticsSummary,
  getActivityLog,
  getWaitlistSummary,
  getSignupsByDay,
  getRecentSignups,
} from '@/app/actions/admin'
import { getAllFeatureFlags } from '@/lib/feature-flags'
import { FeatureFlagToggle } from '@/components/admin/feature-flag-toggle'
import { AnnouncementComposer } from '@/components/admin/announcement-composer'
import { DiscordAnnouncementComposer } from '@/components/admin/discord-announcement-composer'
import { CreditAdjuster } from '@/components/admin/credit-adjuster'
import { ExportWaitlistButton } from '@/components/admin/export-waitlist-button'
import { ConsoleLog } from '@/components/admin/console-log'

// Pagina interna: mai indicizzata, mai linkata dal sito pubblico.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const NAV_SECTIONS = [
  { id: 'panoramica', label: 'Panoramica' },
  { id: 'strumenti', label: 'Strumenti' },
  { id: 'comunicazioni', label: 'Comunicazioni' },
  { id: 'lista-attesa', label: "Lista d'attesa" },
  { id: 'console', label: 'Console' },
  { id: 'log-attivita', label: 'Log attività' },
]

// Documented sequential "blue" ramp — vedi dataviz skill references/palette.md.
// Un solo hue, chiarezza crescente: base scura per il valore più basso,
// step centrale per quello medio, il più chiaro per l'ultimo — coerente col
// trattamento "ordinal" (Free/Pro/Team sono un ordine, non categorie libere).
const SEQUENTIAL_BLUE = { bar: '#3987e5', dark: '#256abf', mid: '#5598e7', light: '#9ec5f4' }

export default async function AdminPage() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')

  const [flags, analyticsResult, activityResult, waitlistResult, signupsByDayResult, recentSignupsResult, email] = await Promise.all([
    getAllFeatureFlags(),
    getAnalyticsSummary(),
    getActivityLog(50),
    getWaitlistSummary(20),
    getSignupsByDay(14),
    getRecentSignups(10),
    getCurrentAdminEmail(),
  ])

  const analytics = 'data' in analyticsResult ? analyticsResult.data : null
  const activity = 'data' in activityResult ? activityResult.data : []
  const waitlist = 'data' in waitlistResult ? waitlistResult.data : null
  const signupsByDay = 'data' in signupsByDayResult ? signupsByDayResult.data : []
  const recentSignups = 'data' in recentSignupsResult ? recentSignupsResult.data : []
  const enabledCount = flags.filter((f) => f.enabled).length

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">Admin · AI Toolbox</p>
              <p className="text-xs leading-tight text-slate-400">{email}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
              >
                {s.label}
              </a>
            ))}
            <a
              href="/dashboard"
              className="ml-2 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-150 ease-out hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </a>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
        <section id="panoramica" className="scroll-mt-24">
          <SectionHeader icon={BarChart3} title="Panoramica" description="Numeri chiave dell'ultimo mese." />
          {!analytics ? (
            <ErrorNote message={'error' in analyticsResult ? analyticsResult.error : 'Errore nel caricamento'} />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="Utenti totali" value={analytics.totalUsers} accent="cyan" />
                <StatCard icon={TrendingUp} label="Nuovi utenti (7gg)" value={analytics.newUsersLast7Days} accent="emerald" />
                <StatCard icon={FileText} label="Documenti caricati" value={analytics.totalDocuments} accent="violet" />
                <StatCard icon={Zap} label="Crediti usati (30gg)" value={analytics.creditsUsedLast30Days} accent="amber" />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <SignupsChart data={signupsByDay} />
                <TierChart usersByTier={analytics.usersByTier} />
              </div>

              {recentSignups.length > 0 && (
                <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                    <UserPlus className="h-4 w-4 text-cyan-300" /> Ultimi iscritti
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-2 py-2">Email</th>
                          <th className="px-2 py-2">Piano</th>
                          <th className="px-2 py-2">Invitato</th>
                          <th className="px-2 py-2">Registrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSignups.map((signup) => (
                          <tr key={signup.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                            <td className="px-2 py-2.5 text-slate-300">{signup.email}</td>
                            <td className="px-2 py-2.5 capitalize text-slate-400">{signup.tier}</td>
                            <td className="px-2 py-2.5">
                              {signup.referredBy && <Gift className="h-3.5 w-3.5 text-violet-300" />}
                            </td>
                            <td className="px-2 py-2.5 text-slate-500">{new Date(signup.createdAt).toLocaleString('it-IT')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {analytics.toolUsageLast30Days.length > 0 && (
                <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="mb-4 text-sm font-semibold text-white">Utilizzo per strumento (ultimi 30 giorni)</p>
                  <div className="space-y-3">
                    {analytics.toolUsageLast30Days.map((t) => {
                      const max = analytics.toolUsageLast30Days[0]?.count || 1
                      const pct = Math.max(6, Math.round((t.count / max) * 100))
                      return (
                        <div key={t.tool}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-slate-300">{t.tool}</span>
                            <span className="text-slate-500">
                              {t.count} usi · {t.creditsUsed} crediti
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section id="strumenti" className="scroll-mt-24">
          <SectionHeader
            icon={Sliders}
            title="Strumenti disponibili al pubblico"
            description="Tutto parte spento durante il pre-lancio. Accendi ogni voce quando è pronta per utenti reali — l'effetto è immediato, nessun deploy necessario."
            badge={`${enabledCount}/${flags.length} attivi`}
          />
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

        <section id="comunicazioni" className="scroll-mt-24">
          <SectionHeader icon={Megaphone} title="Comunicazioni" description="Annunci sul sito, su Discord e correzioni manuali del saldo crediti." />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Terminal className="h-4 w-4 text-cyan-300" /> Annuncio sul sito
              </div>
              <AnnouncementComposer />
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Megaphone className="h-4 w-4 text-indigo-300" /> Annuncio su Discord
              </div>
              <DiscordAnnouncementComposer />
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Wallet className="h-4 w-4 text-amber-300" /> Rettifica crediti utente
              </div>
              <CreditAdjuster />
            </div>
          </div>
        </section>

        <section id="lista-attesa" className="scroll-mt-24">
          <SectionHeader
            icon={Mail}
            title="Lista d'attesa"
            description='Chi si è iscritto dal form "avvisami al lancio" sulle pagine Coming Soon.'
            action={<ExportWaitlistButton />}
          />
          {!waitlist ? (
            <ErrorNote message={'error' in waitlistResult ? waitlistResult.error : 'Errore nel caricamento'} />
          ) : (
            <>
              <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Mail} label="Iscritti totali" value={waitlist.total} accent="cyan" />
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
                        <tr key={signup.email} className="border-b border-white/5 last:border-0 hover:bg-white/5">
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

        <section id="console" className="scroll-mt-24">
          <SectionHeader
            icon={Activity}
            title="Console"
            description="Eventi ed errori reali del server (webhook, elaborazione documenti) — aggiornata ogni 5 secondi."
          />
          <ConsoleLog />
        </section>

        <section id="log-attivita" className="scroll-mt-24">
          <SectionHeader
            icon={Activity}
            title="Log attività"
            description="Registro reale degli eventi (tabella usage_events) — non è l'output stdout del server, che questo stack non persiste da nessuna parte."
          />
          {'error' in activityResult ? (
            <ErrorNote message={activityResult.error} />
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
                    <tr key={event.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
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

function SectionHeader({
  icon: Icon,
  title,
  description,
  badge,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  badge?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {badge && (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                {badge}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 max-w-2xl text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function ErrorNote({ message }: { message: string }) {
  return <p className="text-sm text-red-300">{message}</p>
}

// Trend a 14 giorni — serie singola, sequential (un solo hue): niente
// legenda necessaria, il titolo la identifica già (vedi color-formula.md).
function SignupsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Nuovi iscritti (14gg)</p>
        <p className="text-xs text-slate-500">{total} totali</p>
      </div>
      <div className="flex h-28 gap-1.5">
        {data.map((d) => {
          const heightPct = Math.max(4, Math.round((d.count / max) * 100))
          const label = new Date(d.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
          return (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-6 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover:opacity-100">
                {d.count}
              </span>
              <div
                className="w-full rounded-t-sm transition-opacity duration-150 ease-out group-hover:opacity-80"
                style={{ height: `${heightPct}%`, backgroundColor: SEQUENTIAL_BLUE.bar, minHeight: '3px' }}
                title={`${label}: ${d.count}`}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-600">
        <span>{new Date(data[0]?.date ?? Date.now()).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</span>
        <span>{new Date(data[data.length - 1]?.date ?? Date.now()).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</span>
      </div>
    </div>
  )
}

// Ordinal, non categorico: Free/Pro/Team è un ordine (come le taglie S/M/L),
// quindi un solo hue con luminosità crescente invece di 3 colori distinti —
// vedi color-formula.md "Categorical or ordinal?".
function TierChart({ usersByTier }: { usersByTier: { free: number; pro: number; team: number } }) {
  const rows = [
    { label: 'Free', value: usersByTier.free, color: SEQUENTIAL_BLUE.dark },
    { label: 'Pro', value: usersByTier.pro, color: SEQUENTIAL_BLUE.mid },
    { label: 'Team', value: usersByTier.team, color: SEQUENTIAL_BLUE.light },
  ]
  const max = Math.max(1, ...rows.map((r) => r.value))

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <p className="mb-4 text-sm font-semibold text-white">Utenti per piano</p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-10 flex-shrink-0 text-xs text-slate-400">{r.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(4, Math.round((r.value / max) * 100))}%`, backgroundColor: r.color }}
              />
            </div>
            <span className="w-8 flex-shrink-0 text-right text-xs text-slate-400">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ACCENTS = {
  cyan: 'text-cyan-300',
  emerald: 'text-emerald-300',
  violet: 'text-violet-300',
  amber: 'text-amber-300',
} as const

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon?: LucideIcon
  label: string
  value: number
  accent?: keyof typeof ACCENTS
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 transition-colors duration-150 ease-out hover:border-white/20">
      {Icon && (
        <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ${accent ? ACCENTS[accent] : 'text-cyan-300'}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <p className="text-2xl font-semibold text-white">{value.toLocaleString('it-IT')}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}
