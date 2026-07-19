import Link from 'next/link'
import { ChevronDown, FileText, HelpCircle, Sparkles, ShieldCheck } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/#features', label: 'Funzionalità' },
  { href: '/#pricing', label: 'Prezzi' },
  { href: '/#support', label: 'Supporto' },
]

export function AuthHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 shadow-lg shadow-fuchsia-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">PDF AI</p>
            <p className="text-xs text-slate-400">Trasforma documenti in conversazioni</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-white sm:inline-flex"
          >
            Accedi
          </Link>
          <Link
            href="/signup"
            className="hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 sm:inline-flex"
          >
            Registrati
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-white">
              MR
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-white">Mario Rossi</p>
              <p className="text-xs text-slate-400">Pro</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
