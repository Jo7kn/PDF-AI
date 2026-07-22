// app/actions/referrals.ts
//
// Programma inviti: 5 amici registrati + email confermata = Pro gratis per
// REFERRAL_REWARD_DAYS. Grant/revoca sono lazy — controllati ad ogni
// getReferralStatus(), non da un cron — vedi ponytail nella funzione sotto.

'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentUser } from './auth'
import { PLAN_CREDITS, setUserCredits } from '@/lib/credits'
import { REFERRAL_TARGET, REFERRAL_REWARD_DAYS, generateReferralCode } from '@/lib/referrals'

export interface ReferralStatus {
  code: string
  referredCount: number
  confirmedCount: number
  target: number
  rewardActive: boolean
  rewardExpiresAt: string | null
}

export async function getReferralStatus(): Promise<{ data: ReferralStatus } | { error: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = createServiceClient()

  const { data: me, error: meError } = await supabase
    .from('users')
    .select('referral_code, tier, referral_pro_granted_at, referral_pro_expires_at, stripe_subscription_id')
    .eq('id', user.id)
    .single()
  if (meError || !me) return { error: 'Utente non trovato' }

  let code = me.referral_code
  if (!code) {
    code = generateReferralCode()
    await supabase.from('users').update({ referral_code: code }).eq('id', user.id)
  }

  const { data: referred } = await supabase.from('users').select('id').eq('referred_by', user.id)
  const referredIds = (referred || []).map((r) => r.id)

  // ponytail: un lookup admin per invitato — accettabile alla scala del
  // programma (target 5). Con conteggi molto più alti servirebbe uno
  // specchio di email_confirmed_at su public.users invece di N chiamate.
  let confirmedCount = 0
  for (const id of referredIds) {
    const { data: authUser } = await supabase.auth.admin.getUserById(id)
    if (authUser?.user?.email_confirmed_at) confirmedCount++
  }

  let rewardActive = me.tier === 'pro' && !!me.referral_pro_expires_at && new Date(me.referral_pro_expires_at) > new Date()
  let rewardExpiresAt: string | null = me.referral_pro_expires_at

  if (!me.referral_pro_granted_at && confirmedCount >= REFERRAL_TARGET) {
    const expiresAt = new Date(Date.now() + REFERRAL_REWARD_DAYS * 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('users')
      .update({ tier: 'pro', referral_pro_granted_at: new Date().toISOString(), referral_pro_expires_at: expiresAt })
      .eq('id', user.id)
    await setUserCredits(user.id, PLAN_CREDITS.pro)
    rewardActive = true
    rewardExpiresAt = expiresAt
  } else if (me.tier === 'pro' && me.referral_pro_expires_at && new Date(me.referral_pro_expires_at) <= new Date() && !me.stripe_subscription_id) {
    // Scaduto e non è un abbonamento Stripe reale (quello non tocca mai
    // queste colonne) — torna a free.
    await supabase.from('users').update({ tier: 'free' }).eq('id', user.id)
    await setUserCredits(user.id, PLAN_CREDITS.free)
    rewardActive = false
  }

  return {
    data: {
      code,
      referredCount: referredIds.length,
      confirmedCount,
      target: REFERRAL_TARGET,
      rewardActive,
      rewardExpiresAt,
    },
  }
}
