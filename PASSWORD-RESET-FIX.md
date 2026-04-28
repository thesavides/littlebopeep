# Password Reset Fix - January 12, 2026

## Issue Identified

Jessica Yellin (jessica.yellin@gmail.com) was invited as an admin user but encountered an error when attempting to set her password after clicking the email link.

## Root Cause

The password reset flow was missing a critical auth callback handler. When users clicked the password reset link in their email:

1. Supabase would redirect them to `/auth/reset-password` with a token in the URL
2. **Missing step**: The token needed to be exchanged for an active session
3. Without an active session, calling `supabase.auth.updateUser()` would fail

## Solution Implemented

Created an auth callback route that properly handles the token exchange:

### New File Created
- **`src/app/auth/callback/route.ts`**
  - Extracts the `code` parameter from the URL
  - Exchanges the code for an active session using `supabase.auth.exchangeCodeForSession()`
  - Redirects to the password reset page with an active session

### Files Modified

1. **`src/app/api/admin/invite-user/route.ts`** (line 126)
   - Changed: `redirectTo: '${origin}/auth/reset-password?new=true'`
   - To: `redirectTo: '${origin}/auth/callback?next=/auth/reset-password?new=true'`

2. **`src/lib/unified-auth.ts`** (lines 163, 355)
   - Updated `requestPasswordReset()` redirect
   - Updated `adminResetUserPassword()` redirect
   - Both now route through `/auth/callback`

## How It Works Now

### New User Invitation Flow
1. Admin invites user via Admin Dashboard
2. API creates user with temporary password
3. Password reset email sent with link: `https://.../auth/callback?code=TOKEN&next=/auth/reset-password?new=true`
4. User clicks link → callback route exchanges token for session
5. User redirected to `/auth/reset-password?new=true` with active session
6. User sets password successfully
7. Redirected to login page

### Existing User Password Reset Flow
1. User requests password reset at `/auth/forgot-password`
2. Reset email sent with link: `https://.../auth/callback?code=TOKEN&next=/auth/reset-password`
3. User clicks link → callback route exchanges token for session
4. User redirected to `/auth/reset-password` with active session
5. User sets new password successfully
6. Redirected to login page

## Testing

### Build Status
✅ Build completed successfully (commit: bedecb5)
✅ Deployed to production: https://little-bo-peep-327019541186.europe-west2.run.app
✅ Callback route verified (returns HTTP 307 redirect as expected)

### Next Steps to Test

1. **For Jessica** (or any newly invited user):
   - Admin needs to re-invite Jessica OR trigger a new password reset
   - Jessica should receive a new email
   - Click the link in the email
   - Should now successfully set password

2. **To re-invite Jessica**:
   ```
   Option 1: Via UI
   - Log in as super admin at: https://little-bo-peep-327019541186.europe-west2.run.app/auth
   - Go to Admin Dashboard → User Management
   - Click "Reset Password" for Jessica's account

   Option 2: Check if Jessica's account exists first
   - Log in to Supabase Dashboard: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/users
   - Search for jessica.yellin@gmail.com
   - If exists, click user → Send password recovery email
   - If doesn't exist, delete and re-invite via Admin Dashboard
   ```

3. **Test the complete flow**:
   - User receives email
   - Clicks link (should redirect through `/auth/callback`)
   - Sees password reset page
   - Enters new password (minimum 8 characters)
   - Submits form
   - Should see success message
   - Redirected to login page after 3 seconds
   - Can log in with new password

## Test Scripts Available

### check-new-user.js
Checks if a user exists in the database and their current status.

```bash
# Edit the script to set USER_EMAIL
node check-new-user.js
```

### test-password-reset.js
Tests the password reset email flow.

```bash
# Edit the script to set TEST_EMAIL
node test-password-reset.js
```

## Related Documentation

- **COMPLETE-HANDOFF-AUTH-AND-CLI.md** - Full authentication system documentation
- **UNIFIED_AUTH_MIGRATION.md** - Auth system architecture
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr

## Security Considerations

✅ Auth callback uses PKCE flow (Proof Key for Code Exchange)
✅ Code can only be exchanged once
✅ Tokens expire after use
✅ All password resets require email verification

## Deployment Details

**Commit**: bedecb5
**Deployed**: January 12, 2026, ~19:52 UTC
**Build ID**: 3b1151a1-3a7d-4206-86d6-9e2cc3590fa3
**Status**: ✅ SUCCESS

---

**Last Updated**: January 12, 2026, 19:55 UTC
**Status**: ✅ Fix deployed to production, ready for testing
