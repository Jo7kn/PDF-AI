// lib/feature-flags.ts
//
// Stato reale (da Supabase) di cosa è acceso/spento durante la fase
// pre-lancio. L'admin accende/spegne ogni voce dalla pagina /admin senza
// bisogno di un redeploy. Se il DB non risponde, il default è "spento" —
// meglio mostrare Coming Soon per errore che esporre per errore una
// funzionalità non pronta.

import { createServiceClient } from '@/lib/supabase/service'

export const FEATURE_FLAG_SLUGS = [
  'pdf-ai',
  'payments',
  'ai-writer',
  'code-ai',
  'image-ai',
  'data-ai',
  'study-ai',
  'translator-ai',
  'email-ai',
  'contract-ai',
  'file-converter',
  'chat-ai',
] as const

export type FeatureFlagSlug = (typeof FEATURE_FLAG_SLUGS)[number]

export interface FeatureFlag {
  slug: FeatureFlagSlug
  label: string
  enabled: boolean
  updatedAt: string | null
}

export async function isFeatureEnabled(slug: FeatureFlagSlug): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('feature_flags').select('enabled').eq('slug', slug).single()
    if (error || !data) return false
    return Boolean(data.enabled)
  } catch {
    return false
  }
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('feature_flags')
      .select('slug, label, enabled, updated_at')
      .order('slug', { ascending: true })
    if (error || !data) return []
    return data.map((row) => ({
      slug: row.slug as FeatureFlagSlug,
      label: row.label,
      enabled: Boolean(row.enabled),
      updatedAt: row.updated_at,
    }))
  } catch {
    return []
  }
}
