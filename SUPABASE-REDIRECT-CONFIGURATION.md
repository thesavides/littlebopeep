# Supabase Redirect URL Configuration

## Issue
When users receive password reset/invitation emails and click the link, they're redirected to the callback route but without the authentication code. This causes an endless redirect loop.

## Root Cause
Supabase needs to be configured with the correct redirect URLs to include the authentication code in the URL.

## Solution

### Step 1: Configure Supabase Site URL and Redirect URLs

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration

2. Set the following URLs:

   **Site URL** (Production):
   ```
   https://little-bo-peep-327019541186.europe-west2.run.app
   ```

   **Redirect URLs** (Add both):
   ```
   https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback**
   http://localhost:3001/auth/callback**
   ```

   Note: The `**` wildcard allows query parameters like `?next=/auth/reset-password`

3. Click "Save"

### Step 2: Verify Email Templates

Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates

Check the "Magic Link" and "Change Email" templates use this format:
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .TokenType }}&next={{ .RedirectTo }}
```

But Supabase should automatically handle this if redirect URLs are configured correctly.

### Step 3: Test the Flow

After configuration, test by:

1. Inviting a new user as admin
2. Check email for the link
3. Click the link
4. Should redirect to: `https://.../auth/callback?code=XXX&next=/auth/reset-password?new=true`
5. Should then redirect to: `https://.../auth/reset-password?new=true`
6. User can set password

### Step 4: Re-invite Failed Users

After configuration, re-invite any users who got stuck:

```bash
# Option 1: Via Admin Dashboard
# 1. Log in as super_admin
# 2. Go to User Management
# 3. Click "Reset Password" for the user

# Option 2: Via Supabase Dashboard
# 1. Go to Authentication → Users
# 2. Find the user
# 3. Click "Send recovery email"
```

## Alternative: Check Email Provider Settings

If the above doesn't work, check if your email provider (likely SendGrid or similar) is configured correctly in Supabase:

Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/settings/auth

Check:
- Email provider is enabled
- SMTP settings are correct (if custom)
- "Enable email confirmations" is ON

## Troubleshooting

### If users still see errors:

1. **Check browser console** for error messages
2. **Check network tab** to see what URL the email link actually contains
3. **Verify callback route** is accessible:
   ```bash
   curl -I https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback
   # Should return: HTTP/2 307
   ```

### Common Issues:

1. **Missing code parameter**: Redirect URL not whitelisted in Supabase
2. **Infinite redirect**: Code parameter present but exchange failing (check Supabase API keys)
3. **404 on callback**: Route not deployed (check latest build)

## Current Configuration Status

✅ Callback route created: `src/app/auth/callback/route.ts`
✅ Invite route updated: Uses callback URL
✅ Password reset updated: Uses callback URL
✅ Deployed: Commit d9016e2

⚠️ **ACTION REQUIRED**:
- [ ] Configure Site URL in Supabase Dashboard
- [ ] Add redirect URLs to whitelist
- [ ] Re-invite test user (thesavides@gmail.com)
- [ ] Verify flow works end-to-end

## Expected Email Link Format

After configuration, password reset emails should contain links like:

```
https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?code=LONG_CODE_HERE&next=/auth/reset-password?new=true
```

The code should be a long alphanumeric string (JWT-like format).

---

**Last Updated**: January 12, 2026, 20:00 UTC
**Status**: ⚠️ Configuration required in Supabase Dashboard
