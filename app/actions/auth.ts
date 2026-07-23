'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { buildAuthRedirectUrl, getOAuthOptions } from '@/lib/auth/oauth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DEFAULT_STARTING_CREDITS } from '@/lib/credits'
import { generateReferralCode } from '@/lib/referrals'

// Esportata (era privata) così documents.ts può riusarla invece di
// duplicare la stessa logica di upsert.
export async function ensureUserProfile(supabase: any, user: any) {
  if (!user?.id || !user?.email) {
    return
  }

  // IMPORTANTE: ignoreDuplicates fa sì che questo sia un INSERT-se-manca,
  // non un UPDATE. Senza questa opzione, ogni signIn sovrascriveva
  // total_pages_used e active_projects con 0, azzerando silenziosamente
  // la quota reale dell'utente ad ogni login.
  await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email,
      tier: 'free',
      total_pages_used: 0,
      active_projects: 0,
      credits: DEFAULT_STARTING_CREDITS,
      referral_code: generateReferralCode(),
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )
}

export async function signUp(email: string, password: string, fullName: string, refCode?: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await ensureUserProfile(supabase, data.user)

    // Service client: bypassa RLS (serve leggere il referral_code di un
    // altro utente) e non dipende da una sessione già stabilita, che a
    // questo punto potrebbe non esserci ancora se la conferma email è
    // richiesta. .is('referred_by', null) rende la scrittura idempotente e
    // impedisce di sovrascrivere un referral già attribuito in precedenza.
    if (refCode) {
      const service = createServiceClient()
      const { data: referrer } = await service.from('users').select('id').eq('referral_code', refCode.trim().toUpperCase()).single()
      if (referrer && referrer.id !== data.user.id) {
        await service.from('users').update({ referred_by: referrer.id }).eq('id', data.user.id).is('referred_by', null)
      }
    }
  }

  // data.session è null quando il progetto Supabase richiede la conferma
  // email (Authentication -> Providers -> Email -> "Confirm email"): il
  // signup è riuscito ma l'utente non è ancora loggato. Il chiamante deve
  // mandarlo a inserire il codice invece che alla dashboard, dove il
  // middleware lo rimbalzerebbe subito al login senza spiegazioni.
  return { success: true, user: data.user, needsVerification: !data.session }
}

// Codice a 8 cifre inviato via email da Supabase (richiede che il template
// "Confirm signup" in Authentication -> Email Templates includa {{ .Token }}
// — di default mostra solo un link, non un codice).
export async function verifyEmailCode(email: string, code: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
  if (error) return { error: error.message }
  if (!data.user) return { error: 'Verifica riuscita ma nessun utente restituito' }

  await ensureUserProfile(supabase, data.user)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function resendVerificationCode(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Unable to sign in' }
  }

  await ensureUserProfile(supabase, data.user)

  revalidatePath('/dashboard')
  return { success: true, user: data.user }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: getOAuthOptions(process.env.NEXT_PUBLIC_APP_URL),
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const redirectTo = buildAuthRedirectUrl(process.env.NEXT_PUBLIC_APP_URL, '/auth/update-password')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

/**
 * Profilo "leggero" per la UI: email + tier reali, invece dei placeholder
 * hardcoded ("Mario Rossi" / "Pro") che c'erano nell'header della
 * dashboard. Usato anche per costruire i link di checkout Stripe (serve
 * sapere il piano attuale per non mostrare "Passa a Pro" a chi è già Pro).
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('tier, subscription_status, total_pages_used, active_projects, credits')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    tier: data?.tier || 'free',
    subscriptionStatus: data?.subscription_status || null,
    totalPagesUsed: data?.total_pages_used || 0,
    activeProjects: data?.active_projects || 0,
    credits: data?.credits ?? 0,
  }
}