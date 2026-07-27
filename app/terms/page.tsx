'use client'

import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/seo'
import { useLocale } from '@/lib/i18n/locale-context'
import { LOCALE_DATE_TAG } from '@/lib/i18n/translations'

const LAST_UPDATED = new Date('2026-07-23')
const DOMAIN = `${SITE_NAME.toLowerCase().replace(/\s+/g, '')}.it`

// Parser inline minimale per il testo tradotto: **grassetto** e [testo](url)
// (interno se inizia con "/", altrimenti link esterno/mailto). Evita di
// spezzare le frasi legali in frammenti pre/post per ogni lingua — ogni
// paragrafo resta una frase completa e naturale da tradurre.
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      parts.push(
        <strong key={key++} className="text-white">
          {match[1]}
        </strong>,
      )
    } else {
      const label = match[2]
      const href = match[3]
      const linkClass = 'text-brand underline underline-offset-2 hover:text-[#7A85E5]'
      parts.push(
        href.startsWith('/') ? (
          <Link key={key++} href={href} className={linkClass}>
            {label}
          </Link>
        ) : (
          <a key={key++} href={href} className={linkClass}>
            {label}
          </a>
        ),
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export default function TermsPage() {
  const { t, locale } = useLocale()

  const p = (key: string) => t(key, { siteName: SITE_NAME, domain: DOMAIN, contactEmail: CONTACT_EMAIL })
  const lastUpdatedFormatted = LAST_UPDATED.toLocaleDateString(LOCALE_DATE_TAG[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-[#050506] text-white">
      <LandingHeader />

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand">{t('terms.eyebrow')}</p>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('terms.title')}</h1>
          <p className="mb-12 text-sm text-slate-500">{t('terms.lastUpdated', { date: lastUpdatedFormatted })}</p>
        </div>

        <div className="animate-fade-in-up space-y-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:text-slate-300 [&_p]:leading-relaxed [&_li]:text-slate-300 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          <section>
            <h2>{t('terms.s1Title')}</h2>
            <p>{renderInline(p('terms.s1Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s2Title')}</h2>
            <p>{renderInline(p('terms.s2Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s3Title')}</h2>
            <p>{renderInline(p('terms.s3Body1'))}</p>
            <p>{renderInline(p('terms.s3Body2'))}</p>
          </section>

          <section>
            <h2>{t('terms.s4Title')}</h2>
            <p>{renderInline(p('terms.s4Intro'))}</p>
            <ul>
              <li>{renderInline(p('terms.s4Item1'))}</li>
              <li>{renderInline(p('terms.s4Item2'))}</li>
              <li>{renderInline(p('terms.s4Item3'))}</li>
              <li>{renderInline(p('terms.s4Item4'))}</li>
              <li>{renderInline(p('terms.s4Item5'))}</li>
            </ul>
            <p>{renderInline(p('terms.s4Outro'))}</p>
          </section>

          <section>
            <h2>{t('terms.s5Title')}</h2>
            <p>{renderInline(p('terms.s5Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s6Title')}</h2>
            <p>{renderInline(p('terms.s6Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s7Title')}</h2>
            <p>{renderInline(p('terms.s7Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s8Title')}</h2>
            <p>{renderInline(p('terms.s8Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s9Title')}</h2>
            <p>{renderInline(p('terms.s9Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s10Title')}</h2>
            <p>{renderInline(p('terms.s10Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s11Title')}</h2>
            <p>{renderInline(p('terms.s11Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s12Title')}</h2>
            <p>{renderInline(p('terms.s12Body'))}</p>
          </section>

          <section>
            <h2>{t('terms.s13Title')}</h2>
            <p>{renderInline(p('terms.s13Body'))}</p>
          </section>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
