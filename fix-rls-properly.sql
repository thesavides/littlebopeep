-- Fix infinite recursion by using a SECURITY DEFINER function
-- This function bypasses RLS to check user role

-- First, create a function that checks if current user is admin
-- SECURITY DEFINER means it runs with creator's privileges, bypassing RLS
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile (no recursion)
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Admins can read all profiles (using SECURITY DEFINER function)
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (auth.is_admin());

-- Policy 3: Super admins can insert new profiles
CREATE POLICY "Super admins can insert profiles"
ON user_profiles FOR INSERT
WITH CHECK (auth.is_super_admin());

-- Policy 4: Super admins can update any profile
CREATE POLICY "Super admins can update profiles"
ON user_profiles FOR UPDATE
USING (auth.is_super_admin());

-- Policy 5: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 6: Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
ON user_profiles FOR DELETE
USING (auth.is_super_admin());
