# Next Steps - Unified Auth Migration

## ✅ Completed
1. Created unified authentication system (`unified-auth.ts`)
2. Created database migration (`004_unified_auth_system.sql`)
3. Created documentation (`UNIFIED_AUTH_MIGRATION.md` and `setup-super-admin.md`)
4. Updated all components to use unified auth
5. Committed all changes to git

## 🔄 Next Steps

### Step 1: Run Database Migration in Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/004_unified_auth_system.sql`
4. Copy the entire contents and paste into SQL Editor
5. Click **Run** to execute the migration
6. Verify tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles';
   ```

### Step 2: Create Super Admin User

Follow the instructions in `supabase/setup-super-admin.md`:

#### Quick Version:
1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: `admin@littlebopeep.com` (or your preferred admin email)
   - Password: Create a strong password
   - ✅ Auto Confirm User (check this box)
4. Click **Create user**
5. **Copy the User ID** from the users table
6. In **SQL Editor**, run:
   ```sql
   INSERT INTO user_profiles (id, email, full_name, role, status)
   VALUES (
     'PASTE_USER_ID_HERE',
     'admin@littlebopeep.com',
     'Super Administrator',
     'super_admin',
     'active'
   );
   ```

### Step 3: Test Authentication

1. Go to your app's login page: `/auth`
2. Sign in with the super admin credentials you created
3. You should see the Admin Dashboard
4. Test creating a new user via the "Invite User" button
5. Check that the invited user receives an email

### Step 4: Configure Email Settings (if emails aren't sending)

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Configure SMTP settings or use Supabase's built-in email service
3. Customize email templates if needed

### Step 5: Clean Up Old Admin System (Optional)

Since the new unified auth system is working, you can optionally clean up the old admin_credentials table:

```sql
-- ONLY run this after confirming the new system works!
-- This removes the old admin_credentials table
DROP TABLE IF EXISTS admin_credentials CASCADE;
```

**Note**: There is no test data to clean up in the database. Your current database only has:
- `languages` (for translations)
- `translations` (for translations)
- `translation_metadata` (for translations)
- `admin_credentials` (old admin system - can be removed after migration)

The `farms` and `sheep_reports` tables don't exist in the database yet - they're only stored in the frontend app state (appStore). If you want to persist these to the database in the future, you'll need to create separate migrations for those tables.

## 🎯 Testing Checklist

- [ ] Super admin can log in with email
- [ ] Super admin can see Admin Dashboard
- [ ] Super admin can invite new users (walker, farmer, admin)
- [ ] Invited users receive email with password reset link
- [ ] New users can set password via reset link
- [ ] Users can log in after setting password
- [ ] Forgot password flow works
- [ ] Change password works for logged-in users
- [ ] Admin can reset another user's password
- [ ] Admin can suspend/activate users
- [ ] Last login times are tracked
- [ ] User status is displayed correctly

## 📚 Key Changes

### Authentication Flow
- **Before**: Dual system (admin_credentials + Supabase Auth)
- **After**: Single Supabase Auth system with user_profiles extension

### User Creation
- **Before**: Self-signup allowed, separate admin credentials
- **After**: Admin-only invitations via email

### Password Management
- **Before**: No forgot password, no admin reset
- **After**: Full password management (forgot, reset, admin reset)

### User Management
- **Before**: Limited visibility, no status tracking
- **After**: Full user management with status, last login, suspend/activate

## 🚨 Important Notes

1. **Old admin_credentials table**: The migration does NOT delete this table. You can keep it for reference or delete it manually once you've verified the new system works.

2. **Existing users**: If you have existing users in Supabase Auth, you'll need to create corresponding user_profiles records for them.

3. **Email configuration**: Make sure Supabase email is configured before inviting users, otherwise they won't receive setup instructions.

4. **Super admin**: The first super admin must be created manually. After that, super admins can create other admins.

## 📖 Documentation Files

- `UNIFIED_AUTH_MIGRATION.md` - Complete API reference and architecture
- `supabase/setup-super-admin.md` - Step-by-step super admin setup
- `supabase/migrations/004_unified_auth_system.sql` - Database schema

## 🆘 Troubleshooting

### "User profile not found" error
- Make sure you ran the INSERT statement in Step 2
- Verify the user ID matches exactly between auth.users and user_profiles

### Can't see Admin Dashboard
- Check that role is set to 'super_admin' in user_profiles table
- Make sure status is 'active'

### Email not sending
- Configure SMTP settings in Supabase Dashboard
- Or use Supabase's built-in email service (automatic)
- Check Supabase logs for email errors

### Old admin login not working
- `/admin-login` now redirects to `/auth`
- Use email instead of username
- All admins must be in user_profiles with role 'admin' or 'super_admin'
