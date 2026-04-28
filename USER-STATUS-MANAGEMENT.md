# User Status Management

## Overview

The Little Bo Peep app uses a status-based system to manage user access. Each user has a `status` field that controls whether they can log in and access the system.

## User Statuses

### `active` - Normal Operation
- **What it means**: User account is fully functional
- **Can log in**: ✅ Yes
- **Can use features**: ✅ Yes
- **When used**: Default status for users who have completed setup

### `suspended` - Temporarily Disabled
- **What it means**: Account is temporarily disabled by an admin
- **Can log in**: ❌ No (login will fail with "Account suspended" error)
- **Can use features**: ❌ No
- **When used**:
  - User violated terms of service
  - Account needs investigation
  - Temporary security measure
  - User requested account pause

### `pending_verification` - Awaiting Confirmation
- **What it means**: User account created but email not verified
- **Can log in**: ⚠️ Partial (may be blocked by RLS policies)
- **Can use features**: ❌ Limited
- **When used**:
  - Newly created accounts waiting for email confirmation
  - Currently not actively used (all invitations bypass this)

### `password_reset_required` - Must Set/Reset Password
- **What it means**: User must reset their password before proceeding
- **Can log in**: ⚠️ Yes, but will be redirected to password reset
- **Can use features**: ❌ No, until password is reset
- **When used**:
  - Newly invited users (they receive password reset email)
  - Admin forced password reset for security
  - Compromised account recovery

---

## Admin Functions

### Suspend User

**Location**: Admin Dashboard → User Management → Suspend button

**Function**: `suspendUser(userId)`

**What it does**:
```typescript
// Changes user status to 'suspended'
updateUserProfile(userId, { status: 'suspended' })
```

**Effect**:
- User cannot log in (login fails with error message)
- Existing sessions are invalidated
- User sees "Account suspended. Please contact support." message

**Use cases**:
- Temporarily disable problematic user
- Investigate suspicious activity
- Enforce account policies

**Reversible**: ✅ Yes, use "Activate" button

---

### Activate User

**Location**: Admin Dashboard → User Management → Activate button

**Function**: `activateUser(userId)`

**What it does**:
```typescript
// Changes user status to 'active'
updateUserProfile(userId, { status: 'active' })
```

**Effect**:
- User can log in normally
- User can access all their role-based features
- Account is fully functional

**Use cases**:
- Restore suspended account
- Enable newly verified account
- Restore account after password reset

**Reversible**: ✅ Yes, use "Suspend" button

---

### Reset Password

**Location**: Admin Dashboard → User Management → Reset Password button

**Function**: `adminResetUserPassword(userId, email)`

**What it does**:
```typescript
// 1. Send password reset email with magic link
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/callback?next=/auth/reset-password`
})

// 2. Update user profile
updateUserProfile(userId, {
  password_reset_required: true,
  status: 'password_reset_required'
})
```

**Effect**:
- User receives password reset email
- User status changed to `password_reset_required`
- User must click email link and set new password
- After password reset, status stays as `password_reset_required` until next login

**Use cases**:
- User forgot password
- Security concern (force password change)
- Re-invite user who lost invitation email
- Admin suspects compromised account

**Automatic status change**: When user successfully logs in after resetting password, the `password_reset_required` flag is cleared automatically

---

## Status Transitions

### Normal User Lifecycle

```
1. Invitation
   ↓
   status: 'password_reset_required'
   password_reset_required: true

2. User clicks email, sets password
   ↓
   (status stays 'password_reset_required')

3. User logs in successfully
   ↓
   status: 'active'
   password_reset_required: false
```

### Suspension/Activation Cycle

```
Admin clicks "Suspend"
   ↓
status: 'suspended'
   ↓
User cannot log in
   ↓
Admin clicks "Activate"
   ↓
status: 'active'
   ↓
User can log in normally
```

### Forced Password Reset

```
Admin clicks "Reset Password"
   ↓
status: 'password_reset_required'
password_reset_required: true
   ↓
User receives email
   ↓
User clicks link, sets new password
   ↓
User logs in successfully
   ↓
status: 'active'
password_reset_required: false
```

---

## UI Indicators

### In User Management Table

**Status Badges**:
- 🟢 **Green**: `active` - "Active"
- 🔴 **Red**: `suspended` - "Suspended"
- 🟡 **Yellow**: `pending_verification` - "Pending"
- 🟠 **Orange**: `password_reset_required` - "Password Reset Required"

**Action Buttons**:
- User is `active` → Show "Suspend" button
- User is `suspended` → Show "Activate" button
- Always show "Reset Password" button (for all statuses)

---

## Login Flow with Status Checks

```typescript
// When user attempts login:

1. Authenticate with Supabase
   ↓
2. Check user profile status
   ↓
3. IF status === 'suspended'
   → Logout immediately
   → Show error: "Account suspended. Please contact support."
   ↓
4. IF status === 'password_reset_required'
   → Allow login
   → Redirect to: /auth/reset-password?new=true
   ↓
5. IF status === 'active'
   → Allow login
   → Update last_login_at
   → Redirect to: / (homepage)
```

See: `src/lib/unified-auth.ts` → `signIn()` function (lines 33-79)

---

## When to Use Each Function

### Use Suspend When:
- ✅ User violated community guidelines
- ✅ Investigating suspicious account activity
- ✅ User requested temporary account pause
- ✅ Account showing signs of compromise
- ✅ User hasn't paid subscription (farmers)

### Use Activate When:
- ✅ Restoring a previously suspended account
- ✅ Investigation completed, account is clean
- ✅ User resolved their payment issues
- ✅ User account was suspended by mistake
- ✅ User completed required actions

### Use Reset Password When:
- ✅ User forgot their password
- ✅ User reports account compromise
- ✅ Regular security measure (force password rotation)
- ✅ User never received invitation email
- ✅ Invitation email expired
- ✅ User needs to set initial password

---

## Best Practices

### For Admins

1. **Before suspending**:
   - Document reason for suspension
   - Consider sending warning first
   - Check if it should be temporary or permanent

2. **When activating**:
   - Verify issue is resolved
   - Consider forcing password reset for security
   - Document activation reason

3. **Password resets**:
   - Always verify user identity first (phone call, etc.)
   - Don't reset passwords without user request (except security issues)
   - Check that user receives the email

### For Super Admins

- Only super admins can suspend/activate users
- Regular admins cannot manage other admin accounts
- Always document status changes in external log
- Consider privacy implications of status changes

---

## Database Schema

```sql
-- user_profiles table
status user_status NOT NULL DEFAULT 'active'
password_reset_required BOOLEAN DEFAULT FALSE

-- user_status enum
CREATE TYPE user_status AS ENUM (
  'active',
  'suspended',
  'pending_verification',
  'password_reset_required'
);
```

---

## Related Functions

```typescript
// Get current user's status
const user = await getCurrentUser()
console.log(user.status) // 'active' | 'suspended' | etc.

// Update any user field (including status)
await updateUserProfile(userId, {
  status: 'active',
  password_reset_required: false
})

// Check if login is allowed
if (user.status === 'suspended') {
  return { success: false, error: 'Account suspended' }
}
```

---

## Security Considerations

1. **Suspension is immediate**: When a user is suspended, they cannot log in on their next attempt. However, existing sessions may remain active until token expires.

2. **Status in token**: The user's status is NOT stored in the JWT token, so we always check the database on login.

3. **RLS policies**: Supabase RLS policies should prevent suspended users from making database changes even if they somehow bypass the login check.

4. **Audit trail**: Consider adding a `status_changes` table to log all suspend/activate actions with timestamps and admin IDs.

---

**Last Updated**: January 12, 2026
**Related Files**:
- `src/lib/unified-auth.ts` (lines 327-342)
- `src/components/AdminUserManagement.tsx` (lines 94-136)
- `src/components/AdminDashboard.tsx`
