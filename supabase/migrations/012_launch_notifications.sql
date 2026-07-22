-- Raccolta email dalla pagina Coming Soon ("avvisami al lancio"): una sola
-- lista globale, non una per tool, con "source" solo a scopo di analisi
-- (quale pagina ha generato l'iscrizione). Email unica: chi si iscrive da
-- più pagine resta un solo contatto, non genera righe duplicate.

CREATE TABLE IF NOT EXISTS launch_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launch_notifications_created_at ON launch_notifications(created_at);

ALTER TABLE launch_notifications ENABLE ROW LEVEL SECURITY;

-- Nessuna policy pubblica di SELECT/INSERT: la scrittura passa dal
-- service-role client in app/actions/waitlist.ts (form pubblico ma
-- validato lato server), la lettura è solo per l'admin in app/actions/admin.ts
-- — stesso pattern di feature_flags.
