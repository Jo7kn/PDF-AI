// lib/seo.ts
//
// Fonte unica per l'URL pubblico del sito, usato da metadataBase, sitemap,
// robots.txt e i JSON-LD. Imposta NEXT_PUBLIC_SITE_URL nelle env (locali e
// su Vercel) con il dominio reale non appena disponibile: finché resta sul
// fallback, Google Search Console e i tag canonical punteranno al posto
// sbagliato.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.neuropdf.it').replace(/\/+$/, '')

export const SITE_NAME = 'AI Toolbox'

export const CONTACT_EMAIL = 'info@neuropdf.it'

export const DEFAULT_DESCRIPTION =
  'Suite di strumenti AI in italiano: chatta con i tuoi PDF, scrivi articoli ed email, genera codice e immagini, analizza contratti e dati, traduci documenti. Inizia gratis.'

// BreadcrumbList JSON-LD: aiuta Google (rich snippet con il percorso invece
// del solo URL) e i motori "answer" (GEO/AEO) a capire dove una pagina si
// trova nella gerarchia del sito. `items` è la lista Home -> ... -> pagina
// corrente; position è 1-based per spec schema.org.
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
