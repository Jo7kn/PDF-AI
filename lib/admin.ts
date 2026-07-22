// lib/admin.ts
//
// Il ruolo admin si imposta SOLO da Supabase (SQL editor o table editor:
// UPDATE users SET is_admin = true WHERE email = '...'), non c'è UI per
// promuovere un utente — evita che un bug nell'app possa auto-promuoversi
// admin. Questo file legge quel campo, non lo scrive mai.

import { createClient } from '@/lib/supabase/server'

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (error || !data) return false
  return Boolean(data.is_admin)
}
