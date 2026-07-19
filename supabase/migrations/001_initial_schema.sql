-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier VARCHAR(50) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team')),
  total_pages_used INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  summary TEXT,
  deadlines_json JSONB,
  total_pages INTEGER DEFAULT 0,
  parsed_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_document_id ON messages(document_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - in production, add proper auth policies)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Documents can be viewed by owner" ON documents FOR SELECT USING (true);
CREATE POLICY "Documents can be inserted by owner" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Documents can be updated by owner" ON documents FOR UPDATE USING (true);
CREATE POLICY "Documents can be deleted by owner" ON documents FOR DELETE USING (true);

CREATE POLICY "Messages can be viewed by document owner" ON messages FOR SELECT USING (true);
CREATE POLICY "Messages can be inserted by document owner" ON messages FOR INSERT WITH CHECK (true);
