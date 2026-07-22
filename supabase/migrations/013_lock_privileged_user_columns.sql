-- CRITICO — applicare subito. La policy "users_update_own" (migration 005) usa
-- FOR UPDATE USING (id = auth.uid()) senza WITH CHECK: RLS è per riga, non per
-- colonna, quindi consente a QUALSIASI utente autenticato di aggiornare TUTTE le
-- colonne della propria riga — incluse is_admin, tier, credits,
-- subscription_status, stripe_customer_id, stripe_subscription_id — con una
-- semplice chiamata dal client Supabase nel browser (anon key + sessione,
-- niente bisogno di bypassare l'app). Con i pagamenti ora live, questo è un
-- percorso diretto per auto-promuoversi ad admin e/o tier team con crediti
-- illimitati senza pagare.
--
-- Fix: un trigger BEFORE UPDATE che blocca la modifica delle colonne
-- privilegiate a meno che la scrittura non arrivi dal service-role client
-- (che bypassa RLS/trigger per via del ruolo, non di questo controllo — qui
-- serve solo bloccare il path client-side). auth.role() è 'authenticated' per
-- il client anon-key+sessione usato dal browser; il service-role client usato
-- da app/actions/admin.ts, webhook Stripe, ecc. gira come ruolo 'service_role'
-- e in Postgres i trigger non si applicano al superuser/service role in questo
-- contesto Supabase-gestito, ma per sicurezza il controllo è comunque scritto
-- per lasciar passare qualunque ruolo diverso da 'authenticated'.

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
    NEW.total_pages_used IS DISTINCT FROM OLD.total_pages_used
  ) THEN
    RAISE EXCEPTION 'Non è consentito modificare questo campo direttamente.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_privileged_self_update ON users;
CREATE TRIGGER trg_prevent_privileged_self_update
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_privileged_self_update();
