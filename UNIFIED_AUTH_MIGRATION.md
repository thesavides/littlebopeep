# Unified Authentication System Migration Guide

## Overview

This migration replaces the dual authentication system (admin_credentials + Supabase Auth) with a single, unified Supabase Auth system that includes:

- ✅ Single source of truth for all users
- ✅ Email invitations for new users
- ✅ Forgot password functionality
- ✅ Password reveal toggles
- ✅ Proper role-based access control
- ✅ Last login tracking for all users
- ✅ Admin password reset capabilities
- ✅ Clean separation of concerns

## Issues Resolved

### 1. Auth System Confusion
- **Problem**: Two separate auth systems caused login confusion
- **Solution**: Single Supabase Auth with user_profiles table for roles

### 2. Missing Email Notifications
- **Problem**: New users weren't notified about their accounts
- **Solution**: Built-in email invitations with password reset links

### 3. No Forgot Password
- **Problem**: Users couldn't reset passwords independently
- **Solution**: Forgot password flow with email verification

### 4. Poor User Management
- **Problem**: No unified view of users, roles not properly managed
- **Solution**: user_profiles table with role enum and admin tracking

### 5. Missing Password Reveal
- **Problem**: Users couldn't see what they're typing
- **Solution**: PasswordInput component with toggle on all password fields

## New Architecture

```
auth.users (Supabase Auth)
    ↓ (one-to-one)
user_profiles
    ├── role: walker | farmer | admin | super_admin
    ├── status: active | suspended | pending_verification | password_reset_required
    ├── last_login_at
    ├── created_by (tracks which admin created the user)
    └── password_reset_required (forces password change on login)
```

## Role Hierarchy

- **Super Admin**: Full access, can create other admins
- **Admin**: Manage farmers and walkers, cannot create admins
- **Farmer**: Access farmer dashboard + walker features
- **Walker**: Access walker dashboard only

## Migration Steps

### 1. Database Setup

Run in Supabase SQL Editor:

```bash
# Execute migration
supabase/migrations/004_unified_auth_system.sql
```

### 2. Create Super Admin

Follow instructions in:
```bash
supabase/setup-super-admin.md
```

### 3. Clean Test Data (Optional)

```sql
DELETE FROM sheep_reports;
DELETE FROM farms;
-- Keep your super admin user!
```

### 4. Update Application Code

The following files need to be updated to use `unified-auth.ts` instead of `admin-auth.ts` and `supabase-auth.ts`:

#### Components to Update:
- [x] `src/app/auth/page.tsx` - Login page
- [ ] `src/app/auth/signup.tsx` - Sign up flow
- [x] `src/app/auth/forgot-password/page.tsx` - NEW
- [x] `src/app/auth/reset-password/page.tsx` - NEW
- [ ] `src/app/admin-login/page.tsx` - UPDATE or REMOVE (no longer needed)
- [ ] `src/components/Header.tsx` - Use getCurrentUser()
- [ ] `src/components/AdminDashboard.tsx` - Use unified user management
- [ ] `src/components/AdminUserManagement.tsx` - Complete rewrite
- [ ] `src/components/ChangePasswordModal.tsx` - Use changePassword()

#### Libraries:
- [x] `src/lib/unified-auth.ts` - NEW (replaces both old auth files)
- [x] `src/components/PasswordInput.tsx` - NEW (reusable password field)

### 5. Deploy

After updating all components:

```bash
git add -A
git commit -m "Migrate to unified Supabase Auth system"
git push
```

## New Features

### For All Users

1. **Forgot Password**
   - Click "Forgot Password?" on login page
   - Receive email with reset link
   - Set new password

2. **Password Reveal Toggle**
   - All password fields have eye icon
   - Click to show/hide password

3. **Email Invitations**
   - New users receive welcome email
   - Email contains password reset link
   - Must set password before first login

### For Admins

1. **Unified User Management**
   - View all users in one place
   - See last login times
   - Filter by role (walker/farmer/admin)

2. **Invite Users**
   - Enter email, name, role
   - System sends invitation email automatically
   - User clicks link to set password

3. **Reset User Passwords**
   - Admin can trigger password reset for any user
   - User receives email with reset link
   - Account marked as "password reset required"

4. **Suspend/Activate Users**
   - One-click suspend
   - Suspended users cannot log in
   - Reactivate anytime

### For Super Admins

1. **Create Admin Users**
   - Invite regular admins
   - Invite super admins
   - All via email invitation flow

2. **Delete Users**
   - Permanently delete user accounts
   - Cascades to remove user_profiles

## API Reference

### Authentication

```typescript
// Sign in
const { success, user, error } = await signIn(email, password)

// Sign out
await signOut()

// Get current user
const user = await getCurrentUser()

// Check if authenticated
const isAuth = await isAuthenticated()
```

### Password Management

```typescript
// Change own password
const { success, error } = await changePassword(newPassword)

// Request password reset (forgot password)
const { success, error } = await requestPasswordReset(email)

// Reset password with token
const { success, error } = await resetPassword(newPassword)
```

### User Management (Admin)

```typescript
// Get all users
const users = await getAllUsers()

// Get users by role
const farmers = await getUsersByRole('farmer')

// Invite new user
const { success, user, error } = await inviteUser(
  email,
  fullName,
  role,
  phone?
)

// Update user profile
const { success, user, error } = await updateUserProfile(userId, {
  full_name: 'New Name',
  status: 'active'
})

// Suspend user
await suspendUser(userId)

// Activate user
await activateUser(userId)

// Admin reset user password
await adminResetUserPassword(userId, email)

// Delete user (super admin only)
await deleteUser(userId)
```

### Role Checking

```typescript
// Check specific role
hasRole(user, 'admin') // boolean

// Check feature access
canAccessWalkerFeatures(user)
canAccessFarmerFeatures(user)
canAccessAdminFeatures(user)
isSuperAdmin(user)
```

## Email Templates

Configure in Supabase Dashboard → Authentication → Email Templates:

### 1. Confirmation (Sign Up)
Used when admins invite new users.

### 2. Password Reset
Used for forgot password and admin password resets.

### 3. Invite
Used when admins create new user accounts.

## Security Features

1. **Row Level Security (RLS)**
   - Users can only read/update their own profiles
   - Admins can read all profiles
   - Super admins can modify all profiles

2. **Password Requirements**
   - Minimum 8 characters
   - Enforced by Supabase

3. **Session Management**
   - Automatic session refresh
   - Secure httpOnly cookies
   - PKCE flow for extra security

4. **Email Verification**
   - Password reset links expire in 1 hour
   - One-time use tokens

5. **Audit Trail**
   - `created_by` tracks who created each user
   - `last_login_at` tracks user activity
   - Can be extended with full audit log table

## Migration Checklist

- [x] Create migration SQL file
- [x] Create user_profiles table
- [x] Add RLS policies
- [x] Create unified-auth.ts library
- [x] Create forgot-password page
- [x] Create reset-password page
- [x] Create PasswordInput component
- [ ] Update login page
- [ ] Update admin dashboard
- [ ] Update header component
- [ ] Remove admin-login page (or update it)
- [ ] Remove admin_credentials table (after testing)
- [ ] Test all flows
- [ ] Deploy to production

## Testing Plan

### 1. Super Admin Flow
- [ ] Create super admin user
- [ ] Login as super admin
- [ ] Access admin dashboard
- [ ] Create new admin user
- [ ] Verify email received

### 2. Admin Flow
- [ ] Login as admin
- [ ] Invite farmer
- [ ] Invite walker
- [ ] Reset user password
- [ ] Suspend/activate user

### 3. User Flows
- [ ] Login as walker
- [ ] Login as farmer
- [ ] Change password
- [ ] Forgot password
- [ ] Reset password via email link

### 4. Security Tests
- [ ] Suspended user cannot login
- [ ] Regular admin cannot create admin
- [ ] Walker cannot access farmer dashboard
- [ ] Unauthenticated user redirected

## Rollback Plan

If issues occur:

1. Keep `admin_credentials` table (don't drop it yet)
2. Keep old `admin-auth.ts` and `supabase-auth.ts` files
3. Can revert to old system by reverting component changes
4. user_profiles table can coexist with old system

## Support

For issues during migration:
1. Check Supabase logs for auth errors
2. Verify RLS policies are correct
3. Check email template configuration
4. Ensure user_profiles are created for all auth users

## Next Steps

After successful migration:

1. Configure email templates in Supabase
2. Set up SMTP or use Supabase email service
3. Add email rate limiting
4. Consider adding 2FA
5. Add comprehensive audit logging
6. Remove old auth files and tables
