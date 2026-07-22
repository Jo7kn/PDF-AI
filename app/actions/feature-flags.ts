// app/actions/feature-flags.ts
//
// Lettura pubblica dei feature flag per la UI (badge "Disponibile" sulle
// tool card): a differenza di app/actions/admin.ts non richiede is_admin,
// la tabella feature_flags ha già una policy RLS di SELECT pubblica.

'use server'

import { getAllFeatureFlags, type FeatureFlag } from '@/lib/feature-flags'

export async function getPublicFeatureFlags(): Promise<FeatureFlag[]> {
  return getAllFeatureFlags()
}
