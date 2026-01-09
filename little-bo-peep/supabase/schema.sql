-- Little Bo Peep Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Custom types
CREATE TYPE report_status AS ENUM ('pending', 'claimed', 'resolved', 'dismissed');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'trial');
CREATE TYPE user_role AS ENUM ('walker', 'farmer', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'walker',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Walkers table
CREATE TABLE IF NOT EXISTS walkers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reports_count INTEGER NOT NULL DEFAULT 0,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Farmers table
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  holding_name TEXT NOT NULL,
  alert_area JSONB, -- GeoJSON polygon
  alert_radius_km DECIMAL(5,2),
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  email TEXT NOT NULL,
  phone TEXT,
  sms_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  push_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  muted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  walker_id UUID NOT NULL REFERENCES walkers(id) ON DELETE CASCADE,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  geohash TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
  tags TEXT[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  description TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  claimed_by UUID REFERENCES farmers(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches table (links reports to farmers)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  action TEXT, -- 'mine', 'not_mine', 'resolved'
  notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, farmer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_geohash ON reports(geohash);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_walker_id ON reports(walker_id);
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_matches_farmer_id ON matches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_matches_report_id ON matches(report_id);
CREATE INDEX IF NOT EXISTS idx_matches_action ON matches(action);

CREATE INDEX IF NOT EXISTS idx_farmers_subscription ON farmers(subscription_status);

-- Trigger to update location from lat/lng
CREATE OR REPLACE FUNCTION update_report_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_report_location
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_report_location();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_farmers_updated_at
  BEFORE UPDATE ON farmers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to increment walker reports count
CREATE OR REPLACE FUNCTION increment_walker_reports()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE walkers SET reports_count = reports_count + 1 WHERE id = NEW.walker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_increment_walker_reports
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_walker_reports();

-- Function to find farmers within alert area
CREATE OR REPLACE FUNCTION find_matching_farmers(
  report_lat DECIMAL,
  report_lng DECIMAL
)
RETURNS TABLE (
  farmer_id UUID,
  holding_name TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.holding_name,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(report_lng, report_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(f.center_lng, f.center_lat), 4326)::geography
    ) / 1000 as distance_km
  FROM farmers f
  WHERE f.subscription_status IN ('active', 'trial')
    AND (f.muted_until IS NULL OR f.muted_until < NOW())
    AND (
      -- Check radius-based alert area
      (f.center_lat IS NOT NULL AND f.center_lng IS NOT NULL AND f.alert_radius_km IS NOT NULL
       AND ST_DWithin(
         ST_SetSRID(ST_MakePoint(report_lng, report_lat), 4326)::geography,
         ST_SetSRID(ST_MakePoint(f.center_lng, f.center_lat), 4326)::geography,
         f.alert_radius_km * 1000
       ))
      -- Note: Polygon-based checking would require additional logic
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Walkers: Users can only read/update their own walker record
CREATE POLICY "Users can view own walker" ON walkers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own walker" ON walkers
  FOR UPDATE USING (auth.uid() = user_id);

-- Farmers: Users can only read/update their own farmer record
CREATE POLICY "Users can view own farmer" ON farmers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own farmer" ON farmers
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports: Public can create, walkers can view their own
CREATE POLICY "Anyone can create reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Walkers can view own reports" ON reports
  FOR SELECT USING (
    walker_id IN (SELECT id FROM walkers WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM farmers WHERE user_id = auth.uid() AND subscription_status IN ('active', 'trial'))
  );

-- Matches: Farmers can view and update their own matches
CREATE POLICY "Farmers can view own matches" ON matches
  FOR SELECT USING (
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
  );

CREATE POLICY "Farmers can update own matches" ON matches
  FOR UPDATE USING (
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
  );

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for report photos
CREATE POLICY "Anyone can upload report photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Anyone can view report photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-photos');
