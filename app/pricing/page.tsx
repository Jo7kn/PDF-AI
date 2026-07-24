import { ArrowRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { PricingSection } from '@/components/pricing-section'
import { ScrollReveal } from '@/components/scroll-reveal'
import { CtaLink } from '@/components/ui/cta-link'

const faqs = [
  {
    q: 'Cosa sono i crediti AI Toolbox?',
    a: "L'unità di consumo per usare gli strumenti AI: ogni piano include un numero di crediti mensili.",
  },
  {
    q: 'Cosa succede se finisco i crediti?',
    a: 'Puoi aspettare il rinnovo mensile o passare a un piano superiore per averne subito di più.',
  },
  {
    q: 'Posso disdire in qualsiasi momento?',
    a: "Sì, puoi annullare l'abbonamento Pro o Team quando vuoi, senza vincoli.",
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      <section className="animate-fade-in-up mx-auto max-w-4xl px-4 pt-20 pb-4 text-center sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-300">Prezzi</p>
        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Un piano di crediti, tutta la suite AI
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          Nessun costo nascosto, nessun rinnovo forzato: scegli Free, Pro o Team e usa i crediti su tutti gli
          strumenti di AI Toolbox — dalla chat sui PDF alla generazione di immagini e codice.
        </p>
      </section>

      <PricingSection />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="mb-8 text-center text-2xl font-semibold text-white">Domande frequenti sui prezzi</h2>
        </ScrollReveal>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.q} delay={i * 0.05}>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
                <p className="mb-2 font-semibold text-white">{faq.q}</p>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-semibold text-white">Pronto a iniziare?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            Attiva il piano Free con 50 crediti al mese, senza carta di credito.
          </p>
          <CtaLink href="/dashboard" size="lg" className="px-8 py-4">
            Inizia gratis
            <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </ScrollReveal>
      </section>

      <LandingFooter />
    </main>
  )
}
