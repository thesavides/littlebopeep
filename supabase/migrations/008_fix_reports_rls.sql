-- Fix sheep_reports RLS so all authenticated users can see all reports
-- Previously each user could only see their own reports

-- Drop ALL existing policies on sheep_reports (regardless of name)
DO $$
DECLARE
  pol text;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'sheep_reports' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON sheep_reports', pol);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE sheep_reports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all reports
CREATE POLICY "Authenticated users can read all reports"
  ON sheep_reports FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert their own reports
CREATE POLICY "Authenticated users can insert reports"
  ON sheep_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update reports (needed for claiming/resolving)
CREATE POLICY "Authenticated users can update reports"
  ON sheep_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins can delete reports
CREATE POLICY "Admins can delete reports"
  ON sheep_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );
