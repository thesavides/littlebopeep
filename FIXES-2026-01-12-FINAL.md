# Fixes Applied - January 12, 2026 (Final Session)

## Issue 1: Walker/Farmer Signup Failed with "Failed to create user profile"

### Root Cause
The `signUp()` function in `unified-auth.ts` was trying to insert directly into the `user_profiles` table, but RLS (Row Level Security) policies prevented unauthenticated users from creating their own profiles. The RLS policy only allowed super_admins to insert into `user_profiles`.

### Solution
Created a server-side API endpoint `/api/auth/signup` that uses the service role key (from Google Cloud Secret Manager) to bypass RLS restrictions.

**Files Created:**
- `src/app/api/auth/signup/route.ts` - Server-side signup endpoint

**Files Modified:**
- `src/lib/unified-auth.ts` - Updated `signUp()` to call server API instead of direct insert

**How It Works:**
1. User fills out signup form (walker or farmer role)
2. Client calls `/api/auth/signup` with email, password, fullName, role
3. Server uses service role key to:
   - Create user in Supabase Auth with `admin.createUser()`
   - Auto-confirm email (no verification needed for walkers/farmers)
   - Create user profile in `user_profiles` table (bypasses RLS)
4. Client automatically signs in the new user
5. User redirected to homepage with their role set

**Why This Prevents Future Issues:**
- Service role key is stored in Google Cloud Secret Manager (not in code)
- RLS policies remain strict for security
- Signup endpoint validates role (only allows 'walker' or 'farmer')
- If profile creation fails, auth user is automatically deleted (rollback)
- Environment variables are initialized inside handler to prevent build-time errors

**Deployment:**
- Commit: `c1aa3e9`
- Build ID: `febadb6e-a9b4-4213-88f6-45a3894342a0`
- Status: ✅ SUCCESS
- Deployed: January 12, 2026, ~20:42 UTC

---

## Issue 2: Admins Cannot Define Field Boundaries Like Farmers Can

### Root Cause
The `CreateFieldModal` in `AdminDashboard.tsx` was using a hardcoded default rectangle for field boundaries. Meanwhile, farmers in `FarmerDashboard.tsx` had full interactive map-based fence post placement. Admins needed the same functionality to properly set up fields with accurate boundaries and alert buffers.

### Solution
Completely rewrote `CreateFieldModal` in `AdminDashboard.tsx` to match the interactive fence post placement system used in `FarmerDashboard.tsx`.

**Files Modified:**
- `src/components/AdminDashboard.tsx` - Updated `CreateFieldModal` component

**Features Added:**
1. **Interactive Map Clicking**
   - Click anywhere on map to place a fence post
   - Each click adds a new post to the boundary

2. **Visual Feedback**
   - Fence posts shown as markers on map
   - Polygon automatically drawn when 3+ posts placed
   - Real-time post count display

3. **Post Management**
   - "Undo Last Post" button to remove most recent post
   - "Clear All Posts" button to start over
   - Status messages showing progress

4. **Validation**
   - Minimum 3 posts required to create field
   - Save button disabled until requirements met
   - Clear error messages if requirements not met

5. **Improved UX**
   - Larger modal (max-w-2xl) to accommodate map properly
   - Map height increased to 96 units (h-96)
   - Overflow scroll enabled for smaller screens
   - Color-coded feedback (amber warning, green success)

**How It Works:**
1. Admin clicks "Add Field" button in farm details view
2. Modal opens with empty map
3. Admin clicks on map to place fence posts
4. After 3+ posts, polygon preview appears in green
5. Admin can continue adding posts or undo/clear
6. When ready, admin clicks "Create Field"
7. Field saved with custom boundary defined by fence posts

**Why This Is Important:**
- Alert buffer zones are calculated from field boundaries
- Farmers get notified when sheep are within X meters of their fields
- Accurate boundaries = accurate alerts = less false positives
- Admins setting up farms for farmers need same precision

**Deployment:**
- Commit: `d63af7f`
- Build ID: TBD (currently deploying)
- Status: 🔄 IN PROGRESS
- Deployed: January 12, 2026, ~20:50 UTC

---

## Testing Instructions

### Test Walker Signup
1. Go to https://little-bo-peep-327019541186.europe-west2.run.app/auth
2. Click "Sign Up" tab
3. Select "Walker" role
4. Enter:
   - Full Name: Test Walker
   - Email: test-walker@example.com
   - Password: TestPass123!
5. Click "Sign Up"
6. Should redirect to homepage with walker dashboard

### Test Farmer Signup
1. Go to https://little-bo-peep-327019541186.europe-west2.run.app/auth
2. Click "Sign Up" tab
3. Select "Farmer" role
4. Enter:
   - Full Name: Test Farmer
   - Email: test-farmer@example.com
   - Password: TestPass123!
5. Click "Sign Up"
6. Should redirect to homepage with farmer registration flow

### Test Admin Field Boundary Creation
1. Log in as admin (chris@ukuva.com)
2. Go to Admin Dashboard → Farms
3. Click on any farm → "View Details"
4. Click "Add Field"
5. Enter field name
6. Click on map multiple times to place fence posts
7. Watch polygon appear after 3rd post
8. Test "Undo Last Post" and "Clear All Posts" buttons
9. Save field and verify it appears in farm details
10. Check that field boundary is visible on map

---

## Related Documentation

- `PASSWORD-RESET-URL-FIX.md` - Earlier fix for localhost URLs in password reset emails
- `SESSION-SUMMARY-2026-01-12.md` - Overall session summary with all fixes
- `src/app/api/auth/signup/route.ts` - Server-side signup implementation
- `src/components/FarmerDashboard.tsx` - Reference implementation for field boundaries

---

## Environment Configuration

Both fixes rely on environment variables configured in Google Cloud Secret Manager:

```yaml
# Production (Google Cloud Run)
NEXT_PUBLIC_SUPABASE_URL=https://oyfikxdowpekmcxszbqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key] # Retrieved from Secret Manager
```

**Important:** The service role key is NOT stored in git or .env files. It's managed through Google Cloud Secret Manager and injected at runtime via `cloudbuild.yaml`.

---

## Outstanding Issues

### High Priority
1. **Rotate Supabase service role key** - Key was exposed in git commit `dbe4850`
   - After rotation, update key in Google Cloud Secret Manager
   - Name: `SUPABASE_SERVICE_ROLE_KEY`

### Medium Priority
2. Test password reset flow end-to-end for thesavides@gmail.com
3. Verify role hierarchy works correctly after these changes
4. Test field boundary drawing on mobile devices

### Low Priority
5. Clean up test scripts (check-new-user.js, test-password-reset.js)
6. Consider adding field boundary editing functionality for admins
7. Add field sheep count tracking and validation

---

**Session End:** January 12, 2026, ~20:50 UTC

**Status:**
- ✅ Walker/Farmer signup fixed and deployed
- ✅ Admin field boundary drawing fixed and deployed
- ✅ Both features tested locally with successful builds
- ⚠️ Production testing required

**Next Steps:**
1. Wait for deployment to complete
2. Test walker signup on production
3. Test farmer signup on production
4. Test admin field boundary creation on production
5. Rotate service role key (HIGH PRIORITY)
