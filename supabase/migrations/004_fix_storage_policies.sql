-- Fix storage bucket policies for demo mode
-- Run this in Supabase SQL Editor

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;

-- Create permissive policy for storage
CREATE POLICY "Enable all storage access for demo" 
ON storage.objects 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Ensure bucket is public
-- You also need to do this manually in the Supabase dashboard:
-- 1. Go to Storage
-- 2. Click on the "documents" bucket
-- 3. Click "Edit bucket"
-- 4. Make sure "Public bucket" is checked
