-- Estende cartelle/tag/preferiti a tutti i tool AI, non solo PDF AI.
-- documents/document_tags restano intatte (pipeline PDF-specifica); questa
-- tabella e' generica per i risultati testuali/immagine degli altri tool.
-- folders e tags (gia' esistenti, solo user_id+name) diventano condivise.

CREATE TABLE IF NOT EXISTS saved_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tool VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image')),
  metadata JSONB,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_folder_id ON saved_items(folder_id);

CREATE TABLE IF NOT EXISTS saved_item_tags (
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (saved_item_id, tag_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_item_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_items_select_own" ON saved_items;
DROP POLICY IF EXISTS "saved_items_insert_own" ON saved_items;
DROP POLICY IF EXISTS "saved_items_update_own" ON saved_items;
DROP POLICY IF EXISTS "saved_items_delete_own" ON saved_items;

CREATE POLICY "saved_items_select_own" ON saved_items
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "saved_items_insert_own" ON saved_items
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_items_update_own" ON saved_items
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "saved_items_delete_own" ON saved_items
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "saved_item_tags_select_via_item" ON saved_item_tags;
DROP POLICY IF EXISTS "saved_item_tags_insert_via_item" ON saved_item_tags;
DROP POLICY IF EXISTS "saved_item_tags_delete_via_item" ON saved_item_tags;

CREATE POLICY "saved_item_tags_select_via_item" ON saved_item_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM saved_items s WHERE s.id = saved_item_tags.saved_item_id AND s.user_id = auth.uid())
  );
CREATE POLICY "saved_item_tags_insert_via_item" ON saved_item_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM saved_items s WHERE s.id = saved_item_tags.saved_item_id AND s.user_id = auth.uid())
  );
CREATE POLICY "saved_item_tags_delete_via_item" ON saved_item_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM saved_items s WHERE s.id = saved_item_tags.saved_item_id AND s.user_id = auth.uid())
  );
