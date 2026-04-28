# Password Reset Email Template Fix

## Problem
Password reset emails still show localhost URLs even after:
1. ✅ Site URL is set to production in Supabase
2. ✅ Server-side API uses hardcoded production URL
3. ✅ Email template was changed from `{{ .ConfirmationURL }}` to `{{ .RedirectTo }}`

## Root Cause (from Supabase Docs)
According to https://supabase.com/docs/guides/auth/redirect-urls:

When using password reset with `redirectTo` parameter, the email template needs:
- `{{ .RedirectTo }}` instead of `{{ .ConfirmationURL }}`
- Optionally include `{{ .TokenHash }}` and `type` parameters

## Correct Email Template

The Supabase "Reset Password" email template should be:

### Option 1: Simple (Recommended)
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .RedirectTo }}">Reset Password</a></p>
```

### Option 2: With Token Hash (More Secure)
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

### Option 3: Full URL Construction
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}">Reset Password</a></p>
```

## Current API Code
Our API endpoint `/api/admin/reset-password` sends:

```typescript
await supabaseAdmin.auth.resetPasswordForEmail(email, {
  redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
})
```

Where `productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'`

## Template Variables Reference

From Supabase documentation:

- `{{ .SiteURL }}` - Default site URL from Supabase config (might be localhost)
- `{{ .RedirectTo }}` - The URL passed in `redirectTo` parameter (our production URL)
- `{{ .ConfirmationURL }}` - Auto-generated confirmation URL (uses Site URL)
- `{{ .TokenHash }}` - Token hash for verification
- `{{ .Token }}` - Legacy token (deprecated)
- `{{ .Type }}` - Type of email (recovery, signup, etc.)

## Verification Steps

1. Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates
2. Click "Reset Password" template
3. Verify line 4 uses `{{ .RedirectTo }}` NOT `{{ .ConfirmationURL }}`
4. Save changes
5. Wait 1-2 minutes for changes to propagate
6. Test password reset from production URL only
7. Check email - should contain production URL

## Testing

```bash
# Test from production only (not localhost!)
node test-password-reset-production.js
```

Expected email URL: `https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?next=/auth/reset-password`

**DO NOT** test from localhost - this may cause Supabase to use localhost origin.

---

**Status**: Waiting for screenshot to verify current template configuration.
