# Setup Super Admin User

Follow these steps to create the initial super admin user after running the migration.

## Step 1: Run the Migration

Execute `004_unified_auth_system.sql` in Supabase SQL Editor.

## Step 2: Create Super Admin in Supabase Auth Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Fill in:
   - **Email**: `admin@littlebopeep.com` (or your preferred admin email)
   - **Password**: Create a strong password (you'll change this later)
   - **Auto Confirm User**: ✅ (check this box)
4. Click "Create user"
5. **Copy the User ID** from the users table (you'll need this in next step)

## Step 3: Create Super Admin Profile

Run this SQL in Supabase SQL Editor, replacing `YOUR_USER_ID_HERE` with the ID copied from step 2:

```sql
INSERT INTO user_profiles (id, email, full_name, role, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'admin@littlebopeep.com',
  'Super Administrator',
  'super_admin',
  'active'
);
```

## Step 4: Clean Up Old Admin System (Optional)

After confirming the new system works, you can remove the old admin_credentials table:

```sql
-- ONLY run this after verifying the new auth system works!
DROP TABLE IF EXISTS admin_credentials CASCADE;
```

**Note**: The `farms` and `sheep_reports` tables don't exist in your database - they're only in the frontend app state. No database cleanup is needed for those.

## Step 5: Test Super Admin Login

1. Go to your app's login page (`/auth`)
2. Sign in with:
   - **Email**: `admin@littlebopeep.com`
   - **Password**: The password you set in Step 2
3. You should see the Admin Dashboard with full permissions

## Step 6: Invite Additional Users

As super admin, you can now:
- Create additional admin users
- Invite farmers
- Invite walkers
- All will receive email invitations with password reset links

## Troubleshooting

### "User profile not found" error
- Make sure you ran the INSERT statement in Step 3
- Verify the user ID matches exactly

### Can't see Admin Dashboard
- Check that role is set to 'super_admin' in user_profiles table
- Make sure status is 'active'

### Email not sending
- Configure SMTP settings in Supabase Dashboard → Authentication → Email Templates
- Or use Supabase's built-in email service (automatic)
