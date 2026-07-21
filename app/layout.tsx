import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { MotionConfig } from "framer-motion"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { RouteProgress } from "@/components/route-progress"
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo"
// @ts-ignore
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Chat PDF, Scrittura, Codice e Immagini con l'AI`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "AI Toolbox",
    "chat con PDF",
    "PDF AI",
    "assistente AI italiano",
    "scrittura AI",
    "generatore codice AI",
    "generatore immagini AI",
    "analisi contratti AI",
    "traduttore AI",
    "strumenti AI online",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Chat PDF, Scrittura, Codice e Immagini con l'AI`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Suite di strumenti AI`,
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          // JSON-LD statico: nessun input utente, safe da iniettare così.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: SITE_NAME,
                  description: DEFAULT_DESCRIPTION,
                  publisher: { "@id": `${SITE_URL}/#organization` },
                  inLanguage: "it-IT",
                },
              ],
            }),
          }}
        />
        {/* reducedMotion="user" applica prefers-reduced-motion a OGNI
            componente Framer Motion dell'app, automaticamente e in un solo
            punto — nessun componente deve gestirlo da solo. */}
        <MotionConfig reducedMotion="user">
          <LocaleProvider>
            <RouteProgress />
            {children}
          </LocaleProvider>
        </MotionConfig>
      </body>
    </html>
  )
}
