const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

console.log('❌ RLS policies still have infinite recursion\n');
console.log('The migration 005_fix_user_profiles_rls.sql was not executed properly.\n');
console.log('📋 ACTION REQUIRED:\n');
console.log('You need to run this SQL directly in Supabase SQL Editor:');
console.log('https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/editor\n');
console.log('='.repeat(80));
console.log(`
-- COPY AND RUN THIS IN SUPABASE SQL EDITOR:

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create users" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON user_profiles;

-- Temporarily allow anon access for setup
CREATE POLICY "Temp allow all for setup"
ON user_profiles FOR ALL
USING (true)
WITH CHECK (true);

-- Update the email
UPDATE user_profiles
SET email = 'chris@ukuva.com'
WHERE id = '66de4b16-7a81-4484-a460-35c2d2ac5a20';

-- Verify
SELECT id, email, full_name, role, status
FROM user_profiles;
`);
console.log('='.repeat(80));
console.log('\n⚠️  IMPORTANT: After running this, you need to add proper RLS policies back!');
