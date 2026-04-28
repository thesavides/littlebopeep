# Supabase URL Configuration Fix

## Problem
Even with server-side API using hardcoded production URL, password reset emails still contain localhost URLs.

## Root Cause
Supabase configuration in the dashboard is overriding the `redirectTo` parameter.

---

## SOLUTION: Update Supabase Dashboard Configuration

### Step 1: Update Site URL
1. Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration
2. Find **Site URL** field
3. Change from: `http://localhost:8080` or `http://localhost:3001`
4. Change to: `https://little-bo-peep-327019541186.europe-west2.run.app`
5. Click **Save**

### Step 2: Update Redirect URLs
In the same page, find **Redirect URLs** section:
1. Remove any localhost URLs:
   - ❌ `http://localhost:8080/**`
   - ❌ `http://localhost:3001/**`

2. Add production URLs:
   - ✅ `https://little-bo-peep-327019541186.europe-west2.run.app/**`
   - ✅ `https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback**`
   - ✅ `https://little-bo-peep-327019541186.europe-west2.run.app/auth/reset-password`

3. Click **Save**

### Step 3: Check Email Templates
1. Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates
2. Click on **"Reset Password"** template
3. Verify the template uses: `{{ .ConfirmationURL }}`
4. **DO NOT** see any hardcoded localhost URLs in the template
5. If you see hardcoded URLs, replace them with `{{ .ConfirmationURL }}`

Example correct template:
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### Step 4: Test After Configuration Change
After updating Supabase settings:

1. Wait 1-2 minutes for configuration to propagate
2. Access site ONLY from production URL:
   - https://little-bo-peep-327019541186.europe-west2.run.app
3. Log in as admin (chris@ukuva.com)
4. Admin Dashboard → User Management
5. Click "Reset Password" for a test user
6. Check email - should now contain production URL

---

## Why This Happens

Supabase uses a hierarchy for determining redirect URLs:

1. **Site URL** (Dashboard setting) - HIGHEST PRIORITY
2. **Email Template** (If hardcoded) - MEDIUM PRIORITY
3. **redirectTo parameter** (In API call) - LOWEST PRIORITY

Even though our code has:
```typescript
redirectTo: 'https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?next=/auth/reset-password'
```

Supabase ignores this if Site URL is set to localhost.

---

## Alternative: Use Environment-Based Site URL

If you need to support both localhost (for development) and production, you can configure Supabase to use different URLs per environment:

### Option A: Use Request Origin Detection
Modify the API endpoint to detect the request origin:

```typescript
const origin = request.headers.get('origin') || request.headers.get('referer')
const isProduction = origin?.includes('run.app') || origin?.includes('your-domain.com')
const redirectUrl = isProduction
  ? 'https://little-bo-peep-327019541186.europe-west2.run.app'
  : 'http://localhost:8080'
```

**However**, this is NOT recommended because:
- The current issue shows admins accessing from localhost causes problems
- Better to enforce production URL always for admin operations

### Option B: Separate Supabase Projects
- Production Supabase project (configured for production URLs only)
- Development Supabase project (configured for localhost URLs)

**Current recommendation**: Keep the simple solution - configure Supabase for production URLs only.

---

## Verification Checklist

After updating Supabase configuration:

- [ ] Site URL is set to production URL (not localhost)
- [ ] Redirect URLs include production URLs only
- [ ] Email templates use `{{ .ConfirmationURL }}` (not hardcoded URLs)
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Tested password reset from PRODUCTION URL only
- [ ] Received email with production URL (not localhost)

---

## Project URLs Reference

- **Production URL**: `https://little-bo-peep-327019541186.europe-west2.run.app`
- **Supabase Project**: `oyfikxdowpekmcxszbqg`
- **Supabase URL Config**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration
- **Email Templates**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates

---

**Important**: Do NOT test password reset from localhost. Always test from production URL to verify the fix works correctly.
