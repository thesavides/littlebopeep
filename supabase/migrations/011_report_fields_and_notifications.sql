-- Workstream 1: Add missing report fields and create notifications table
-- Spec: /Downloads/reporting_system_spec.md

-- ============================================================
-- Part 1: Add missing columns to sheep_reports
-- ============================================================

ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS submitted_by_user_name TEXT,
  ADD COLUMN IF NOT EXISTS role_of_submitter TEXT,
  ADD COLUMN IF NOT EXISTS affected_farm_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS affected_farmer_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_accuracy FLOAT,
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS app_version TEXT;

-- Index for fast farm/farmer filtering in admin dashboard
CREATE INDEX IF NOT EXISTS sheep_reports_affected_farm_ids_idx
  ON sheep_reports USING GIN (affected_farm_ids);

CREATE INDEX IF NOT EXISTS sheep_reports_affected_farmer_ids_idx
  ON sheep_reports USING GIN (affected_farmer_ids);

-- ============================================================
-- Part 2: Create notifications table
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  report_id     TEXT REFERENCES sheep_reports(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,         -- e.g. 'new_report', 'report_claimed', 'thank_you'
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at       TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'sent'  -- 'sent' | 'read' | 'dismissed'
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_report_id_idx ON notifications(report_id);
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx ON notifications(sent_at DESC);

-- ============================================================
-- Part 3: RLS for notifications
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert notifications (server-side inserts from API routes)
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );
