-- Log applicativi reali (errori/eventi server), non gli usage_events di
-- getActivityLog (quelli sono azioni utente). Vedi lib/logger.ts. Nessuna
-- policy RLS pubblica: solo il service client (admin actions) legge/scrive,
-- stesso pattern di feature_flags.

CREATE TABLE IF NOT EXISTS app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);

ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;
