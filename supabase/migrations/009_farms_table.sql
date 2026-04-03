-- 009_farms_table.sql
-- Create farms and farm_fields tables with RLS
-- Replaces localStorage-only farm storage

CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  alert_buffer_meters INTEGER NOT NULL DEFAULT 500,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  category_subscriptions JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fence_posts JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_fields ENABLE ROW LEVEL SECURITY;

-- Farms: all authenticated users can read (farmers need to see their own, admins all)
CREATE POLICY "Authenticated users can view farms" ON farms
  FOR SELECT TO authenticated
  USING (true);

-- Farmers can only insert farms for themselves; admins can insert for anyone
CREATE POLICY "Farmers and admins can insert farms" ON farms
  FOR INSERT TO authenticated
  WITH CHECK (
    farmer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Farmers can update their own farms; admins can update any farm
CREATE POLICY "Farmers and admins can update farms" ON farms
  FOR UPDATE TO authenticated
  USING (
    farmer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Farmers can delete their own farms; admins can delete any
CREATE POLICY "Farmers and admins can delete farms" ON farms
  FOR DELETE TO authenticated
  USING (
    farmer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Farm fields: all authenticated users can read
CREATE POLICY "Authenticated users can view farm fields" ON farm_fields
  FOR SELECT TO authenticated
  USING (true);

-- Farm fields: insert/update/delete allowed if user owns the parent farm or is admin
CREATE POLICY "Farmers and admins can manage farm fields" ON farm_fields
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_fields.farm_id
        AND (
          farms.farmer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
          )
        )
    )
  );

-- Auto-update updated_at on farms
CREATE OR REPLACE FUNCTION update_farms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_farms_updated_at();
