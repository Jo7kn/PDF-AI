-- Sistema inviti: 5 amici registrati + email confermata = Pro gratis 30 giorni
-- (vedi app/actions/referrals.ts). referral_pro_expires_at distingue il Pro
-- da reward (revocabile automaticamente) dal Pro pagato via Stripe
-- (stripe_subscription_id valorizzato, mai toccato da questo sistema).

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_pro_granted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_pro_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Backfill: gli utenti esistenti non hanno mai passato da ensureUserProfile()
-- con la generazione del codice (aggiunta in questa stessa release), quindi
-- partirebbero con referral_code NULL per sempre altrimenti.
UPDATE users SET referral_code = substr(md5(random()::text || id::text), 1, 8)
WHERE referral_code IS NULL;

-- Estende il trigger di 013_lock_privileged_user_columns.sql: senza questo,
-- un utente potrebbe azzerare referral_pro_granted_at dal browser e far
-- ri-scattare il grant in getReferralStatus() ottenendo Pro gratis a
-- ripetizione senza nuovi inviti, oppure riassegnarsi referred_by per
-- gonfiare il conteggio di un altro account.
CREATE OR REPLACE FUNCTION prevent_privileged_self_update()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'authenticated' AND (
    NEW.is_admin IS DISTINCT FROM OLD.is_admin OR
    NEW.tier IS DISTINCT FROM OLD.tier OR
    NEW.credits IS DISTINCT FROM OLD.credits OR
    NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
    NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id OR
    NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR
    NEW.total_pages_used IS DISTINCT FROM OLD.total_pages_used OR
    NEW.referred_by IS DISTINCT FROM OLD.referred_by OR
    NEW.referral_pro_granted_at IS DISTINCT FROM OLD.referral_pro_granted_at OR
    NEW.referral_pro_expires_at IS DISTINCT FROM OLD.referral_pro_expires_at
  ) THEN
    RAISE EXCEPTION 'Non è consentito modificare questo campo direttamente.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
