// app/actions/usage.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

export interface UsageEvent {
  id: string
  tool: string
  action: string | null
  credits_cost: number
  created_at: string
}

export async function getUsageHistory(
  limit = 50
): Promise<{ success: true; events: UsageEvent[] } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('usage_events')
    .select('id, tool, action, credits_cost, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message }
  return { success: true, events: (data || []) as UsageEvent[] }
}
