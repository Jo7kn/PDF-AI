-- Ruolo admin (impostabile solo da Supabase, es. SQL editor o table editor:
-- UPDATE users SET is_admin = true WHERE email = '...') e interruttori di
-- funzionalità che l'admin può accendere/spegnere dalla pagina /admin senza
-- bisogno di un redeploy. Sostituisce il flag statico lib/launch.ts: le
-- pagine gated ora leggono lo stato reale da qui (vedi lib/feature-flags.ts).

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS feature_flags (
  slug VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tutto disattivato di default (fase pre-lancio): l'admin li accende dalla
-- pagina /admin man mano che ogni parte è pronta per utenti reali.
INSERT INTO feature_flags (slug, label, enabled) VALUES
  ('pdf-ai', 'PDF AI (workspace, chat sui documenti)', false),
  ('payments', 'Pagamenti (checkout, upgrade piano)', false),
  ('ai-writer', 'AI Writer', false),
  ('code-ai', 'Code AI', false),
  ('image-ai', 'Image AI', false),
  ('data-ai', 'Data AI', false),
  ('study-ai', 'Study AI', false),
  ('translator-ai', 'Translator AI', false),
  ('email-ai', 'Email AI', false),
  ('contract-ai', 'Contract AI', false),
  ('file-converter', 'File Converter', false),
  ('chat-ai', 'Chat AI', false)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Lettura pubblica: ogni pagina gated deve poter controllare il proprio
-- flag per un visitatore qualsiasi, non solo per l'admin.
CREATE POLICY "feature_flags_select_all" ON feature_flags
  FOR SELECT USING (true);

-- Nessuna policy INSERT/UPDATE: le scritture passano solo dal service-role
-- client (app/actions/admin.ts), che verifica users.is_admin lato server
-- prima di ogni modifica — stesso pattern di lib/credits.ts.
