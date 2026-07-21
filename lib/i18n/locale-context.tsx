'use client'

// lib/i18n/locale-context.tsx
//
// Contesto React per la lingua selezionata dall'utente. Persistita in
// localStorage (nessuna route/URL per lingua: si applica solo alla UI
// condivisa già tradotta, vedi translations.ts). t() fa fallback a una
// stringa vuota se la chiave non esiste, e all'italiano se manca solo
// la traduzione in quella lingua.

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALES, TRANSLATIONS, type Locale } from './translations'

const STORAGE_KEY = 'ai-toolbox-locale'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (path: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function getNested(obj: any, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj)
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value
  return value.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))
}

// Variante non-hook di t(), usabile fuori dal render (es. dentro un
// .filter()/.map() su una lista, dove gli hook non sono ammessi).
export function translate(locale: Locale, path: string, params?: Record<string, string | number>): string {
  const value = getNested(TRANSLATIONS[locale], path) ?? getNested(TRANSLATIONS[DEFAULT_LOCALE], path)
  if (typeof value !== 'string') return path
  return interpolate(value, params)
}

export function translateList(locale: Locale, path: string): string[] {
  const value = getNested(TRANSLATIONS[locale], path) ?? getNested(TRANSLATIONS[DEFAULT_LOCALE], path)
  return Array.isArray(value) ? value : []
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  const t = useMemo(() => {
    return (path: string, params?: Record<string, string | number>): string => {
      const value = getNested(TRANSLATIONS[locale], path) ?? getNested(TRANSLATIONS[DEFAULT_LOCALE], path)
      if (typeof value !== 'string') return path
      return interpolate(value, params)
    }
  }, [locale])

  const contextValue = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale deve essere usato dentro <LocaleProvider>')
  return ctx
}

// Variante per liste tradotte (es. tool.features): restituisce un array
// invece di una stringa singola.
export function useTranslatedList(path: string): string[] {
  const { locale } = useLocale()
  const value = getNested(TRANSLATIONS[locale], path) ?? getNested(TRANSLATIONS[DEFAULT_LOCALE], path)
  return Array.isArray(value) ? value : []
}
