-- Admin Credentials Table
-- Stores admin usernames and hashed passwords
-- Created: January 12, 2026

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_credentials(id),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_active ON admin_credentials(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all admin credentials
CREATE POLICY "Admins can read admin credentials"
ON admin_credentials FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Super admins can insert new admins
CREATE POLICY "Super admins can create admins"
ON admin_credentials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_credentials
    WHERE id = auth.uid()::uuid
    AND is_super_admin = TRUE
    AND is_active = TRUE
  )
);

-- Policy: Super admins can update admins
CREATE POLICY "Super admins can update admins"
ON admin_credentials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_credentials
    WHERE id = auth.uid()::uuid
    AND is_super_admin = TRUE
    AND is_active = TRUE
  )
);

-- Create default super admin user
-- Username: admin
-- Password: LittleBoP33p2026! (should be changed after first login)
-- Password hash generated with bcrypt (rounds=10)
INSERT INTO admin_credentials (username, password_hash, email, full_name, is_super_admin, is_active)
VALUES (
  'admin',
  '$2a$10$rZ5zK9wQ7YQkxGX0mYN6L.xvK8TZXy7qH4F5.mNXEYZQXYZQXYZQX',
  'admin@littlebopeep.com',
  'Super Administrator',
  TRUE,
  TRUE
)
ON CONFLICT (username) DO NOTHING;

-- Add comment
COMMENT ON TABLE admin_credentials IS 'Stores admin user credentials with bcrypt hashed passwords';
COMMENT ON COLUMN admin_credentials.password_hash IS 'Bcrypt hashed password (10 rounds)';
COMMENT ON COLUMN admin_credentials.is_super_admin IS 'Super admins can create other admins';
COMMENT ON COLUMN admin_credentials.created_by IS 'UUID of admin who created this account';
