import Link from 'next/link'
import { Mail, Sparkles, ShieldCheck, Layers, ArrowRight, Code2 } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { CONTACT_EMAIL } from '@/lib/seo'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050506] text-white">
      <LandingHeader />

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">Chi siamo</p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Una suite di strumenti AI pensata per il lavoro di ogni giorno
          </h1>
          <p className="mb-6 text-lg text-neutral-400">
            AI Toolbox nasce per risolvere un problema semplice: usare l'intelligenza artificiale nel lavoro quotidiano
            oggi significa districarsi tra decine di strumenti diversi, ognuno con il proprio abbonamento, la propria
            interfaccia e la propria curva di apprendimento. Abbiamo riunito tredici strumenti — chat sui PDF,
            scrittura, codice, immagini, dati, contratti, traduzioni e altro — in un'unica piattaforma, con un solo
            sistema di crediti e un'interfaccia pensata per chi lavora in italiano.
          </p>
          <p className="mb-12 text-lg text-neutral-400">
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

        <div className="animate-fade-in-up mb-12" style={{ animationDelay: '140ms' }}>
          <SpotlightCard className="p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Code2 className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">Chi c'è dietro</h2>
            <p className="text-neutral-400">
              AI Toolbox è progettato, sviluppato e mantenuto da un solo founder tecnico: frontend, backend, integrazioni
              AI e infrastruttura sono tutti farina del suo sacco, compreso il bot Discord di supporto che gira a
              fianco della piattaforma. Il progetto è nato da un bisogno personale — chattare con i PDF per lavoro e
              studio invece di riaprirli in continuazione — ed è cresciuto strumento dopo strumento da lì, con ogni
              funzionalità guidata dall'uso reale della piattaforma, non da ricerche di mercato.
            </p>
          </SpotlightCard>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <SpotlightCard className="p-8">
            <h2 className="mb-3 text-2xl font-semibold text-white">Contatti</h2>
            <p className="mb-6 text-neutral-400">
              Domande, segnalazioni, idee o proposte di collaborazione: scrivici, rispondiamo davvero.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-medium text-white shadow-[0_0_0_1px_rgba(94,106,210,0.4),0_8px_24px_-8px_rgba(94,106,210,0.6)] transition-[transform,background-color] duration-200 ease-spring hover:bg-[#6D79E0] active:scale-[0.97]"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </SpotlightCard>
        </div>

        <div className="mt-12 text-center">
          <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-medium text-brand hover:text-[#7A85E5]">
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
    <SpotlightCard className="p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 font-semibold text-white">{title}</h3>
      <p className="text-sm text-neutral-400">{description}</p>
    </SpotlightCard>
  )
}
