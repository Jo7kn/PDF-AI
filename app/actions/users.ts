'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { User } from '@/lib/types'
import { DEFAULT_TIER } from '@/lib/constants'

// ATTENZIONE: la creazione "canonica" del profilo utente avviene in
// app/actions/auth.ts -> ensureUserProfile(), chiamata da signUp/signIn,
// che usa auth.users.id come id della riga in "users". Questo createUser()
// prima accettava solo l'email e lasciava che il DB generasse un id
// proprio: se mai richiamata, la riga risultante NON avrebbe combaciato con
// auth.uid(), rompendo silenziosamente tutte le query/RLS basate su quel
// join altrove nell'app (documents.user_id, le policy, ecc.).
// L'ho corretta per richiedere esplicitamente l'id di auth. Se questa
// funzione non è più usata da nessuna parte (probabile, vista l'esistenza
// di ensureUserProfile), valuta di rimuoverla per evitare che qualcuno la
// richiami per sbaglio in futuro.
export async function createUser(id: string, email: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        email,
        tier: DEFAULT_TIER,
        total_pages_used: 0,
        active_projects: 0,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    return { error: 'Failed to create user' }
  }
}

export async function getUser(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    return { error: 'Failed to fetch user' }
  }
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true, user: data }
  } catch (error) {
    return { error: 'Failed to update user' }
  }
}

export async function getUserByEmail(email: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    return { error: 'Failed to fetch user' }
  }
}