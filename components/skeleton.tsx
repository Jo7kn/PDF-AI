// components/skeleton.tsx
//
// Placeholder di caricamento generico: un blocco con sweep shimmer invece di
// un rettangolo statico. Sostituisce gli spinner centrati nelle sezioni
// dashboard dove il contenuto finale ha una forma nota (card, righe di
// lista, statistiche) — lo skeleton anticipa quella forma invece di un
// semplice "sto caricando" generico, riducendo il layout shift percepito.

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

// Skeleton di una riga stile DocumentCard/SavedItemCard/HistoryRow: icona +
// due righe di testo + area azioni, per non far "saltare" il layout quando
// il contenuto reale arriva.
export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 ${className}`}>
      <Skeleton className="h-12 w-12 flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-8 w-20 flex-shrink-0" />
    </div>
  )
}

// Skeleton per una tile statistica (icona + valore grande + etichetta).
export function SkeletonStat({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-black/20 p-5 ${className}`}>
      <Skeleton className="mb-3 h-10 w-10" />
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}
