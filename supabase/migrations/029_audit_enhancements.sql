-- 029_audit_enhancements.sql
-- Extend audit_logs with request context; add error_logs table for runtime errors.

-- ── 1. Extend audit_logs with request context ────────────────────────────────
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS ip_address   TEXT,
  ADD COLUMN IF NOT EXISTS user_agent   TEXT,
  ADD COLUMN IF NOT EXISTS request_path TEXT;

-- ── 2. Error logs table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_email   TEXT,
  severity      TEXT        NOT NULL DEFAULT 'error',  -- 'info' | 'warning' | 'error' | 'critical'
  error_code    TEXT,
  message       TEXT        NOT NULL,
  stack         TEXT,
  context       JSONB       NOT NULL DEFAULT '{}',
  entity_type   TEXT,
  entity_id     TEXT,
  request_path  TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_logs_severity_idx    ON error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_actor_id_idx    ON error_logs(actor_id);
CREATE INDEX IF NOT EXISTS error_logs_entity_idx      ON error_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx  ON error_logs(created_at DESC);

-- RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read error logs" ON error_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Inserts come through the /api/errors server route (service role, bypasses RLS).
-- We still add a permissive policy so direct authenticated inserts are possible
-- for edge cases where the API route is unavailable.
CREATE POLICY "Authenticated users can insert error logs" ON error_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Error logs are immutable — no UPDATE or DELETE policies.
