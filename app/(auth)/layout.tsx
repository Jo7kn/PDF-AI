import { AuthHeader } from '@/components/auth-header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-white">
      <AuthHeader />
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Nuovo: AI per documenti PDF
              </div>
              <h1 className="mb-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Carica un PDF e scopri subito le risposte.
              </h1>
              <p className="mb-8 max-w-xl text-lg text-slate-300">
                Chatta con i tuoi documenti, estrai contenuti chiave e organizza il lavoro in pochi secondi.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  'Analisi rapida dei documenti',
                  'Risposte precise con AI',
                  'Archiviazione ordinata',
                  'Accesso sicuro e veloce',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full max-w-xl justify-self-center">{children}</div>
        </div>
      </div>
    </div>
  )
}