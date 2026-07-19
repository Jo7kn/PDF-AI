-- Fix RLS policies for demo/development mode
-- This allows inserts without authentication for testing

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Documents can be viewed by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be inserted by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be updated by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be deleted by owner" ON documents;

DROP POLICY IF EXISTS "Messages can be viewed by document owner" ON messages;
DROP POLICY IF EXISTS "Messages can be inserted by document owner" ON messages;

-- Create permissive policies for demo mode
CREATE POLICY "Enable all access for demo" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for demo" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for demo" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Make user_id nullable for demo mode (allows documents without user association)
ALTER TABLE documents ALTER COLUMN user_id DROP NOT NULL;

-- Create a default demo user
INSERT INTO users (id, email, tier, total_pages_used, active_projects)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  'free',
  0,
  0
) ON CONFLICT (email) DO NOTHING;
