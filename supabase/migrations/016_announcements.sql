-- Annunci mostrati nel riquadro "console" sulla landing page. Scritti da
-- /admin (vedi app/actions/announcements.ts), letti pubblicamente lato
-- server (service-role client, nessuna sessione utente sulla landing) —
-- stesso pattern di lettura di feature_flags/launch_notifications: nessuna
-- policy pubblica di SELECT/INSERT, entrambe le direzioni passano dal
-- service-role client dietro un server action.

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(256),
  message TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
