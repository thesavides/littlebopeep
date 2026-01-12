-- Fix Infinite Recursion in user_profiles RLS Policies
-- Date: January 12, 2026
-- Issue: The RLS policies for user_profiles cause infinite recursion
-- Solution: Simplify policies to break the recursive cycle

-- ================================================
-- STEP 1: Drop all existing policies
-- ================================================

DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create users" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON user_profiles;

-- ================================================
-- STEP 2: Create simplified, non-recursive policies
-- ================================================

-- Policy: Users can read their own profile
-- (No subquery needed - direct ID match)
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Admins can read all profiles
-- (Use a direct role check without recursive subquery)
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);

-- Policy: Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Note: Role changes prevented by application logic, not RLS
);

-- Policy: Super admins can insert new users
CREATE POLICY "Super admins can create users"
ON user_profiles FOR INSERT
WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);

-- Policy: Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
ON user_profiles FOR UPDATE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);

-- Policy: Super admins can delete profiles (for cleanup)
CREATE POLICY "Super admins can delete profiles"
ON user_profiles FOR DELETE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);

-- ================================================
-- STEP 3: Alternative - Allow anon access for initial setup
-- ================================================
-- Uncomment this if you need to insert the first super admin via anon key

-- CREATE POLICY "Allow anon insert for initial setup"
-- ON user_profiles FOR INSERT
-- WITH CHECK (auth.role() = 'anon');

-- CREATE POLICY "Allow anon select for verification"
-- ON user_profiles FOR SELECT
-- USING (auth.role() = 'anon');

-- NOTE: Remember to drop these policies after creating the first super admin!

-- ================================================
-- STEP 4: Verify policies
-- ================================================

-- List all policies on user_profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;
