-- 010_audit_logs_and_farm_fixes.sql

-- ── 1. Make farms.farmer_id nullable ─────────────────────────────────────────
-- When a farmer is deleted, their farms become orphaned (farmer_id = NULL)
-- rather than being cascade-deleted. An admin can then reassign them.
ALTER TABLE farms ALTER COLUMN farmer_id DROP NOT NULL;

-- Also drop the CASCADE so deleting a user_profile doesn't wipe the farm.
-- We keep the FK for referential integrity on non-null values.
ALTER TABLE farms DROP CONSTRAINT IF EXISTS farms_farmer_id_fkey;
ALTER TABLE farms
  ADD CONSTRAINT farms_farmer_id_fkey
  FOREIGN KEY (farmer_id)
  REFERENCES user_profiles(id)
  ON DELETE SET NULL;

-- ── 2. Audit logs table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_email  TEXT,
  action       TEXT        NOT NULL,   -- e.g. 'user.invite', 'farm.create', 'report.claim'
  entity_type  TEXT,                   -- e.g. 'user', 'farm', 'report'
  entity_id    TEXT,                   -- UUID of the affected record
  detail       JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx    ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx      ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx      ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx  ON audit_logs(created_at DESC);

-- RLS: admins can read all logs; nobody can update or delete logs (immutable)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- No UPDATE or DELETE policies — logs are immutable
