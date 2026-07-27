'use client'

// components/admin/feature-flag-toggle.tsx
//
// Switch ottimistico: aggiorna subito la UI, poi chiama il server e torna
// indietro se la scrittura fallisce (es. sessione admin scaduta a metà).

import { useState, useTransition } from 'react'
import { toggleFeatureFlag } from '@/app/actions/admin'
import type { FeatureFlag } from '@/lib/feature-flags'

export function FeatureFlagToggle({ flag }: { flag: FeatureFlag }) {
  const [enabled, setEnabled] = useState(flag.enabled)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const next = !enabled
    setEnabled(next)
    startTransition(async () => {
      const result = await toggleFeatureFlag(flag.slug, next)
      if (result && 'error' in result) setEnabled(!next)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 ease-out active:scale-[0.99] disabled:opacity-60 ${
        enabled ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-white/[0.08] bg-white/[0.03]'
      }`}
    >
      <span className="text-sm font-medium text-white">{flag.label}</span>
      <span
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-150 ease-out ${
          enabled ? 'bg-emerald-500' : 'bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150 ease-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}
