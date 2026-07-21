import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { MotionConfig } from "framer-motion"
import { LocaleProvider } from "@/lib/i18n/locale-context"
import { RouteProgress } from "@/components/route-progress"
// @ts-ignore
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "PDF AI - Intelligent Document Analysis",
  description: "Upload and analyze your PDF documents with AI-powered insights",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
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
