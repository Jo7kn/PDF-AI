import Link from 'next/link'
import { PRICING_TIERS } from '@/lib/pricing'
import { AI_TOOLS } from '@/lib/tools'
import { FileText, Sparkles, Zap, Users, Mail, BarChart3, Calendar, Check, ArrowRight, ShieldCheck, BrainCircuit } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              <BrainCircuit className="h-4 w-4" />
              AI-powered document intelligence
            </div>

            <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
              Trasforma i tuoi PDF in una
              <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> conversazione intelligente</span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Carica documenti, estrai contenuti chiave, scopri scadenze e interagisci con l’AI in pochi secondi.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-7 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90">
                Inizia gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 font-semibold text-slate-200 transition-colors duration-150 ease-out hover:bg-white/10">
                Vedi i prezzi
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Sicurezza e accesso rapido
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Sparkles className="h-4 w-4 text-fuchsia-300" />
                Risposte AI precise
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-sm font-medium text-cyan-300">Esempio di workflow</p>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                  1. Carichi il PDF in pochi secondi.
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                  2. L’AI estrai contenuti, date e punti chiave.
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                  3. Puoi fare domande e continuare la conversazione.
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Archiviazione organizzata',
                'Analisi documenti avanzata',
                'Supporto rapido',
                'Esperienza fluida',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Funzionalità</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Tutto quello che serve per lavorare meglio con i PDF</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Parsing intelligente"
            description="Estrai testo, struttura e contenuti importanti da ogni PDF in modo rapido e affidabile."
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8" />}
            title="Rilevamento scadenze"
            description="Individua automaticamente date, milestone e informazioni critiche nei documenti."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Chat con l’AI"
            description="Fai domande naturali sui tuoi documenti e ricevi risposte immediate e pertinenti."
          />
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">AI Toolbox</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Tutti gli strumenti AI in un unico posto</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Oltre alla chat sui PDF, AI Toolbox include scrittura, codice, immagini, email, contratti, dati e traduzioni.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.filter((tool) => tool.status === 'available').map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href}
              className="group rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition-colors duration-150 ease-out hover:bg-white/10"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white`}>
                <tool.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{tool.name}</h3>
              <p className="text-sm text-slate-400">{tool.tagline}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200">
            Esplora tutti gli strumenti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">Prezzi</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Piani semplici e trasparenti</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} featured={index === 1} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-semibold text-white">Pronto a iniziare?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            Entra nella tua workspace e fai partire la tua prima analisi con l’AI.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90">
            Inizia la prova gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/10 backdrop-blur-xl transition-colors duration-150 ease-out hover:bg-white/10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function PricingCard({ tier, featured }: { tier: any; featured: boolean }) {
  return (
    <div className={`relative rounded-3xl border p-8 shadow-lg shadow-black/10 backdrop-blur-xl transition-colors duration-150 ease-out hover:bg-white/10 ${featured ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-white/10 bg-slate-900/70'}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1 text-sm font-semibold text-white">
          Più popolare
        </div>
      )}

      <h3 className="mb-2 text-2xl font-semibold text-white">{tier.name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">€{tier.price}</span>
        <span className="text-slate-400">/mese</span>
      </div>

      <ul className="mb-8 space-y-4">
        {tier.features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-slate-300">
            <Check className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/dashboard" className={`block w-full rounded-2xl py-3 text-center font-semibold transition-colors duration-150 ease-out ${featured ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'}`}>
        Scegli piano
      </Link>
    </div>
  )
}
