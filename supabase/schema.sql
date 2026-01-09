-- Little Bo Peep Database Schema
-- Run this in the Supabase SQL editor to set up the database

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Walkers table (public users who report sightings)
CREATE TABLE IF NOT EXISTS walkers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reports_count INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT FALSE,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farmers table (subscribers who receive alerts)
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    holding_name TEXT NOT NULL,
    alert_area JSONB, -- GeoJSON polygon
    alert_radius_km DECIMAL,
    center_lat DECIMAL,
    center_lng DECIMAL,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('active', 'inactive', 'trial')),
    email TEXT NOT NULL,
    phone TEXT,
    sms_alerts BOOLEAN DEFAULT FALSE,
    email_alerts BOOLEAN DEFAULT TRUE,
    push_alerts BOOLEAN DEFAULT TRUE,
    muted_until TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table (sheep sightings)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    walker_id UUID REFERENCES walkers(id) ON DELETE SET NULL,
    lat DECIMAL NOT NULL,
    lng DECIMAL NOT NULL,
    geohash TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
    tags TEXT[] NOT NULL DEFAULT '{}',
    photo_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'resolved', 'dismissed')),
    claimed_by UUID REFERENCES farmers(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table (links reports to farmers)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    action TEXT CHECK (action IN ('mine', 'not_mine', 'resolved')),
    notified_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    action_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_id, farmer_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Geospatial index on reports
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_geohash ON reports(geohash);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Farmer indexes
CREATE INDEX IF NOT EXISTS idx_farmers_subscription ON farmers(subscription_status);
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);

-- Match indexes
CREATE INDEX IF NOT EXISTS idx_matches_farmer_id ON matches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_matches_report_id ON matches(report_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set location from lat/lng
CREATE OR REPLACE FUNCTION set_report_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to find farmers whose alert area contains a point
CREATE OR REPLACE FUNCTION find_matching_farmers(report_lat DECIMAL, report_lng DECIMAL)
RETURNS TABLE(farmer_id UUID, distance_km DECIMAL) AS $$
DECLARE
    report_point GEOGRAPHY;
BEGIN
    report_point := ST_SetSRID(ST_MakePoint(report_lng, report_lat), 4326)::geography;
    
    RETURN QUERY
    SELECT 
        f.id,
        ROUND((ST_Distance(
            report_point,
            ST_SetSRID(ST_MakePoint(f.center_lng, f.center_lat), 4326)::geography
        ) / 1000)::numeric, 2) as distance_km
    FROM farmers f
    WHERE 
        f.subscription_status IN ('active', 'trial')
        AND (f.muted_until IS NULL OR f.muted_until < NOW())
        AND (
            -- Check radius-based alert
            (f.center_lat IS NOT NULL AND f.center_lng IS NOT NULL AND f.alert_radius_km IS NOT NULL
             AND ST_DWithin(
                 report_point,
                 ST_SetSRID(ST_MakePoint(f.center_lng, f.center_lat), 4326)::geography,
                 f.alert_radius_km * 1000
             ))
            -- OR check polygon-based alert (simplified - full GeoJSON parsing would need more logic)
        )
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment walker report count
CREATE OR REPLACE FUNCTION increment_walker_reports()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE walkers 
    SET reports_count = reports_count + 1, updated_at = NOW()
    WHERE id = NEW.walker_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE TRIGGER update_walkers_updated_at BEFORE UPDATE ON walkers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmers_updated_at BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set location on report insert/update
CREATE TRIGGER set_report_location_trigger BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION set_report_location();

-- Increment walker report count
CREATE TRIGGER increment_reports_trigger AFTER INSERT ON reports
    FOR EACH ROW EXECUTE FUNCTION increment_walker_reports();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Walkers can read/update their own data
CREATE POLICY "Walkers can view own data" ON walkers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Walkers can update own data" ON walkers
    FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can create reports (authenticated)
CREATE POLICY "Authenticated users can create reports" ON reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reports are publicly readable (for farmers to see)
CREATE POLICY "Reports are publicly readable" ON reports
    FOR SELECT USING (true);

-- Only report owner can update their report
CREATE POLICY "Report owners can update" ON reports
    FOR UPDATE USING (
        walker_id IN (SELECT id FROM walkers WHERE user_id = auth.uid())
    );

-- Farmers can read/update their own data
CREATE POLICY "Farmers can view own data" ON farmers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update own data" ON farmers
    FOR UPDATE USING (auth.uid() = user_id);

-- Matches are visible to the relevant farmer
CREATE POLICY "Farmers can view their matches" ON matches
    FOR SELECT USING (
        farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
    );

CREATE POLICY "Farmers can update their matches" ON matches
    FOR UPDATE USING (
        farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid())
    );

-- =============================================
-- INITIAL DATA (for testing)
-- =============================================

-- Insert a demo farmer (optional)
-- INSERT INTO farmers (holding_name, center_lat, center_lng, alert_radius_km, email, subscription_status)
-- VALUES ('Demo Farm', 54.5, -2.5, 5, 'demo@example.com', 'trial');
