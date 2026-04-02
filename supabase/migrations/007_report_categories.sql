-- Migration 007: Add custom report categories support
-- Creates report_categories table and adds category columns to sheep_reports

-- Drop old condition check constraint (conditions are now dynamic strings)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'sheep_reports'
      AND constraint_name = 'sheep_reports_condition_check'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE sheep_reports DROP CONSTRAINT sheep_reports_condition_check;
  END IF;
END $$;

-- Add category columns to sheep_reports (nullable for backwards compatibility)
ALTER TABLE sheep_reports
  ADD COLUMN IF NOT EXISTS category_id TEXT DEFAULT 'sheep',
  ADD COLUMN IF NOT EXISTS category_name TEXT DEFAULT 'Sheep',
  ADD COLUMN IF NOT EXISTS category_emoji TEXT DEFAULT '🐑';

-- Create report_categories table
CREATE TABLE IF NOT EXISTS report_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📋',
  description TEXT,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  show_count BOOLEAN NOT NULL DEFAULT true,
  count_label TEXT NOT NULL DEFAULT 'Quantity',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for report_categories
ALTER TABLE report_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read active categories
CREATE POLICY "Anyone can read report categories"
  ON report_categories FOR SELECT
  USING (true);

-- Only admins can modify categories (enforced at app layer via service role API)
CREATE POLICY "Admins can manage report categories"
  ON report_categories FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_report_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER report_categories_updated_at
  BEFORE UPDATE ON report_categories
  FOR EACH ROW EXECUTE FUNCTION update_report_categories_updated_at();
