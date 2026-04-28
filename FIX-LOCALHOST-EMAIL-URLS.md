# Fix Localhost URLs in Password Reset Emails

## Issue
Password reset emails are being sent with `localhost:8080` URLs instead of production URLs.

Example:
```
❌ Wrong: http://localhost:8080/auth/callback?code=...
✅ Correct: https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?code=...
```

## Root Cause
Supabase's "Site URL" configuration is set to localhost instead of the production URL.

## Solution

### Step 1: Update Supabase Site URL

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration

2. Find **"Site URL"** field

3. Change from:
   ```
   http://localhost:8080
   ```
   or
   ```
   http://localhost:3001
   ```

4. To:
   ```
   https://little-bo-peep-327019541186.europe-west2.run.app
   ```

5. Click **"Save"**

### Step 2: Verify Redirect URLs

While you're there, ensure **"Redirect URLs"** includes:
```
https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback**
http://localhost:3001/auth/callback**
```

Note: The wildcard `**` allows query parameters.

### Step 3: Check Email Templates (Optional)

Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates

The email templates should use:
```
{{ .SiteURL }}/auth/callback?...
```

NOT:
```
http://localhost:8080/auth/callback?...
```

Supabase automatically replaces `{{ .SiteURL }}` with the configured Site URL.

### Step 4: Test

After updating:

1. **Send new password reset** for thesavides@gmail.com:
   - Log in as super admin (chris@ukuva.com)
   - Go to Admin Dashboard → User Management
   - Click "Reset Password" for thesavides@gmail.com

2. **Check email**:
   - Email should contain: `https://little-bo-peep-327019541186...`
   - NOT: `http://localhost:8080...`

3. **Click link and verify it works**

## Why This Happened

When developing locally, Supabase was configured with `http://localhost:8080` as the Site URL. This needs to be changed to the production URL when deploying.

## For Local Development

If you want to test locally AND in production, you can:

1. Keep production Site URL as:
   ```
   https://little-bo-peep-327019541186.europe-west2.run.app
   ```

2. Add localhost to Redirect URLs:
   ```
   http://localhost:3001/auth/callback**
   http://localhost:8080/auth/callback**
   ```

3. When testing locally, password reset emails will use production URL, but you can manually change `little-bo-peep-...run.app` to `localhost:3001` in the link.

Or create a separate Supabase project for local development.

## Alternative: Environment-Specific Site URL

If you frequently switch between local and production, consider:

1. **Production Supabase Project**:
   - Site URL: `https://little-bo-peep-327019541186.europe-west2.run.app`

2. **Local Development Supabase Project** (separate):
   - Site URL: `http://localhost:3001`

This way you have isolation between environments.

## Verification Checklist

After fixing:

- [ ] Site URL in Supabase Dashboard shows production URL
- [ ] Send test password reset email
- [ ] Email contains production URL (not localhost)
- [ ] Click link and verify callback works
- [ ] User can set password successfully
- [ ] User can log in with new password

---

**Last Updated**: January 12, 2026, 20:15 UTC
**Status**: ⚠️ Requires Supabase Dashboard configuration change
**Priority**: HIGH - Blocks password reset flow
