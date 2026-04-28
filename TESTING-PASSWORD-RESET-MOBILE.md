# Testing Password Reset from Mobile Device

## ⚠️ CRITICAL: You MUST test from production URL only!

When testing password reset functionality from a mobile device, Supabase detects the origin URL you're accessing from and may use it in the email.

---

## ✅ Correct Testing Procedure

### Step 1: Access Production URL Only
On your mobile device, open browser and go to:
```
https://little-bo-peep-327019541186.europe-west2.run.app
```

**DO NOT** use:
- ❌ `http://localhost:8080`
- ❌ `http://192.168.x.x:8080` (local network IP)
- ❌ `http://10.0.0.x:8080` (local network IP)
- ❌ Any development server URL

### Step 2: Log in as Admin
- Email: `chris@ukuva.com`
- Password: `LittleBoP33p2026!`

### Step 3: Navigate to Admin Dashboard
- Go to Admin Dashboard → User Management

### Step 4: Reset Password for Test User
- Click "Reset Password" button for a test user
- Check your email

### Step 5: Verify Email URL
The email should contain:
```
https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?next=/auth/reset-password
```

**NOT:**
- ❌ `http://localhost:8080/...`
- ❌ `http://192.168.x.x:8080/...`

---

## Why This Matters

Even though our code has:
```typescript
// Server-side API with hardcoded production URL
const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
await supabaseAdmin.auth.resetPasswordForEmail(email, {
  redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
})
```

Supabase may still detect the **request origin** (the URL you're accessing from) and use it in some cases, especially if:
1. The redirect URL is not in the allowlist
2. There's a mismatch between origin and redirect URL
3. The email template is using the wrong variable

---

## Current Configuration

### ✅ Code: Correct
- Server-side API uses hardcoded production URL
- Located in: `/api/admin/reset-password/route.ts`

### ✅ Email Template: Correct
- Uses `{{ .RedirectTo }}` (verified)
- Located in: Supabase Dashboard → Authentication → Email Templates → Reset Password

### ❓ URL Configuration: Needs Verification
Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration

Verify:
1. **Site URL** is set to: `https://little-bo-peep-327019541186.europe-west2.run.app`
2. **Redirect URLs** includes: `https://little-bo-peep-327019541186.europe-west2.run.app/**`

If redirect URLs don't include the production URL, Supabase will **ignore** the `redirectTo` parameter and fall back to Site URL or request origin.

---

## Troubleshooting

### If email still shows localhost URLs:

1. **Check where you're accessing from**
   - Open browser on mobile
   - Look at URL bar
   - Must be: `https://little-bo-peep-327019541186.europe-west2.run.app`

2. **Check Supabase Redirect URLs allowlist**
   - Go to URL Configuration
   - Add production URL to allowlist if not present
   - Format: `https://little-bo-peep-327019541186.europe-west2.run.app/**`

3. **Wait for cache to clear**
   - Supabase may cache email templates
   - Wait 2-3 minutes after making changes
   - Try again

4. **Check browser cache**
   - Clear browser cache on mobile device
   - Close and reopen browser
   - Navigate to production URL again

---

## Alternative: Use Production URL as Bookmark

To ensure you always access from production:

1. On mobile browser, navigate to:
   ```
   https://little-bo-peep-327019541186.europe-west2.run.app
   ```

2. Bookmark this page or add to home screen

3. Always access via this bookmark

This ensures you never accidentally access via localhost or local IP.

---

## Expected Result

After following the correct procedure, the password reset email should contain:
```
https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback?next=/auth/reset-password
```

Click the link → redirects to production → user can reset password.

---

**Status**: Ready for testing from production URL on mobile device.
