# Password Reset URL Fix - Final Solution

## Problem
Password reset emails were sending `localhost:8080` URLs instead of production URLs in two scenarios:
1. When creating a new admin user (invitation email)
2. When resetting password for existing admin user

This occurred even when:
- Supabase Site URL was correctly set to production
- Redirect URLs were properly configured
- Admin was triggering reset from production site

## Root Cause
The code in `src/lib/unified-auth.ts` was using `window.location.origin` to construct the redirect URL:

```typescript
// OLD CODE - Line 163 and 357
redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`
```

When an admin accessed the site from `localhost:8080` (during development/testing) and triggered a password reset, the code would use `localhost:8080` as the origin, resulting in password reset emails with localhost URLs.

## Solution
Hardcoded the production URL in both password reset functions:

### Changes Made

**File**: `src/lib/unified-auth.ts`

**Function 1: `requestPasswordReset()`** (Line 157-177)
```typescript
export async function requestPasswordReset(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Always use production URL for password reset emails
    const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
    })
    // ... rest of function
  }
}
```

**Function 2: `adminResetUserPassword()`** (Line 350-376)
```typescript
export async function adminResetUserPassword(userId: string, email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Always use production URL for password reset emails
    const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
    })
    // ... rest of function
  }
}
```

## Impact

### ✅ Fixed Use Cases
1. **Admin Invitation**: New admin created via "Invite User" → receives email with production URL
2. **Password Reset**: Existing admin reset via "Reset Password" button → receives email with production URL
3. **Farmer Invitation**: Farmer created via "Add New Farmer" → receives email with production URL (uses invite-user API which already had fallback)

### 🔧 Works From Anywhere
- Admin can trigger reset from localhost:8080 → email still contains production URL
- Admin can trigger reset from localhost:3001 → email still contains production URL
- Admin can trigger reset from production → email contains production URL
- **Result**: Users always receive emails with correct production URLs

## Testing

### To Verify the Fix:

1. **Test Admin Invitation**:
   ```
   - Log in as super admin (chris@ukuva.com) at https://little-bo-peep-327019541186.europe-west2.run.app/auth
   - Go to Admin Dashboard → User Management
   - Click "Invite User"
   - Fill in details (e.g., test@example.com)
   - Click "Send Invitation"
   - Check email → should contain production URL
   ```

2. **Test Password Reset**:
   ```
   - Log in as super admin
   - Go to Admin Dashboard → User Management
   - Click "Reset Password" for existing user (e.g., thesavides@gmail.com)
   - Check email → should contain production URL
   ```

3. **Test Farmer Invitation**:
   ```
   - Log in as any admin
   - Go to Admin Dashboard → Farmers tab
   - Click "Add New Farmer"
   - Fill in details with email
   - Click "Invite Farmer"
   - Check email → should contain production URL
   ```

### Expected Email Link Format

All password reset emails should now contain:
```
https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?code=LONG_CODE&next=/auth/reset-password
```

**NOT**:
```
http://localhost:8080/auth/callback?code=...
```

## Deployment

**Commit**: f04c89f
**Deployed**: January 12, 2026, ~20:30 UTC
**Status**: ✅ Deployed to production

## Related Files

- `src/lib/unified-auth.ts` - Contains the fixed functions
- `src/app/api/admin/invite-user/route.ts` - Already had production URL fallback
- `src/components/AdminUserManagement.tsx` - Calls adminResetUserPassword()
- `src/components/AdminDashboard.tsx` - Uses inviteUser for farmers

## Alternative Approaches Considered

### Approach 1: Environment Variable (NOT CHOSEN)
Create `NEXT_PUBLIC_SITE_URL` environment variable and use it instead of hardcoding.

**Pros**: More flexible for different environments
**Cons**: Additional configuration, environment variable management

**Why not chosen**: Hardcoding is simpler and this app only has one production environment.

### Approach 2: Rely on Supabase Configuration (NOT CHOSEN)
Keep `window.location.origin` and rely on Supabase Dashboard Site URL configuration to override.

**Pros**: Follows Supabase's intended design
**Cons**: Wasn't working reliably, Supabase appears to respect the `redirectTo` parameter more than we expected

**Why not chosen**: Direct approach is more reliable.

## Notes

- The server-side invite API (`/api/admin/invite-user/route.ts`) already had a production URL fallback, so farmer invitations were working correctly
- The issue only affected client-side password reset functions that used `window.location.origin`
- This fix ensures consistency across all password reset flows

---

**Last Updated**: January 12, 2026, 20:30 UTC
**Status**: ✅ Fixed and deployed
**Testing**: Ready for verification
