'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { AI_TOOLS } from '@/lib/tools'
import { FileText, Sparkles, Calendar, ArrowRight, Check, BrainCircuit } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { PricingSection } from '@/components/pricing-section'
import { ScrollReveal } from '@/components/scroll-reveal'
import { AnnouncementConsole } from '@/components/announcement-console'
import { DemoVideoCard } from '@/components/demo-video-card'
import { CtaLink } from '@/components/ui/cta-link'
import { AuthErrorBanner } from '@/components/auth-error-banner'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'

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

function HomeContent() {
  const { t } = useLocale()
  const workflowSteps = useTranslatedList('landing.hero.workflowSteps')
  const statPills = useTranslatedList('landing.hero.statPills')
  const checkmarks = [
    t('landing.hero.toolsCount', { count: AI_TOOLS.filter((tool) => tool.status === 'available').length }),
    t('landing.hero.freeForever'),
    t('landing.hero.noCard'),
  ]

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
      <script
        type="application/ld+json"
        // Stesse 4 domande/risposte della sezione "Come funziona" in pagina —
        // il markup deve rispecchiare contenuto realmente visibile, non testo
        // inventato solo per lo schema.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Cosa succede quando carico un PDF?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    "Il documento viene analizzato in pochi secondi. Se contiene testo selezionabile lo estraiamo direttamente, altrimenti usiamo l'OCR per leggere anche PDF scansionati o immagini. Da lì puoi fare domande in linguaggio naturale, chiedere un riassunto o farti segnalare scadenze e date importanti nel testo.",
                },
              },
              {
                '@type': 'Question',
                name: 'Come funzionano i crediti tra i vari strumenti?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    "Un solo pool di crediti condiviso da tutti gli strumenti della piattaforma. Il piano Free include 50 crediti al mese, Pro 1000, Team 3000. Si usano dove servono, senza dover scegliere in anticipo quale abbonamento attivare per quale strumento.",
                },
              },
              {
                '@type': 'Question',
                name: 'I miei documenti sono al sicuro?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    "Sì. L'accesso ai file è protetto da autenticazione e regole di accesso a livello di riga sul database. Nessun altro utente può leggerli. I documenti restano dell'utente, eliminabili in qualsiasi momento dalla dashboard.",
                },
              },
              {
                '@type': 'Question',
                name: 'Tutti gli strumenti sono già disponibili?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'La maggior parte sì — chat sui PDF, scrittura, codice, immagini, dati, contratti, email, traduzioni e conversione file sono attivi oggi. Alcuni strumenti sono ancora in arrivo.',
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        // Stessi 3 step del workflow mostrato nella hero card (t('landing.hero.workflowSteps'))
        // — testo IT hardcoded qui perché lo schema deve restare stabile
        // indipendentemente dalla lingua visualizzata dall'utente.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Come chattare con un PDF su AI Toolbox',
            step: [
              { '@type': 'HowToStep', position: 1, name: 'Carica il PDF', text: 'Carichi il PDF in pochi secondi.' },
              { '@type': 'HowToStep', position: 2, name: 'Estrazione automatica', text: "L'AI estrae contenuti, date e punti chiave." },
              { '@type': 'HowToStep', position: 3, name: 'Fai domande', text: 'Puoi fare domande e continuare la conversazione.' },
            ],
          }),
        }}
      />
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      <Suspense fallback={null}>
        <AuthErrorBanner />
      </Suspense>

      <section className="relative overflow-hidden">
        {/* Glow dietro al titolo — stesso trattamento della hero card
            (cyan/violet), solo più diffuso. pointer-events-none così non
            interferisce con click/selezione del testo sopra. pulse-slow
            (scale+opacity, mai posizione) fa "respirare" lo sfondo senza
            causare reflow. */}
        <div className="animate-pulse-slow pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-br from-cyan-500/25 via-violet-500/20 to-transparent blur-3xl" />

        {/* Orb come sfondo (non più elemento a sé): due anelli che ruotano
            in direzioni opposte, centrati dietro tutto l'hero, molto
            attenuati — si vede come texture ambientale, non come oggetto
            in primo piano. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-40">
          <div className="animate-spin-slow absolute inset-0 rounded-full border border-cyan-400/20 [border-top-color:transparent] [border-right-color:transparent]" />
          <div className="animate-spin-slow-reverse absolute inset-16 rounded-full border border-violet-400/20 [border-bottom-color:transparent] [border-left-color:transparent]" />
        </div>

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
                {t('landing.hero.titleBefore')}
                <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> {t('landing.hero.titleHighlight')}</span>
              </h1>

              <p className="mb-8 max-w-2xl text-lg text-slate-300 sm:text-xl">{t('landing.hero.subtitle')}</p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <CtaLink href="/dashboard" size="lg">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </CtaLink>
                <CtaLink href="#pricing" variant="secondary" size="lg">
                  {t('landing.hero.ctaSecondary')}
                </CtaLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                {checkmarks.map((item) => (
                  <div key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl" style={{ animationDelay: '80ms' }}>
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-sm font-medium text-cyan-300">{t('landing.hero.workflowLabel')}</p>
                <div className="space-y-3">
                  {workflowSteps.map((step) => (
                    <div key={step} className="rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {statPills.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <AnnouncementConsole className="w-full" />
        <DemoVideoCard className="w-full" />
      </div>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{t('landing.features.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.features.heading')}</h2>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          <ScrollReveal delay={0}>
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title={t('landing.features.parsingTitle')}
              description={t('landing.features.parsingDescription')}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title={t('landing.features.deadlinesTitle')}
              description={t('landing.features.deadlinesDescription')}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title={t('landing.features.chatTitle')}
              description={t('landing.features.chatDescription')}
            />
          </ScrollReveal>
        </div>
      </section>

      <section id="perche" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{t('landing.faq.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.faq.heading')}</h2>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2">
          <ScrollReveal delay={0}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q1Question')}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t('landing.faq.q1Answer')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q2Question')}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t('landing.faq.q2Answer')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q3Question')}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t('landing.faq.q3Answer')}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.18}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/10 backdrop-blur-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q4Question')}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t('landing.faq.q4Answer')}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">{t('landing.tools.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.tools.heading')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">{t('landing.tools.subheading')}</p>
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
            {t('landing.tools.exploreAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PricingSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="rounded-3xl border border-white/10 bg-white/10 p-10 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          <h2 className="mb-4 text-3xl font-semibold text-white">{t('landing.cta.heading')}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">{t('landing.cta.subheading')}</p>
          <CtaLink href="/dashboard" size="lg" className="px-8 py-4">
            {t('landing.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </CtaLink>
        </ScrollReveal>
      </section>

      <LandingFooter />
    </main>
    </>
  )
}

export default function Home() {
  return <HomeContent />
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

