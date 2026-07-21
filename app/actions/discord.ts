'use server'

// Web-side half of the Discord account link (bot side: bot/src/services/accountLink.ts,
// bot/src/commands/link.ts). link_codes/discord_accounts have RLS enabled with NO
// policies (see supabase/migrations/009_discord_bot.sql) — deny-by-default for every role
// including the logged-in user's own session, so these actions go through the service
// client throughout. The user's identity itself still comes from the real session
// (getCurrentUser()), never from client input, so a user can only ever generate a code or
// unlink their own account.

import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from '@/app/actions/auth'
import { randomInt } from 'node:crypto'

const CODE_LENGTH = 8
// Excludes visually ambiguous characters (0/O, 1/I/L) so a code read off a screen doesn't
// get mistyped into Discord.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_TTL_MS = 10 * 60 * 1000

function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  }
  return code
}

export async function generateDiscordLinkCode(): Promise<{ code: string; expiresAt: string } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const supabase = createServiceClient()

  // Clear any previous unredeemed code for this user first — otherwise stale codes pile
  // up in the table every time someone regenerates without linking.
  await supabase.from('link_codes').delete().eq('user_id', user.id)

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString()

  const { error } = await supabase.from('link_codes').insert({ code, user_id: user.id, expires_at: expiresAt })
  if (error) return { error: 'Could not generate a code. Please try again.' }

  return { code, expiresAt }
}

export async function getDiscordLinkStatus(): Promise<{ linked: boolean; linkedAt?: string } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const supabase = createServiceClient()
  const { data } = await supabase.from('discord_accounts').select('linked_at').eq('user_id', user.id).single()

  if (!data) return { linked: false }
  return { linked: true, linkedAt: (data as { linked_at: string }).linked_at }
}

export async function unlinkDiscordAccount(): Promise<{ success: true } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not signed in.' }

  const supabase = createServiceClient()
  const { error } = await supabase.from('discord_accounts').delete().eq('user_id', user.id)
  if (error) return { error: 'Could not disconnect. Please try again.' }

  return { success: true }
}
