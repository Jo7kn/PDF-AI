-- Primitivo "team/workspace": organizzazione + membri + inviti. Non ancora
-- collegato alla condivisione di documents/saved_items (fase successiva) --
-- qui c'e' solo l'anagrafica di chi appartiene a quale team e con che ruolo.

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  invited_email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspaces_select_member" ON workspaces;
DROP POLICY IF EXISTS "workspaces_insert_owner" ON workspaces;
DROP POLICY IF EXISTS "workspaces_update_owner" ON workspaces;
DROP POLICY IF EXISTS "workspaces_delete_owner" ON workspaces;

-- Un membro vede il workspace se compare in workspace_members (l'owner
-- viene inserito li' anche lui alla creazione, vedi app/actions/workspace.ts).
CREATE POLICY "workspaces_select_member" ON workspaces
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members m WHERE m.workspace_id = workspaces.id AND m.user_id = auth.uid())
  );
CREATE POLICY "workspaces_insert_owner" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update_owner" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete_owner" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspace_members_select_fellow_member" ON workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_owner_admin_or_self" ON workspace_members;

CREATE POLICY "workspace_members_select_fellow_member" ON workspace_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspace_members m WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid())
  );
-- INSERT solo via service-role (createWorkspace/acceptInvitation in
-- app/actions/workspace.ts) per poter validare ruolo/piano prima di scrivere.
CREATE POLICY "workspace_members_delete_owner_admin_or_self" ON workspace_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workspace_members m
      WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "workspace_invitations_select_admin_or_invitee" ON workspace_invitations;

CREATE POLICY "workspace_invitations_select_admin_or_invitee" ON workspace_invitations
  FOR SELECT USING (
    invited_email = (SELECT email FROM users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM workspace_members m
      WHERE m.workspace_id = workspace_invitations.workspace_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
  );
-- INSERT/UPDATE (accetta/rifiuta) solo via service-role, stesso motivo di
-- workspace_members: serve validare piano/ruolo/esistenza utente prima.
