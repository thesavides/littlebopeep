-- Unified Authentication System Migration
-- Migrates from dual auth (admin_credentials + Supabase Auth) to single Supabase Auth
-- Date: January 12, 2026

-- ================================================
-- STEP 1: Create user_profiles table
-- ================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('walker', 'farmer', 'admin', 'super_admin');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'password_reset_required');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Role and status
  role user_role NOT NULL DEFAULT 'walker',
  status user_status NOT NULL DEFAULT 'active',

  -- Admin tracking
  created_by UUID REFERENCES user_profiles(id),
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_reset_required BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON user_profiles(created_by);

-- ================================================
-- STEP 2: Add RLS policies
-- ================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Admins and super admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  )
);

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()) -- Cannot change own role
);

-- Policy: Super admins can insert new users (via admin invitation)
CREATE POLICY "Super admins can create users"
ON user_profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND status = 'active'
  )
);

-- Policy: Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND status = 'active'
  )
);

-- Policy: Admins can update non-admin profiles
CREATE POLICY "Admins can update non-admin profiles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  )
  AND (
    SELECT role FROM user_profiles WHERE id = user_profiles.id
  ) NOT IN ('admin', 'super_admin')
);

-- ================================================
-- STEP 3: Create function to update updated_at timestamp
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STEP 4: Create function to track last login
-- ================================================

CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users sign in
-- Note: This requires setting up in Supabase dashboard
-- CREATE TRIGGER on_auth_user_signed_in
-- AFTER INSERT ON auth.sessions
-- FOR EACH ROW
-- EXECUTE FUNCTION update_last_login();

-- ================================================
-- STEP 5: Migrate existing admin from admin_credentials
-- ================================================

-- Note: This will be done manually or via a separate script
-- We'll create the super admin user in Supabase Auth first, then link to profile

-- ================================================
-- STEP 6: Clean up old data (DESTRUCTIVE - BE CAREFUL!)
-- ================================================

-- Delete all test sheep reports
DELETE FROM sheep_reports WHERE created_at < NOW();

-- Note: We'll keep the admin_credentials table for now until migration is verified
-- DROP TABLE IF EXISTS admin_credentials;

-- ================================================
-- STEP 7: Add comments for documentation
-- ================================================

COMMENT ON TABLE user_profiles IS 'Extended user profiles linked to Supabase Auth users';
COMMENT ON COLUMN user_profiles.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN user_profiles.role IS 'User role: walker, farmer, admin, or super_admin';
COMMENT ON COLUMN user_profiles.status IS 'User status: active, suspended, pending_verification, or password_reset_required';
COMMENT ON COLUMN user_profiles.created_by IS 'Admin user who created this account';
COMMENT ON COLUMN user_profiles.password_reset_required IS 'Forces user to change password on next login';
COMMENT ON COLUMN user_profiles.last_login_at IS 'Timestamp of last successful login';

-- ================================================
-- STEP 8: Create initial super admin profile
-- ================================================

-- This will be linked after creating the user in Supabase Auth
-- INSERT INTO user_profiles (id, email, full_name, role, status)
-- VALUES (
--   'AUTH_USER_ID_HERE',
--   'admin@littlebopeep.com',
--   'Super Administrator',
--   'super_admin',
--   'active'
-- );
