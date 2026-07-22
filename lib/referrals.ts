// lib/referrals.ts
//
// Costanti condivise tra ensureUserProfile (genera il codice) e
// app/actions/referrals.ts (legge/applica il reward).

export const REFERRAL_TARGET = 5
export const REFERRAL_REWARD_DAYS = 30

// ponytail: 8 char base36, nessun retry su collisione — a questo volume
// (referral_code è UNIQUE) la probabilità è trascurabile; se mai dovesse
// scontrarsi, l'insert fallisce e ensureUserProfile la ignora comunque
// (ignoreDuplicates), quindi l'utente riparte senza codice fino al prossimo
// login che ne genera uno nuovo in getReferralStatus.
export function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}
