import Link from 'next/link'
import { Mail, Sparkles, ShieldCheck, Layers, ArrowRight, Code2 } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { CONTACT_EMAIL } from '@/lib/seo'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Chi siamo</p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Una suite di strumenti AI pensata per il lavoro di ogni giorno
          </h1>
          <p className="mb-6 text-lg text-slate-300">
            AI Toolbox nasce per risolvere un problema semplice: usare l'intelligenza artificiale nel lavoro quotidiano
            oggi significa districarsi tra decine di strumenti diversi, ognuno con il proprio abbonamento, la propria
            interfaccia e la propria curva di apprendimento. Abbiamo riunito tredici strumenti — chat sui PDF,
            scrittura, codice, immagini, dati, contratti, traduzioni e altro — in un'unica piattaforma, con un solo
            sistema di crediti e un'interfaccia pensata per chi lavora in italiano.
          </p>
          <p className="mb-12 text-lg text-slate-300">
            Siamo un progetto giovane, ancora in fase di lancio: alcuni strumenti sono già disponibili, altri stanno
            per arrivare. Preferiamo essere onesti su cosa funziona già oggi piuttosto che promettere più di quanto
            possiamo mantenere.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <InfoCard
              icon={Layers}
              title="Tutto in un posto"
              description="Un abbonamento invece di cinque o sei strumenti AI separati."
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '90ms' }}>
            <InfoCard
              icon={ShieldCheck}
              title="Trasparenza"
              description="Crediti chiari, nessun costo nascosto, nessuna promessa che non possiamo mantenere."
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <InfoCard
              icon={Sparkles}
              title="Made for italiano"
              description="Interfaccia e contenuti pensati per chi lavora in italiano, non tradotti all'ultimo momento."
            />
          </div>
        </div>

        <div className="animate-fade-in-up mb-12 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-black/20" style={{ animationDelay: '140ms' }}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
            <Code2 className="h-6 w-6" />
          </div>
          <h2 className="mb-3 text-2xl font-semibold text-white">Chi c'è dietro</h2>
          <p className="text-slate-300">
            AI Toolbox è progettato, sviluppato e mantenuto da un solo founder tecnico: frontend, backend, integrazioni
            AI e infrastruttura sono tutti farina del suo sacco, compreso il bot Discord di supporto che gira a
            fianco della piattaforma. Il progetto è nato da un bisogno personale — chattare con i PDF per lavoro e
            studio invece di riaprirli in continuazione — ed è cresciuto strumento dopo strumento da lì, con ogni
            funzionalità guidata dall'uso reale della piattaforma, non da ricerche di mercato.
          </p>
        </div>

        <div className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-black/20" style={{ animationDelay: '160ms' }}>
          <h2 className="mb-3 text-2xl font-semibold text-white">Contatti</h2>
          <p className="mb-6 text-slate-300">
            Domande, segnalazioni, idee o proposte di collaborazione: scrivici, rispondiamo davvero.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-[transform,background-color] duration-150 ease-out-strong hover:from-cyan-400 hover:to-violet-400 active:scale-[0.97]"
          >
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="mt-12 text-center">
          <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200">
            Scopri tutti gli strumenti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof Layers; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-200 ease-out-strong hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  )
}
