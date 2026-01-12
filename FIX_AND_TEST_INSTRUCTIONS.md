# Fix & Test Instructions - Super Admin Setup

**Date**: January 12, 2026
**Admin User ID**: `66de4b16-7a81-4484-a460-35c2d2ac5a20`

---

## 🎯 Quick Steps

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

---

### Step 2: Run RLS Fix Migration

Copy and paste the entire contents of:
`supabase/migrations/005_fix_user_profiles_rls.sql`

Or copy this SQL:

```sql
-- Fix Infinite Recursion in user_profiles RLS Policies
-- Date: January 12, 2026

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can create users" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update non-admin profiles" ON user_profiles;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can create users"
ON user_profiles FOR INSERT
WITH CHECK (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);

CREATE POLICY "Super admins can update any profile"
ON user_profiles FOR UPDATE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);

CREATE POLICY "Super admins can delete profiles"
ON user_profiles FOR DELETE
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
);
```

Click **Run** (or press Cmd/Ctrl + Enter)

**Expected Result**: You should see "Success. No rows returned"

---

### Step 3: Verify Table is Accessible

Run this query to verify the fix worked:

```sql
SELECT * FROM user_profiles;
```

**Expected Result**: Empty result (0 rows) with no errors

---

### Step 4: Insert Super Admin Profile

Run this SQL:

```sql
INSERT INTO user_profiles (id, email, full_name, role, status)
VALUES (
  '66de4b16-7a81-4484-a460-35c2d2ac5a20',
  'admin@littlebopeep.com',
  'Super Administrator',
  'super_admin',
  'active'
);
```

**Expected Result**: "Success. 1 row inserted"

---

### Step 5: Verify Super Admin Profile

Run this query:

```sql
SELECT id, email, full_name, role, status, created_at
FROM user_profiles
WHERE id = '66de4b16-7a81-4484-a460-35c2d2ac5a20';
```

**Expected Result**: You should see one row with:
- id: `66de4b16-7a81-4484-a460-35c2d2ac5a20`
- email: `admin@littlebopeep.com`
- full_name: `Super Administrator`
- role: `super_admin`
- status: `active`

---

### Step 6: Test Login in Production

1. Go to: https://little-bo-peep-327019541186.europe-west2.run.app/auth
2. Sign in with:
   - **Email**: `admin@littlebopeep.com`
   - **Password**: (the password you set when creating the user in Supabase Auth)
3. You should be redirected to the Admin Dashboard

---

## ✅ Success Criteria

After completing all steps:

- [ ] No RLS recursion errors when querying user_profiles
- [ ] Super admin profile exists in user_profiles table
- [ ] Can log in at /auth
- [ ] Redirected to Admin Dashboard after login
- [ ] Can see admin interface with user management options

---

## 🐛 Troubleshooting

### Error: "infinite recursion detected"
- You didn't run Step 2 yet. Run the RLS fix migration.

### Error: "duplicate key value violates unique constraint"
- Profile already exists. Check with: `SELECT * FROM user_profiles;`

### Error: "new row violates row-level security policy"
- The RLS fix didn't apply correctly. Try running Step 2 again.

### "User profile not found" when logging in
- Make sure the ID in Step 4 matches the auth user ID exactly
- Check: `SELECT id FROM auth.users WHERE email = 'admin@littlebopeep.com';`

### Can't access Admin Dashboard
- Verify role is 'super_admin' and status is 'active'
- Check browser console for errors

---

## 📞 What the Admin Password Is

The password is whatever you set when you created the user in Supabase Auth Dashboard at:

**Authentication → Users → Add user**

If you forgot it, you can:
1. Go to Authentication → Users
2. Find admin@littlebopeep.com
3. Click the three dots → Send password recovery email
4. Reset the password via email

---

## 🎉 After Success

Once logged in as super admin, you can:
- Create new users (walkers, farmers, admins)
- Manage user profiles
- View all reports
- Access all admin functions

---

**Ready?** Start with Step 1 and work through each step in order.
