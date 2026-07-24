import Link from 'next/link'
import { AI_TOOLS } from '@/lib/tools'
import { FileText, Sparkles, Calendar, ArrowRight, Check, BrainCircuit, AlertTriangle } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { PricingSection } from '@/components/pricing-section'
import { ScrollReveal } from '@/components/scroll-reveal'
import { AnnouncementConsole } from '@/components/announcement-console'
import { DemoVideoCard } from '@/components/demo-video-card'
import { CtaLink } from '@/components/ui/cta-link'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

// Posizioni fisse (non random ad ogni render, altrimenti "saltano" ad ogni
// re-render di Home) per le stelline decorative dietro l'hero.
const STAR_POSITIONS = [
  { left: '8%', top: '15%', size: '3px', delay: '0s' },
  { left: '18%', top: '55%', size: '2px', delay: '0.6s' },
  { left: '28%', top: '20%', size: '2px', delay: '1.4s' },
  { left: '35%', top: '75%', size: '3px', delay: '0.3s' },
  { left: '12%', top: '85%', size: '2px', delay: '2s' },
  { left: '62%', top: '12%', size: '2px', delay: '1s' },
  { left: '72%', top: '60%', size: '3px', delay: '1.8s' },
  { left: '82%', top: '25%', size: '2px', delay: '0.8s' },
  { left: '90%', top: '70%', size: '2px', delay: '2.4s' },
  { left: '55%', top: '85%', size: '2px', delay: '1.2s' },
  { left: '45%', top: '10%', size: '3px', delay: '2.8s' },
  { left: '95%', top: '45%', size: '2px', delay: '0.4s' },
]

export default function Home({
  searchParams,
}: {
  searchParams: { error_code?: string; error?: string }
}) {
  // Su link email scaduti/gia' usati (reset password, conferma, magic link)
  // Supabase reindirizza al Site URL configurato (questa root) invece che
  // alla pagina custom richiesta via redirectTo, con l'errore in query string
  // — senza questo banner l'utente vedrebbe solo la home normale, senza
  // capire perche' e' finito qui invece che nel flusso che si aspettava.
  const linkExpired = searchParams.error_code === 'otp_expired'
  const authErrored = !linkExpired && searchParams.error === 'access_denied'

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD statico: nessun input utente, safe da iniettare così.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: SITE_NAME,
            url: `${SITE_URL}/`,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description:
              "Suite di strumenti AI in italiano: chat con i PDF, scrittura, codice, immagini, dati, contratti e traduzioni in un'unica piattaforma.",
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              lowPrice: '0',
              highPrice: '39',
              offerCount: '3',
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: `Piani ${SITE_NAME}`,
              itemListElement: [
                { '@type': 'Offer', price: '0', priceCurrency: 'EUR', description: 'Piano Free: 50 crediti al mese' },
                { '@type': 'Offer', price: '19', priceCurrency: 'EUR', description: 'Piano Pro: 1000 crediti al mese' },
                { '@type': 'Offer', price: '39', priceCurrency: 'EUR', description: 'Piano Team: 3000 crediti al mese' },
              ],
            },
          }),
        }}
      />
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      {(linkExpired || authErrored) && (
        <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>
              {linkExpired
                ? 'Il link che hai usato è scaduto o è già stato usato.'
                : 'Il link che hai usato non è più valido.'}{' '}
              <Link href="/forgotpass" className="font-semibold underline underline-offset-2 hover:text-amber-100">
                Richiedine uno nuovo
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden">
        {/* Glow dietro al titolo — stesso trattamento della hero card
            (cyan/violet), solo più diffuso. pointer-events-none così non
            interferisce con click/selezione del testo sopra. pulse-slow
            (scale+opacity, mai posizione) fa "respirare" lo sfondo senza
            causare reflow. */}
        <div className="animate-pulse-slow pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-transparent blur-3xl" />

        {/* Stelline sparse: opacità che pulsa con delay diversi per punto,
            mai in sincrono — altrimenti sembra un flash invece di un cielo
            stellato. Solo sopra lg: sotto lo spazio è troppo stretto e
            distrarrebbe dal testo. */}
        <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
          {STAR_POSITIONS.map((star, i) => (
            <span
              key={i}
              className="animate-twinkle absolute rounded-full bg-white"
              style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-fade-in-up max-w-3xl">
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
                <CtaLink href="/dashboard" size="lg">
                  Inizia gratis
                  <ArrowRight className="h-4 w-4" />
                </CtaLink>
                <CtaLink href="#pricing" variant="secondary" size="lg">
                  Vedi i prezzi
                </CtaLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                {['Piano gratuito per sempre', 'Nessuna carta richiesta', 'Crediti AI ogni mese'].map((item) => (
                  <div key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl" style={{ animationDelay: '80ms' }}>
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
        </div>

        {/* Orb centrale animato: due anelli concentrici che ruotano in
            direzioni opposte (mai la stessa velocità/verso, altrimenti
            sembrano fermi l'uno rispetto all'altro) attorno a un nucleo
            pulsante. Solo transform/opacity — nessun impatto su layout. */}
        <div className="relative flex flex-col items-center gap-6 border-y border-white/10 bg-white/[0.02] py-16">
          <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
            <div className="animate-spin-slow absolute inset-0 rounded-full border border-cyan-400/25 [border-top-color:transparent] [border-right-color:transparent]" />
            <div className="animate-spin-slow-reverse absolute inset-6 rounded-full border border-violet-400/25 [border-bottom-color:transparent] [border-left-color:transparent]" />
            <div className="animate-pulse-slow absolute inset-10 rounded-full bg-gradient-to-br from-cyan-500/40 via-violet-500/30 to-fuchsia-500/30 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-2xl shadow-cyan-500/40 sm:h-28 sm:w-28">
              <Sparkles className="h-10 w-10 text-white sm:h-12 sm:w-12" />
            </div>
          </div>
          <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
            {AI_TOOLS.filter((t) => t.status === 'available').length}+ strumenti AI, un solo abbonamento
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <AnnouncementConsole className="w-full" />
        <DemoVideoCard className="w-full" />
      </div>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Funzionalità</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Tutto quello che serve per lavorare meglio con i PDF</h2>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          <ScrollReveal delay={0}>
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Parsing intelligente"
              description="Estrai testo, struttura e contenuti importanti da ogni PDF in modo rapido e affidabile."
            />
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Rilevamento scadenze"
              description="Individua automaticamente date, milestone e informazioni critiche nei documenti."
            />
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Chat con l’AI"
              description="Fai domande naturali sui tuoi documenti e ricevi risposte immediate e pertinenti."
            />
          </ScrollReveal>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">AI Toolbox</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Tutti gli strumenti AI in un unico posto</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Oltre alla chat sui PDF, AI Toolbox include scrittura, codice, immagini, email, contratti, dati e traduzioni.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.filter((tool) => tool.status === 'available').map((tool, i) => (
            <ScrollReveal key={tool.slug} delay={Math.min(i, 5) * 0.04}>
              <Link
                href={tool.href}
                className="group block rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/10 backdrop-blur-xl transition-[background-color,box-shadow,border-color,transform] duration-200 ease-out-strong hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-500/10 active:scale-[0.97]"
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} text-white`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold text-white">{tool.name}</h3>
                <p className="text-sm text-slate-400">{tool.tagline}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-semibold text-cyan-300 hover:text-cyan-200">
            Esplora tutti gli strumenti
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PricingSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-semibold text-white">Pronto a iniziare?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
            Entra nella tua workspace e fai partire la tua prima analisi con l’AI.
          </p>
          <CtaLink href="/dashboard" size="lg" className="px-8 py-4">
            Inizia la prova gratuita
            <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </ScrollReveal>
      </section>

      <LandingFooter />
    </main>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/10 backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-200 ease-out hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/30">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

