-- Ripristina Row Level Security, disabilitata dalla migration
-- 003_disable_rls_for_demo.sql. Le policy qui sotto rispecchiano ESATTAMENTE
-- i controlli già applicati a livello applicativo (vedi lib/document-access.ts
-- e app/actions/{documents,folders,tags,sharing,messages}.ts), quindi non
-- cambiano alcun comportamento per gli utenti: sono difesa in profondità
-- contro accessi diretti a PostgREST con la anon key pubblica, che oggi
-- bypasserebbero completamente l'app.
--
-- Le tabelle folders/tags/document_tags/document_shares esistono già in
-- produzione ma non erano tracciate in nessuna migration precedente: le
-- includiamo qui per colmare il drift.
--
-- Idempotente: ogni CREATE POLICY è preceduta da un DROP POLICY IF EXISTS,
-- quindi lo script si può rilanciare in sicurezza anche dopo un tentativo
-- precedente parziale/fallito.

-- ============================================================
-- users
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for demo" ON users;
DROP POLICY IF EXISTS "Allow all" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- ensureUserProfile() fa un upsert col client user-scoped al primo login:
-- serve poter inserire la propria riga.
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());
-- Nessuna policy DELETE: gli utenti non cancellano la propria riga dalla UI.
-- Scritture "di sistema" (quota, tier via webhook) passano dal service-role
-- client, che bypassa RLS come già avviene oggi.

-- ============================================================
-- documents
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for demo" ON documents;
DROP POLICY IF EXISTS "Allow all" ON documents;
DROP POLICY IF EXISTS "Documents can be viewed by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be inserted by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be updated by owner" ON documents;
DROP POLICY IF EXISTS "Documents can be deleted by owner" ON documents;
DROP POLICY IF EXISTS "documents_select_own" ON documents;
DROP POLICY IF EXISTS "documents_insert_own" ON documents;
DROP POLICY IF EXISTS "documents_update_own" ON documents;
DROP POLICY IF EXISTS "documents_delete_own" ON documents;

-- getDocuments/updateDocument/toggleFavorite (documents.ts) filtrano sempre
-- esplicitamente per user_id = proprietario: il client user-scoped non
-- tenta mai di leggere un documento altrui. L'accesso ai documenti
-- condivisi passa SOLO dal service-role client (resolveDocumentAccess),
-- quindi qui basta la policy owner-only.
CREATE POLICY "documents_select_own" ON documents
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "documents_update_own" ON documents
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "documents_delete_own" ON documents
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- messages (letti/scritti solo via service-role nell'app, con
-- autorizzazione applicativa in resolveDocumentAccess; qui replichiamo la
-- stessa logica come rete di sicurezza per accessi diretti con anon key)
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON messages;
DROP POLICY IF EXISTS "Messages can be viewed by document owner" ON messages;
DROP POLICY IF EXISTS "Messages can be inserted by document owner" ON messages;
DROP POLICY IF EXISTS "messages_select_via_document" ON messages;
DROP POLICY IF EXISTS "messages_insert_via_document" ON messages;

CREATE POLICY "messages_select_via_document" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = messages.document_id
        AND (
          d.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM document_shares s
            WHERE s.document_id = d.id AND s.shared_with_user_id = auth.uid()
          )
        )
    )
  );
CREATE POLICY "messages_insert_via_document" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = messages.document_id
        AND (
          d.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM document_shares s
            WHERE s.document_id = d.id AND s.shared_with_user_id = auth.uid() AND s.permission = 'chat'
          )
        )
    )
  );

-- ============================================================
-- document_shares (letti/scritti solo via service-role nell'app; policy
-- di rete di sicurezza)
-- ============================================================
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON document_shares;
DROP POLICY IF EXISTS "document_shares_select_owner_or_recipient" ON document_shares;
DROP POLICY IF EXISTS "document_shares_insert_owner" ON document_shares;
DROP POLICY IF EXISTS "document_shares_delete_owner" ON document_shares;

CREATE POLICY "document_shares_select_owner_or_recipient" ON document_shares
  FOR SELECT USING (owner_id = auth.uid() OR shared_with_user_id = auth.uid());
CREATE POLICY "document_shares_insert_owner" ON document_shares
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "document_shares_delete_owner" ON document_shares
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- folders (folders.ts usa SEMPRE il client user-scoped)
-- ============================================================
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON folders;
DROP POLICY IF EXISTS "folders_select_own" ON folders;
DROP POLICY IF EXISTS "folders_insert_own" ON folders;
DROP POLICY IF EXISTS "folders_update_own" ON folders;
DROP POLICY IF EXISTS "folders_delete_own" ON folders;

CREATE POLICY "folders_select_own" ON folders
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "folders_insert_own" ON folders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "folders_update_own" ON folders
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "folders_delete_own" ON folders
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- tags (tags.ts usa SEMPRE il client user-scoped)
-- ============================================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON tags;
DROP POLICY IF EXISTS "tags_select_own" ON tags;
DROP POLICY IF EXISTS "tags_insert_own" ON tags;
DROP POLICY IF EXISTS "tags_delete_own" ON tags;

CREATE POLICY "tags_select_own" ON tags
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "tags_insert_own" ON tags
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "tags_delete_own" ON tags
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- document_tags (nessuna colonna user_id propria: l'appartenenza passa
-- dal documento collegato, stesso schema logico di "messages")
-- ============================================================
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON document_tags;
DROP POLICY IF EXISTS "document_tags_select_via_document" ON document_tags;
DROP POLICY IF EXISTS "document_tags_insert_via_document" ON document_tags;
DROP POLICY IF EXISTS "document_tags_delete_via_document" ON document_tags;

CREATE POLICY "document_tags_select_via_document" ON document_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
  );
CREATE POLICY "document_tags_insert_via_document" ON document_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
  );
CREATE POLICY "document_tags_delete_via_document" ON document_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid())
  );

-- ============================================================
-- storage: bucket "documents", path convention "<user_id>/<timestamp>.<ext>"
-- (vedi app/actions/documents.ts: fileName = `${user.id}/${Date.now()}...`)
-- ============================================================
DROP POLICY IF EXISTS "Enable all storage access for demo" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow all on storage.objects" ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_select_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_documents_delete_own" ON storage.objects;

CREATE POLICY "storage_documents_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "storage_documents_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "storage_documents_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
  );
-- NB: se il bucket "documents" è PUBLIC, la lettura via publicUrl
-- (getPublicUrl, usata dall'app per mostrare/scaricare i PDF) bypassa
-- comunque questa policy SELECT per definizione di bucket pubblico. Se
-- invece l'hai reso privato nel dashboard Storage, la policy SELECT sopra
-- copre SOLO l'owner autenticato: chi visualizza un documento CONDIVISO
-- (via document_shares) non ha ancora una policy per scaricare il file
-- altrui, e getPublicUrl smetterebbe di funzionare per tutti. Se hai reso
-- il bucket privato, dimmelo esplicitamente: serve una policy aggiuntiva
-- per lo storage basata su document_shares, che non ho ancora scritto.
