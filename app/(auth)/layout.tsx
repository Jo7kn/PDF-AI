import type { Metadata } from 'next'
import { AuthHeader } from '@/components/auth-header'
import { AuthPromoPanel } from '@/components/auth-promo-panel'

// Pagine di login/registrazione: nessun valore come risultato di ricerca
// (contenuto duplicato tra loro), ma i link interni restano seguibili.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <AuthHeader />
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block">
            <AuthPromoPanel />
          </div>
          <div className="w-full max-w-xl justify-self-center">{children}</div>
        </div>
      </div>
    </div>
  )
}