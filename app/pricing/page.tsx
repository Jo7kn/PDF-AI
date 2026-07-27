import { ArrowRight } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { PricingSection } from '@/components/pricing-section'
import { ScrollReveal } from '@/components/scroll-reveal'
import { CtaLink } from '@/components/ui/cta-link'
import { SpotlightCard } from '@/components/ui/spotlight-card'

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
    <main className="min-h-screen bg-[#050506] text-white">
      <LandingHeader />

      <section className="animate-fade-in-up mx-auto max-w-4xl px-4 pt-20 pb-4 text-center sm:px-6 lg:px-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">Prezzi</p>
        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Un piano di crediti, tutta la suite AI
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-neutral-400">
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
              <SpotlightCard className="p-6">
                <p className="mb-2 font-semibold text-white">{faq.q}</p>
                <p className="text-neutral-400">{faq.a}</p>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-float absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[100px]" />
          </div>
          <h2 className="mb-4 text-3xl font-semibold text-white">Pronto a iniziare?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-400">
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
