// lib/i18n/translations.ts
//
// Metadati delle lingue supportate + caricamento pigro dei dizionari.
// Ogni dizionario (it/en/es/de/zh/fr) vive nel proprio modulo sotto
// ./locales: solo l'italiano (lingua di default, serve anche al primo
// render server-side) e' incluso nel bundle iniziale. Le altre 5 lingue
// (~110KB di stringhe in totale) si caricano via import() solo quando
// l'utente le seleziona davvero, invece di spedirle a ogni visitatore.
// getLoadedDict() ritorna undefined finche' il dizionario non e' pronto:
// i chiamanti (locale-context.tsx) gia' ricadono sull'italiano in quel
// caso, quindi non serve alcuno stato di loading esplicito qui.

import itTranslations from './locales/it'
import type { TranslationDict } from './locales/it'

export const LOCALES = ['it', 'en', 'es', 'de', 'zh', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  it: { name: 'Italiano', flag: '🇮🇹' },
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  zh: { name: '中文', flag: '🇨🇳' },
  fr: { name: 'Français', flag: '🇫🇷' },
}

export const DEFAULT_LOCALE: Locale = 'it'

// Tag BCP-47 per Date.prototype.toLocaleDateString/toLocaleTimeString.
// Senza questa mappa, new Date().toLocaleDateString() usa il locale del
// browser invece della lingua scelta nell'app: la UI cambia lingua ma le
// date restano formattate diversamente, un'incoerenza visibile.
export const LOCALE_DATE_TAG: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
  zh: 'zh-CN',
  fr: 'fr-FR',
}

export type { TranslationDict }
export { itTranslations }

const loaders: Record<Exclude<Locale, 'it'>, () => Promise<{ default: TranslationDict }>> = {
  en: () => import('./locales/en'),
  es: () => import('./locales/es'),
  de: () => import('./locales/de'),
  zh: () => import('./locales/zh'),
  fr: () => import('./locales/fr'),
}

const cache: Partial<Record<Locale, TranslationDict>> = { it: itTranslations }

export function getLoadedDict(locale: Locale): TranslationDict | undefined {
  return cache[locale]
}

export function loadDict(locale: Locale): Promise<TranslationDict> {
  const cached = cache[locale]
  if (cached) return Promise.resolve(cached)
  return loaders[locale as Exclude<Locale, 'it'>]().then((mod) => {
    cache[locale] = mod.default
    return mod.default
  })
}
