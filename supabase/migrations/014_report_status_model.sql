-- WS8: Report status model refactor
-- New statuses: escalated (admin investigation), complete (admin final closure)
-- New columns: resolution_reason, admin_notes, completed_by/at, escalated_by/at

-- ============================================================
-- Part 1: New columns on sheep_reports
-- ============================================================

ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS resolution_reason TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes        TEXT,
  ADD COLUMN IF NOT EXISTS completed_by       UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS completed_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escalated_by       UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS escalated_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS farmer_flag_note   TEXT,   -- free-text comment when farmer flags to admin
  ADD COLUMN IF NOT EXISTS flagged_by_farmer  UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS flagged_at         TIMESTAMPTZ;

-- Clear all existing photo data (decided: no backfill to report_images table)
UPDATE sheep_reports SET photo_urls = '{}';

-- ============================================================
-- Part 2: Update claims to support multiple farmers
-- (single claimed_by_farmer_id kept for backwards compat;
--  new claimed_by_farmer_ids[] array holds all current claimants)
-- ============================================================

ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS claimed_by_farmer_ids TEXT[] DEFAULT '{}';

-- Backfill: migrate any existing single claim into the array
UPDATE sheep_reports
SET claimed_by_farmer_ids = ARRAY[claimed_by_farmer_id]
WHERE claimed_by_farmer_id IS NOT NULL
  AND (claimed_by_farmer_ids IS NULL OR claimed_by_farmer_ids = '{}');

-- ============================================================
-- Part 3: screening_required for WS14 (add now so RLS can use it)
-- ============================================================

ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS screening_required         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata_completeness_score FLOAT,
  ADD COLUMN IF NOT EXISTS screened_by               UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS screened_at               TIMESTAMPTZ;

-- ============================================================
-- Part 4: Update sheep_reports RLS to enforce screening gate
-- Farmers and walkers cannot see reports pending admin screening
-- ============================================================

-- Drop and recreate the SELECT policy to add screening filter
DO $$
DECLARE pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'sheep_reports' AND schemaname = 'public'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON sheep_reports', pol);
  END LOOP;
END $$;

-- Admins see everything
CREATE POLICY "Admins can read all reports"
  ON sheep_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- Farmers and walkers only see reports that have passed screening
CREATE POLICY "Non-admins see screened reports only"
  ON sheep_reports FOR SELECT
  TO authenticated
  USING (
    (screening_required = false OR screening_required IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );
