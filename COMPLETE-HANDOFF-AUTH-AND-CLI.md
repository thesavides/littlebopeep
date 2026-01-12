# Complete Handoff: Authentication & CLI Access
**Date**: January 12, 2026
**Project**: Little Bo Peep
**Status**: Production Ready

---

## 🔐 Authentication System

### Current Super Admin

**User ID**: `66de4b16-7a81-4484-a460-35c2d2ac5a20`
**Email**: `chris@ukuva.com`
**Password**: `LittleBoP33p2026!` ⚠️  CHANGE AFTER FIRST LOGIN
**Role**: `super_admin`
**Status**: `active`

### Login URLs

- **Production**: https://little-bo-peep-327019541186.europe-west2.run.app/auth
- **Local Dev**: http://localhost:3001/auth

---

## 🗄️ Database Access

### Supabase Connection Details

**Project URL**: https://oyfikxdowpekmcxszbqg.supabase.co
**Project Ref**: `oyfikxdowpekmcxszbqg`
**Dashboard**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg

### API Keys

**Anon Key** (public, safe to commit):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U
```

**Service Role Key** (secret, DO NOT COMMIT):
- ⚠️  **SECURITY**: Service role key was exposed in git history (commits dbe4850)
- **ACTION REQUIRED**: Rotate this key in Supabase Dashboard → Settings → API
- **After rotation**: Update in Google Cloud Secret Manager (see below)

### Using Supabase in Scripts

```javascript
const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOi...'; // Use anon key for read operations
// For admin operations, get service role key from Secret Manager

// Example: Query user_profiles
function queryUserProfiles() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles?select=*`);

    const options = {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.end();
  });
}
```

---

## ☁️ Google Cloud CLI Access

### Project Details

**Project ID**: `little-bo-peep-483820`
**Project Number**: `327019541186`
**Region**: `europe-west2` (London)
**Service Name**: `little-bo-peep`

### Authentication

```bash
# Check if authenticated
gcloud auth list

# If not authenticated, log in
gcloud auth login

# Set correct project
gcloud config set project little-bo-peep-483820

# Verify project is set
gcloud config get-value project
```

### Common Commands

#### Cloud Run Service

```bash
# View service details
gcloud run services describe little-bo-peep --region=europe-west2

# List all services
gcloud run services list

# View logs
gcloud run logs read little-bo-peep --region=europe-west2 --limit=50

# Deploy manually (if needed)
gcloud run deploy little-bo-peep \
  --source=. \
  --region=europe-west2 \
  --platform=managed \
  --allow-unauthenticated
```

#### Cloud Build

```bash
# List recent builds
gcloud builds list --limit=10

# View build details
gcloud builds describe BUILD_ID

# View build logs
gcloud builds log BUILD_ID

# Stream logs for running build
gcloud beta builds log BUILD_ID --stream

# Cancel a build
gcloud builds cancel BUILD_ID
```

#### Secret Manager

```bash
# List all secrets
gcloud secrets list

# View secret value (requires permission)
gcloud secrets versions access latest --secret="SECRET_NAME"

# Create new secret
echo -n "SECRET_VALUE" | gcloud secrets create SECRET_NAME \
  --data-file=- \
  --replication-policy="automatic"

# Add new version to existing secret
echo -n "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-

# Grant service account access to secret
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:327019541186-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Current Secrets in Secret Manager

```bash
# View current secrets
gcloud secrets list

# Expected secrets:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# TODO: Add SUPABASE_SERVICE_ROLE_KEY (after rotating)
```

---

## 🔄 Using CLI Tools in Scripts

### Always Use gcloud CLI for Deployments

**DON'T** try to use REST APIs for deployments.
**DO** use gcloud commands.

```bash
# Example: Deploy with secrets
gcloud run deploy little-bo-peep \
  --source=. \
  --region=europe-west2 \
  --clear-env-vars \
  --update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest
```

### Always Use Service Role Key for Admin Operations

**DON'T** use anon key for write operations or RLS-bypassing reads.
**DO** use service role key from Secret Manager.

```bash
# Get service role key from Secret Manager
SERVICE_ROLE_KEY=$(gcloud secrets versions access latest --secret="SUPABASE_SERVICE_ROLE_KEY")

# Use in Node.js script
node -e "
const SERVICE_KEY = process.env.SERVICE_ROLE_KEY;
// ... rest of script
"
```

---

## 📊 Database Schema

### user_profiles Table

**Purpose**: Extended user data linked to Supabase Auth

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'walker',  -- 'walker' | 'farmer' | 'admin' | 'super_admin'
  status user_status NOT NULL DEFAULT 'active',  -- 'active' | 'suspended' | 'pending_verification' | 'password_reset_required'
  created_by UUID REFERENCES user_profiles(id),
  last_login_at TIMESTAMP WITH TIME ZONE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS Policies** (Fixed in migration 005):
- Users can read their own profile
- Admins can read all profiles
- Super admins can create/update/delete any profile
- Users can update own profile (except role)

### Other Tables

```
translations      - 1,000+ translation records (4 languages)
sheep_reports     - Empty, ready for use
reports          - Empty, ready for use
farmers          - Empty, ready for use
admin_credentials - Deprecated (old system), can be dropped
```

---

## 🚀 Deployment Process

### Automatic Deployment (Current Setup)

1. Push to `main` branch on GitHub
2. Cloud Build webhook triggers automatically
3. Buildpack builds Next.js app
4. Docker image pushed to Container Registry
5. Cloud Run service updated
6. New version live in ~3-5 minutes

### Monitoring Deployment

```bash
# Watch builds
watch -n 5 'gcloud builds list --limit=1'

# Or use this one-liner to wait for completion
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID --stream
```

### If Build Fails

1. **Check logs**:
   ```bash
   gcloud builds log BUILD_ID | tail -100
   ```

2. **Common issues**:
   - TypeScript errors → Fix locally, test with `npm run build`
   - Missing dependencies → Check `package.json`
   - Env vars → Check Secret Manager bindings in `cloudbuild.yaml`

3. **Test locally first**:
   ```bash
   npm run build    # Must succeed
   npm run lint     # Should pass
   ```

---

## 🧪 Testing Authentication

### Test Login via API

```javascript
// File: check-auth-user.js
const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOi...';

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/token?grant_type=password`);

    const data = JSON.stringify({ email, password });

    const options = {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const parsed = JSON.parse(responseData);
          console.log('✅ Login successful');
          console.log('User ID:', parsed.user.id);
          console.log('Email:', parsed.user.email);
          resolve(parsed);
        } else {
          console.log('❌ Login failed');
          console.log('Status:', res.statusCode);
          console.log('Error:', responseData);
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test
testLogin('chris@ukuva.com', 'LittleBoP33p2026!');
```

### Test in Production

```bash
# Run the test script
node check-auth-user.js

# Expected output:
# ✅ Login successful
# User ID: 66de4b16-7a81-4484-a460-35c2d2ac5a20
# Email: chris@ukuva.com
```

---

## 🔒 Security Checklist

### Immediate Actions Required

- [ ] **Rotate Supabase service role key** (exposed in git commit dbe4850)
  - Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/settings/api
  - Click "Reset" on service_role key
  - Copy new key
  - Update in Google Cloud Secret Manager:
    ```bash
    echo -n "NEW_SERVICE_ROLE_KEY" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
    ```

- [ ] **Change admin password** on first login

- [ ] **Review GitHub secret scanning alerts**
  - Go to: https://github.com/thesavides/littlebopeep/security
  - Acknowledge alerts after key rotation

### Best Practices

✅ **DO**:
- Use service role key for admin operations
- Store secrets in Google Cloud Secret Manager
- Use anon key for public client operations
- Test builds locally before pushing
- Use `gcloud` CLI for all Cloud operations

❌ **DON'T**:
- Commit service role keys to git
- Use anon key for write operations
- Skip local build testing
- Forget to rotate exposed keys
- Try to use REST APIs for Cloud Run deployments

---

## 📝 Common Tasks Quick Reference

### Add New Admin User

```bash
# 1. Via production UI (recommended)
# Log in as super_admin → Admin Dashboard → Invite User

# 2. Via Supabase Dashboard
# Authentication → Users → Add user → Set role in user_profiles table
```

### Reset User Password

```bash
# 1. Via Supabase Dashboard
# Authentication → Users → [user] → Send password recovery email

# 2. Via API (requires service role key)
# Use resetPassword function in unified-auth.ts
```

### View Database Data

```bash
# Option 1: Supabase Dashboard
# https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/editor

# Option 2: Via SQL Editor
# Dashboard → SQL Editor → New query

# Option 3: Via Node.js script
node -e "
const https = require('https');
// ... query code
"
```

### Check Production Status

```bash
# Service status
gcloud run services describe little-bo-peep --region=europe-west2 --format="value(status.url,status.conditions)"

# Recent logs
gcloud run logs read little-bo-peep --region=europe-west2 --limit=20

# Latest build
gcloud builds list --limit=1
```

---

## 🆘 Troubleshooting

### "Can't log in" Issue

1. **Check user exists**:
   ```bash
   node check-auth-user.js
   ```

2. **Check user_profiles**:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'chris@ukuva.com';
   ```

3. **Try password reset**:
   ```bash
   # In Supabase Dashboard → Authentication → Users
   # Click user → Send password recovery email
   ```

### "Build failing" Issue

1. **Check TypeScript errors**:
   ```bash
   npm run build
   ```

2. **View build logs**:
   ```bash
   BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
   gcloud builds log $BUILD_ID | tail -100
   ```

3. **Common fixes**:
   - Missing type definitions
   - Incorrect imports
   - RLS policy issues (use service role key)

### "RLS infinite recursion" Issue

This was fixed in migration 005. If it reoccurs:

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Recreate with LIMIT 1 to break recursion
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) IN ('admin', 'super_admin')
);
```

---

## 📖 Related Documentation

- **CRITICAL-BUILD-REQUIREMENTS.md** - Build system and secrets
- **DATABASE_STATUS_REPORT.md** - Current database state
- **UNIFIED_AUTH_MIGRATION.md** - Auth system architecture
- **NEXT_STEPS.md** - Migration steps completed

---

## 🎯 Quick Start for New Session

1. **Verify environment**:
   ```bash
   gcloud auth list
   gcloud config get-value project  # Should be: little-bo-peep-483820
   ```

2. **Test admin login**:
   ```bash
   node check-auth-user.js
   ```

3. **Check production**:
   ```bash
   gcloud builds list --limit=1
   curl https://little-bo-peep-327019541186.europe-west2.run.app
   ```

4. **Review database**:
   - Open: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/editor

---

**Last Updated**: January 12, 2026
**Status**: ✅ Ready for Production
**Blocker**: ⚠️  Rotate service role key (exposed in git)

---

## 🐛 COMMON BUILD ISSUES & SOLUTIONS

### Issue 1: "npm ci can only install with an existing package-lock.json"

**Symptom**: Docker build fails with error about missing package-lock.json

**Root Cause**: `package-lock.json` was in `.gitignore` and not committed

**Solution**:
```bash
# Remove from .gitignore
sed -i '/package-lock.json/d' .gitignore

# Add and commit
git add package-lock.json .gitignore
git commit -m "Add package-lock.json for Docker builds"
git push
```

**Status**: ✅ FIXED in commit 6dd4859

**Prevention**: NEVER add `package-lock.json` to `.gitignore`

---

### Issue 2: Buildpacks Timing Out

**Symptom**: Build gets stuck at "Building Container..." and eventually fails

**Root Cause**: Google Cloud buildpacks are unreliable for complex Next.js apps

**Solution**: Switch to Docker builds (see Dockerfile)

**Status**: ✅ FIXED in commit e72db39

**Implementation**:
- Created multi-stage Dockerfile
- Updated cloudbuild.yaml to use Docker
- Increased machine resources (E2_HIGHCPU_8)

---

### Issue 3: TypeScript Build Errors in Cloud

**Symptom**: Build works locally but fails in Cloud Build with TypeScript errors

**Root Cause**: Type mismatches between unified-auth and appStore

**Fixes Applied**:
1. **AdminUserManagement.tsx**: `getAllUsers()` returns array, not `{ success, users, error }`
2. **Header.tsx**: Added `'admin' | 'super_admin'` to `userPrimaryRole` type
3. **appStore.ts**: Updated `UserRole` to include `'super_admin'`
4. **reset-password/page.tsx**: Marked as `dynamic = 'force-dynamic'`

**Status**: ✅ FIXED in commit ed59a70

**Always test before pushing**:
```bash
npm run build  # Must succeed
npm run lint   # Should pass
```

---

### Issue 4: Exposed Secrets in Git

**Symptom**: GitHub secret scanning alert

**Root Cause**: Service role key hardcoded in scripts (commits dbe4850, 3404f77)

**Immediate Actions Taken**:
1. ✅ Removed files with exposed keys (commit 3404f77)
2. ✅ Files deleted: `set-password-simple.js`, `reset-admin-password.js`, etc.

**Still Required**:
- [ ] Rotate Supabase service role key in dashboard
- [ ] Update rotated key in Google Cloud Secret Manager
- [ ] Acknowledge GitHub security alerts

**Prevention**:
- Always use Secret Manager for sensitive keys
- Never hardcode service role keys
- Use anon key for client operations only

---

## 📋 Build Troubleshooting Checklist

When a build fails, check these in order:

1. **Test Locally First**:
   ```bash
   npm run build
   ```
   If this fails, fix it before pushing.

2. **Check Git Status**:
   ```bash
   git status
   git ls-files package-lock.json  # Should return file path
   ```

3. **View Build Logs**:
   ```bash
   BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
   gcloud builds log $BUILD_ID | tail -100
   ```

4. **Check Dockerfile**:
   - Verify `package.json` and `package-lock.json` are copied
   - Ensure `npm ci` comes before `npm run build`
   - Check Node version matches local

5. **Check cloudbuild.yaml**:
   - Verify secrets are correctly bound
   - Check machine type is sufficient
   - Ensure timeout is adequate

6. **Check Secret Manager**:
   ```bash
   gcloud secrets list
   gcloud secrets versions access latest --secret="NEXT_PUBLIC_SUPABASE_URL"
   ```

---

## 🎯 Known Working Configuration

**Last Successful Deploy**: Commit 4c035a8 (January 12, 2026)

**Current Attempts** (Failed):
- e72db39: Docker build setup (fixed buildpacks issue)
- 6dd4859: Added package-lock.json (fixing npm ci issue)
- **Next**: Should succeed

**Build Configuration**:
```yaml
# cloudbuild.yaml
steps:
  - Docker build
  - Docker push
  - gcloud run deploy

options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY

timeout: '1800s'
```

**Dockerfile**:
- Base: `node:18-alpine`
- Multi-stage: deps → builder → runner
- Output: standalone
- User: non-root (nextjs:nodejs)

---

**Last Updated**: January 12, 2026 19:25 UTC
**Build Status**: 🔄 In Progress (commit 6dd4859)
**Expected Result**: ✅ Should succeed with package-lock.json added

