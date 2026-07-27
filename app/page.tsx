'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AI_TOOLS } from '@/lib/tools'
import { FileText, Terminal, Calendar, ArrowRight, Check, MessageSquare } from 'lucide-react'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { PricingSection } from '@/components/pricing-section'
import { ScrollReveal } from '@/components/scroll-reveal'
import { AnnouncementConsole } from '@/components/announcement-console'
import { DemoVideoCard } from '@/components/demo-video-card'
import { CtaLink } from '@/components/ui/cta-link'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { AuthErrorBanner } from '@/components/auth-error-banner'
import { SITE_URL, SITE_NAME } from '@/lib/seo'
import { useLocale, useTranslatedList } from '@/lib/i18n/locale-context'

// Canvas WebGL: niente window/GL lato server, ssr:false obbligatorio.
const ThreeHeroBackground = dynamic(
  () => import('@/components/three-hero-background').then((m) => m.ThreeHeroBackground),
  { ssr: false },
)

// Fallback CSS dietro il canvas 3D: colma il momento prima che WebGL monti
// e i bordi della scena dove il blob non copre — mai un buco nero vuoto.
function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-brand/15 blur-[120px]" />
      <div className="animate-float absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[120px]" style={{ animationDelay: '4s' }} />
    </div>
  )
}

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
    <main className="min-h-screen bg-[#050506] text-white">
      <LandingHeader />

      <Suspense fallback={null}>
        <AuthErrorBanner />
      </Suspense>

      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <ThreeHeroBackground />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="animate-fade-in-up max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-sm text-neutral-300">
                <Terminal className="h-3.5 w-3.5 text-brand" />
                AI-powered document intelligence
              </div>

              <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
                {t('landing.hero.titleBefore')}
                <span className="text-brand"> {t('landing.hero.titleHighlight')}</span>
              </h1>

              <p className="mb-8 max-w-2xl text-lg text-neutral-400 sm:text-xl">{t('landing.hero.subtitle')}</p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <CtaLink href="/dashboard" size="lg">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </CtaLink>
                <CtaLink href="#pricing" variant="secondary" size="lg">
                  {t('landing.hero.ctaSecondary')}
                </CtaLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                {checkmarks.map((item) => (
                  <div key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 flex-shrink-0 text-brand" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center gap-1.5 border-b border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="ml-2 font-mono text-xs text-neutral-500">{t('landing.hero.workflowLabel')}</span>
              </div>
              <div className="space-y-3 p-4">
                {workflowSteps.map((step) => (
                  <div key={step} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 font-mono text-sm text-neutral-300">
                    {step}
                  </div>
                ))}
              </div>
              <div className="grid gap-3 border-t border-white/[0.08] p-4 sm:grid-cols-2">
                {statPills.map((item) => (
                  <div key={item} className="rounded-xl border border-white/[0.06] bg-black/20 p-3 text-sm text-neutral-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <AnnouncementConsole className="w-full" />
        <DemoVideoCard className="w-full" />
      </div>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">{t('landing.features.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.features.heading')}</h2>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-3">
          <ScrollReveal delay={0}>
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title={t('landing.features.parsingTitle')}
              description={t('landing.features.parsingDescription')}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title={t('landing.features.deadlinesTitle')}
              description={t('landing.features.deadlinesDescription')}
            />
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title={t('landing.features.chatTitle')}
              description={t('landing.features.chatDescription')}
            />
          </ScrollReveal>
        </div>
      </section>

      <section id="perche" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">{t('landing.faq.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.faq.heading')}</h2>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2">
          <ScrollReveal delay={0}>
            <SpotlightCard className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q1Question')}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{t('landing.faq.q1Answer')}</p>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.06}>
            <SpotlightCard className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q2Question')}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{t('landing.faq.q2Answer')}</p>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <SpotlightCard className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q3Question')}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{t('landing.faq.q3Answer')}</p>
            </SpotlightCard>
          </ScrollReveal>
          <ScrollReveal delay={0.18}>
            <SpotlightCard className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-white">{t('landing.faq.q4Question')}</h3>
              <p className="text-sm leading-relaxed text-neutral-400">{t('landing.faq.q4Answer')}</p>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </section>

      <section id="tools" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">{t('landing.tools.eyebrow')}</p>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{t('landing.tools.heading')}</h2>
          <p className="mt-3 max-w-2xl text-neutral-400">{t('landing.tools.subheading')}</p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.filter((tool) => tool.status === 'available').map((tool, i) => (
            <ScrollReveal key={tool.slug} delay={Math.min(i, 5) * 0.04}>
              <Link href={tool.href} className="block active:scale-[0.98]">
                <SpotlightCard className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{tool.name}</h3>
                  <p className="text-sm text-neutral-500">{tool.tagline}</p>
                </SpotlightCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/tools" className="inline-flex items-center justify-center gap-2 font-medium text-brand hover:text-[#7A85E5]">
            {t('landing.tools.exploreAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PricingSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <ScrollReveal className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-float absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[100px]" />
          </div>
          <h2 className="mb-4 text-3xl font-semibold text-white">{t('landing.cta.heading')}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-400">{t('landing.cta.subheading')}</p>
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
    <SpotlightCard className="h-full p-8">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </SpotlightCard>
  )
}

