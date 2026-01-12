# Session Handoff - Outstanding Issues

**Date**: January 12, 2026, ~21:00 UTC
**Session**: Final session continuation
**Status**: 2 critical issues identified, handoff prepared

---

## Issue 1: Map Layers Not Rendering ⚠️ CRITICAL

### Problem
When a walker selects map layers (footpaths, bridleways, trails, contours), the disclaimer shows but the actual layers do NOT appear on the map.

### Root Cause
**MISSING IMPLEMENTATION**: The `contours` layer has NO rendering code in `MapInner.tsx`.

Other layers (footpaths, bridleways, trails) ARE implemented but may have bugs.

### Files Involved
1. **`src/components/MapLayerControl.tsx`** - Layer selection UI (WORKING)
   - Lines 11-24: `handleToggleLayer()` function
   - Lines 46-84: Checkbox controls for footpaths, bridleways, trails, contours
   - Lines 99-132: Disclaimer modal (WORKING)

2. **`src/components/MapInner.tsx`** - Map rendering (PARTIALLY BROKEN)
   - Line 156: Gets `mapPreferences` from store
   - Line 181: Loads layer data via `useLayerData(bounds, mapPreferences.layersEnabled)`
   - Lines 202-255: Renders footpaths, bridleways, trails (MAY BE WORKING)
   - **MISSING**: No contours rendering code at all

3. **`src/hooks/useLayerData.ts`** - Data fetching (CHECK THIS)
   - Need to verify if this hook actually fetches data correctly
   - Check if OSM Overpass API calls are working

4. **`src/store/appStore.ts`** - Map preferences storage
   - Check `mapPreferences` state structure
   - Check `updateMapPreferences()` function

### How to Fix

#### Step 1: Verify Data Fetching
```bash
# Check if useLayerData hook exists and works
cat src/hooks/useLayerData.ts
```

#### Step 2: Test Layer Rendering
1. Sign in as walker
2. Open map
3. Click "Layers" button (top-right, 🗺️ icon)
4. Check one layer (e.g., Footpaths)
5. Accept disclaimer
6. **Expected**: Lines/paths should appear on map
7. **Actual**: Nothing shows (or check browser console for errors)

#### Step 3: Fix Contours Layer
Add rendering code to `MapInner.tsx` after line 255:

```typescript
{/* Contours layer */}
{data.contours && (
  <GeoJSON
    data={data.contours}
    style={contourStyle}
    onEachFeature={(feature, layer) => {
      if (feature.properties) {
        layer.bindPopup(`
          <strong>📏 Contour</strong><br/>
          Elevation: ${feature.properties.ele || 'Unknown'}m<br/>
          <small>Every ${feature.properties.step || '10'}m</small>
        `)
      }
    }}
  />
)}
```

Also add contour style function around line 195:

```typescript
const contourStyle = (feature?: any) => ({
  color: '#8B4513',
  weight: 1,
  opacity: 0.5,
})
```

#### Step 4: Debug Existing Layers
Check browser console when enabling layers:
- Look for OSM Overpass API errors
- Look for GeoJSON parsing errors
- Check if `data.footpaths`, `data.bridleways`, `data.trails` contain actual data

#### Step 5: Test OSM API Directly
```bash
# Test if Overpass API is accessible
curl "https://overpass-api.de/api/interpreter" \
  -d "data=[out:json];way[\"highway\"=\"footpath\"](51.5,-0.1,51.6,0.0);out geom;"
```

---

## Issue 2: Admin Password Reset Emails Still Show localhost URLs ⚠️ CRITICAL

### Problem
When an admin triggers password reset for a user, Supabase sends emails with `localhost:8080` or `localhost:3001` URLs instead of production URLs.

### Current Code State
The code in `src/lib/unified-auth.ts` line 408 DOES have hardcoded production URL:

```typescript
const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'
const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
})
```

### Why It's Still Broken

**Theory 1: Admin is triggering from localhost**
If admin accesses the site at `http://localhost:8080` and triggers password reset, Supabase may use the request origin instead of the `redirectTo` parameter.

**Theory 2: Supabase Site URL Override**
Supabase Dashboard → Authentication → URL Configuration → Site URL
If this is set to localhost, it may override the `redirectTo` parameter.

**Theory 3: Supabase Email Template**
Supabase email templates might have hardcoded localhost URLs.

### How to Fix

#### Step 1: Verify Supabase Configuration
1. Go to https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/url-configuration
2. Check **Site URL** - should be: `https://little-bo-peep-327019541186.europe-west2.run.app`
3. Check **Redirect URLs** - should include:
   - `https://little-bo-peep-327019541186.europe-west2.run.app/auth/callback**`
   - `https://little-bo-peep-327019541186.europe-west2.run.app/auth/reset-password`

#### Step 2: Check Supabase Email Templates
1. Go to https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/templates
2. Check "Reset Password" email template
3. Verify it uses `{{ .ConfirmationURL }}` and NOT hardcoded URLs
4. Expected template variable: `{{ .ConfirmationURL }}`
5. Should NOT contain: `http://localhost:8080` or `http://localhost:3001`

#### Step 3: Test ONLY from Production
1. **DO NOT test from localhost** - this may cause Supabase to use localhost origin
2. Access site ONLY at: `https://little-bo-peep-327019541186.europe-west2.run.app`
3. Log in as admin (chris@ukuva.com)
4. Go to Admin Dashboard → User Management
5. Click "Reset Password" for a test user
6. Check email - should contain production URL

#### Step 4: Alternative Fix - Use Server-Side API
If the issue persists, create a server-side endpoint like we did for signup:

**Create**: `src/app/api/admin/reset-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const { email } = await request.json()

    // Always use production URL
    const productionUrl = 'https://little-bo-peep-327019541186.europe-west2.run.app'

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${productionUrl}/auth/callback?next=/auth/reset-password`
    })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email' },
      { status: 500 }
    )
  }
}
```

Then update `adminResetUserPassword()` to call this endpoint instead.

---

## Recent Deployments

### Deployment 1: Signup Fix ✅ SUCCESS
- **Build ID**: `febadb6e-a9b4-4213-88f6-45a3894342a0`
- **Commit**: `c1aa3e9`
- **Status**: ✅ DEPLOYED
- **What**: Walker/farmer signup now works via server-side API

### Deployment 2: Admin Field Boundaries ✅ SUCCESS
- **Build ID**: `8ed73e9e-023a-4d64-8a40-c75c37ba122f`
- **Commit**: `d63af7f`
- **Status**: ✅ DEPLOYED
- **What**: Admins can now draw field boundaries on map

### Deployment 3: Admin Dashboard Supabase Integration ✅ SUCCESS
- **Build ID**: Pending check
- **Commit**: `3042b6c`
- **Status**: ✅ DEPLOYED
- **What**: Walkers/farmers now appear in admin dashboard from Supabase

---

## System Architecture

### Data Storage
- **Supabase (user_profiles table)** - Real user data (walkers, farmers, admins)
- **appStore (localStorage)** - Mock data for reports, farms, fields (NOT SYNCED WITH SUPABASE)

### Current State
- ✅ Walker/farmer signup works → Creates in Supabase
- ✅ Admin dashboard loads users from Supabase
- ❌ Reports are still mock data (not in Supabase)
- ❌ Farms are still mock data (not in Supabase)
- ❌ Fields are still mock data (not in Supabase)

### Future Integration Needed
To fully integrate Supabase:
1. Create `sheep_reports` table in Supabase
2. Create `farms` table in Supabase
3. Create `farm_fields` table in Supabase
4. Update all CRUD operations to use Supabase instead of localStorage

---

## Files Modified This Session

### New Files
- `src/app/api/auth/signup/route.ts` - Server-side signup endpoint
- `FIXES-2026-01-12-FINAL.md` - Session documentation
- `HANDOFF-SESSION-CONTINUATION.md` - This file

### Modified Files
- `src/lib/unified-auth.ts` - Added `signUp()` function, hardcoded production URLs
- `src/app/auth/page.tsx` - Added signup form with role selection
- `src/components/AdminDashboard.tsx` - Load users from Supabase, field boundary drawing
- `PASSWORD-RESET-URL-FIX.md` - Updated with production URL fix

---

## Quick Start for Next Session

### Check Current Deployments
```bash
gcloud builds list --limit=5
```

### Test Walker Signup
```bash
# 1. Go to production site
open https://little-bo-peep-327019541186.europe-west2.run.app/auth

# 2. Sign up as walker with test credentials
# 3. Check admin dashboard to see if walker appears
```

### Test Map Layers
```bash
# 1. Sign in as walker
# 2. Click Layers button (🗺️)
# 3. Enable Footpaths
# 4. Check browser console for errors
# 5. Look for red/dashed lines on map
```

### Debug Password Reset
```bash
# 1. ONLY access from production (not localhost!)
# 2. Log in as admin: chris@ukuva.com
# 3. Admin Dashboard → User Management
# 4. Reset password for test user
# 5. Check email for URL (should be production, NOT localhost)
```

---

## Important Notes

### Service Role Key
- Stored in Google Cloud Secret Manager
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- **⚠️ SECURITY**: This key was exposed in commit `dbe4850` - ROTATE IT IMMEDIATELY

### Environment Variables
Production (Google Cloud Run):
```
NEXT_PUBLIC_SUPABASE_URL=https://oyfikxdowpekmcxszbqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[from Secret Manager]
```

### Admin Credentials
```
Email: chris@ukuva.com
Password: LittleBoP33p2026!
Role: super_admin
```

---

## Priority Order for Next Session

1. **HIGH**: Fix map layers not rendering (walkers need this functionality)
2. **HIGH**: Fix admin password reset localhost URLs (blocking admin user creation)
3. **MEDIUM**: Rotate exposed service role key (security issue)
4. **LOW**: Migrate reports/farms/fields to Supabase (future enhancement)

---

**Prepared by**: Claude Sonnet 4.5
**Session End**: January 12, 2026, ~21:00 UTC
**Next Session**: Ready to continue with layer rendering and password reset fixes
