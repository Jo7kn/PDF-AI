-- Completely disable RLS for demo mode
-- This is NOT recommended for production

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
