-- Sistema crediti generico, condiviso da tutti i tool AI della piattaforma
-- (sostituisce il concetto "solo pagine PDF" con un contatore trasversale).
-- Costo in crediti flat per azione, definito in lib/credits.ts — non
-- basato sui token reali: i client NVIDIA esistenti (lib/nvidia/*.ts)
-- restituiscono solo il risultato testuale, non i metadati di utilizzo.

ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 50;

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tool VARCHAR(50) NOT NULL,
  action VARCHAR(50),
  credits_cost INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  lemonsqueezy_subscription_id VARCHAR(100),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Sola lettura per l'utente sulle proprie righe. Le scritture (deduzione
-- crediti, log utilizzo, aggiornamento subscription) passano SEMPRE dal
-- service-role client (lib/ai-router.ts, webhook LemonSqueezy) — mai
-- dal client user-scoped — quindi non serve nessuna policy INSERT/UPDATE.
CREATE POLICY "usage_events_select_own" ON usage_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Deduzione atomica: UPDATE...WHERE credits >= amount in un'unica
-- operazione, cosi' due richieste concorrenti dello stesso utente non
-- possono entrambe leggere lo stesso saldo e scalarlo separatamente
-- (race condition classica del pattern read-then-write). SECURITY DEFINER
-- perche' viene chiamata dal service-role client (lib/credits.ts), mai
-- direttamente dal client utente.
CREATE OR REPLACE FUNCTION deduct_user_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE users
  SET credits = credits - p_amount
  WHERE id = p_user_id AND credits >= p_amount;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
