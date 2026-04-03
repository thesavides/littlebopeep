# Little Bo Peep — Functionality Reference

**Version**: v3.0.0
**Last Updated**: April 2026
**Production**: https://littlebopeep.chris-bee.workers.dev
**Platform**: Next.js 16.2.2 + Cloudflare Workers + Supabase

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack](#2-tech-stack)
3. [Role Hierarchy](#3-role-hierarchy)
4. [User Guide — Walkers](#4-user-guide--walkers)
5. [User Guide — Farmers](#5-user-guide--farmers)
6. [User Guide — Admins & Super Admins](#6-user-guide--admins--super-admins)
7. [PWA & Offline Mode](#7-pwa--offline-mode)
8. [Technical Architecture](#8-technical-architecture)
9. [Database Schema](#9-database-schema)
10. [Deployment](#10-deployment)

---

## 1. Platform Overview

Little Bo Peep connects people walking in the countryside with farmers who need to recover lost or straying livestock. Walkers spot an animal, drop a pin, take a photo and submit a report. Farmers are alerted, claim the report, and recover the animal. Admins manage the user base and platform settings.

The platform is designed for use in the hills and valleys of Wales, England, and Scotland — environments where mobile connectivity is unreliable. A Progressive Web App (PWA) layer allows walkers to capture sightings fully offline and sync automatically when signal returns.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router), React 19, TypeScript |
| Deployment | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Supabase (PostgreSQL + Realtime subscriptions) |
| Authentication | Supabase Auth with `user_profiles` table |
| State Management | Zustand with `persist` middleware (localStorage) |
| Maps | React-Leaflet 5 + OpenStreetMap tiles |
| Styling | Tailwind CSS |
| Offline Storage | IndexedDB (browser-native, no library) |
| Service Worker | Custom `public/sw.js` — no build-time dependency |
| Photo Storage | Supabase Storage (uploaded from client) |

---

## 3. Role Hierarchy

Every user has one of four roles. Higher roles inherit all permissions of the roles below them.

```
super_admin
    └── admin
            └── farmer
                    └── walker
```

| Role | Can Report | Can Claim Reports | Can Manage Farms | Can Manage Users | Can Invite Users |
|---|:---:|:---:|:---:|:---:|:---:|
| Walker | ✅ | — | — | — | — |
| Farmer | ✅ | ✅ | ✅ | — | — |
| Admin | ✅ | ✅ | ✅ | ✅ (walkers/farmers) | — |
| Super Admin | ✅ | ✅ | ✅ | ✅ (all) | ✅ |

> Walkers are only walkers.
> Farmers are also walkers.
> Admins and Super Admins are also farmers and walkers.

---

## 4. User Guide — Walkers

### Who is a Walker?

A walker is anyone who reports livestock sightings. They may have an account, or they may report as a guest (no login required). Walkers with accounts can track the status of their past reports.

---

### 4.1 Reporting a Sighting (online)

The report flow has 4 steps:

**Step 1 — Location**
- The map shows your current area with recent reports from the past 12 hours shown as pins.
- Tap anywhere on the map to drop a pin at the exact location of the sighting.
- Use the **Locate Me** button to auto-centre the map on your GPS position.
- A warning shows if another report exists within 100m in the last 12 hours — check if it already matches what you've seen.

**Step 2 — Details**
- **Category**: Sheep is the default. If your admin has configured other categories (fences, roads, etc.), they appear here.
- **Condition**: Select from the condition options configured for the category (e.g. Healthy, Injured, Dead, Unknown for sheep).
- **Quantity**: Enter how many animals or instances you can see. The label changes based on category.
- **Additional details**: Free-text field for extra description (ear tags, markings, exact landmark, etc.).
- **Photos**: Optionally attach up to 3 photos using your camera or photo library (JPEG, PNG, WebP, max 5MB each).

**Step 3 — Contact**
- Logged-in users: your account is linked to the report automatically. The contact step is brief.
- Guest users: optionally provide your name, email, and phone number. Leave blank to report anonymously. Contact details are only shared with the relevant farmer.

**Step 4 — Confirm**
- Review a summary of all details before submitting.
- Tap **Submit Report** to send. The report immediately appears on the map.

---

### 4.2 Reporting Other Categories

If your admin has added custom categories (e.g. damaged fences, road hazards):

1. On the dashboard, tap **Report Other**
2. A grid of available categories appears — tap the one that matches
3. The report flow starts with that category's name, conditions, and count label

> The **Report Other** button only appears when custom categories have been configured. If it's not visible, only sheep reporting is active.

---

### 4.3 My Reports

Tap **My Reports** on the walker dashboard to see all reports you've submitted (requires an account). Each report shows:

- Category and count
- Location coordinates and timestamp
- Current status: **Reported** → **Claimed** → **Resolved**
- Condition and any description you added

---

### 4.4 Language

Little Bo Peep supports **English, Welsh (Cymraeg), Irish (Gaeilge), and Scottish Gaelic (Gàidhlig)**. Use the language selector in the header to switch at any time. Your preference is saved and persists across sessions.

---

## 5. User Guide — Farmers

Farmers have all walker permissions plus the ability to manage farms, claim reports, and resolve them once the animal is recovered.

---

### 5.1 Farm Management

**Adding a Farm**
1. Go to the Farms section of the Farmer Dashboard
2. Tap **+ Add Farm**
3. Enter a farm name and set the alert buffer distance (default 500m — this is the radius outside your field boundaries that triggers an alert)
4. Enable or disable alerts for the farm
5. Tap **Create Farm** — you can add fields after creation

**Adding Fields to a Farm**
1. Select a farm and tap **+ Add Field**
2. Draw the field boundary on the map by tapping to place boundary points
3. Name the field
4. Save — the field boundary is stored and used for proximity-based alerts

**Editing / Deleting**
- Tap a farm to expand it and see all fields
- Edit farm name, alert buffer, or alert toggle at any time
- Delete fields individually or delete the entire farm

---

### 5.2 Claiming a Report

When a sheep or other animal is reported near your farm:

1. Go to the **Reports** section of your dashboard
2. Reports with status **Reported** are unclaimed — tap one to view details
3. Tap **Claim this Report** to mark it as yours
4. Status changes to **Claimed** — other farmers see it is being handled
5. Once you've recovered the animal, tap **Mark as Resolved**

---

### 5.3 Report Status Flow

```
Reported  →  Claimed (by farmer)  →  Resolved
```

Archived reports are hidden from the active map but remain in history.

---

### 5.4 Farmers as Walkers

Farmers can also submit reports themselves. The walker report flow is fully available from the farmer dashboard. This is useful when a farmer spots something on a neighbouring property or while out in the field.

---

## 6. User Guide — Admins & Super Admins

Admins and Super Admins access the **Admin Dashboard** after logging in. The dashboard has eight sections navigated via the top tab bar.

---

### 6.1 Overview

The overview shows live platform statistics:

- Active reports (Reported / Claimed / Resolved / Archived)
- Total walkers and farmers
- Recent activity feed

A full-screen map centred on the admin's current GPS location shows all active reports as pins. The map auto-centres to your location on load.

---

### 6.2 Walkers Tab

A table of all registered walkers showing:

- Email (clickable to open user detail)
- Full name and phone
- Status (Active / Suspended / Pending / Reset Required)
- Last login date
- Number of reports submitted

**User Detail Modal**
Click any email to open the detail view:
- All profile information
- Reports submitted (clickable rows navigating to the Reports tab)
- Edit name and phone in-place
- Quick actions: Suspend, Activate, Send Password Reset

---

### 6.3 Farmers Tab

Identical layout to the Walkers tab but filtered for farmer-role users. Shows:

- Email, name, phone, status, last login
- Number of farms registered

**User Detail Modal** for farmers also shows:
- Farms list (clickable rows navigating to the Farms tab)
- Edit name and phone
- Suspend / Activate / Password Reset actions

---

### 6.4 Reports Tab

Full report management table:

| Column | Description |
|---|---|
| Category | Emoji + category name |
| Count | Number of animals/items |
| Location | Lat/lng coordinates |
| Condition | Reported condition |
| Status | Reported / Claimed / Resolved |
| Reporter | Who submitted it |
| Date | Timestamp |
| Actions | Archive, Delete |

**Filtering & Sorting**
- Filter by status: All / Reported / Claimed / Resolved
- Filter by archive state: Active / Archived / All
- Sort by date (newest first) or days unclaimed (longest waiting first)
- Filter by current map viewport — only shows reports visible on screen

**Bulk Operations**
- Select multiple reports with checkboxes
- Bulk archive or bulk delete selected reports

---

### 6.5 Farms Tab

View and manage all farms registered on the platform:

- Farm name, owner, number of fields, alert status
- Expand to see individual fields
- Add new farms (Farmer Owner dropdown includes admins and super admins)
- Edit farm details or delete farms
- Add, edit, and delete fields within farms

---

### 6.6 Billing Tab

Placeholder for future subscription and billing management. Currently reserved.

---

### 6.7 Admin Users Tab

Manage admin-level accounts (admin and super_admin roles only):

- Table of all admin users with role, status, and last login
- **Change Password** button for the currently logged-in admin
- *Super Admins only:*
  - **Invite User** — create new user at any role level; they receive a password-setup email
  - **Suspend / Activate** accounts
  - **Reset** — send a password reset email to another admin

---

### 6.8 Categories Tab

Configure custom report categories beyond the default Sheep category.

**Adding a Category**
1. Tap **+ New Category**
2. Click the emoji button to open the emoji picker (grouped by Animals, Infrastructure, Nature, Hazards, General) or type/paste a custom emoji
3. Enter a name (e.g. "Damaged Fence", "Road Hazard")
4. Optionally add a description shown to walkers
5. Add **condition options** (e.g. "Minor", "Severe", "Collapsed") — walkers choose from this list when reporting
6. Toggle **Ask for quantity** and set the quantity label (e.g. "Number of sections")
7. Set **Active** to make it visible to walkers immediately
8. Set **Sort order** to control position in the walker's category picker

**Editing / Deleting**
- Edit any category at any time — changes take effect immediately
- Deleting a category does not delete historical reports that used it
- Deactivating (unchecking Active) hides it from walkers without deleting it

> The **Report Other** button on the Walker Dashboard only appears when at least one active custom category exists.

---

### 6.9 Report Sheep Button

Admins and super admins are also walkers. The green **🐑 Report Sheep** button in the top navigation bar opens the full walker report flow in an overlay, allowing admins to submit reports without leaving the admin dashboard.

---

### 6.10 Password Management

**Admins can:**
- Change their own password (via "Change Password" in the Admin Users tab)
- Send password reset emails to walkers and farmers from the user detail modal
- *Super admins only:* Send password reset emails to other admins

**Walkers and Farmers can:**
- Reset their password from the admin-triggered reset email
- Contact an admin to request a reset

---

## 7. PWA & Offline Mode

### 7.1 What is the PWA?

Little Bo Peep is a **Progressive Web App (PWA)**. This means it can be installed directly to your phone's home screen from the browser, with no App Store required. Once installed, the app shell is cached on the device and works without internet connectivity.

> **This feature is in beta.** Users can try it now and provide feedback.

---

### 7.2 Installing the App

**On Android (Chrome)**

A banner appears on the Walker Dashboard:

> 🧪 Beta Feature — Use Little Bo Peep without signal
> Install to your home screen and capture sightings even deep in the hills — no app store, no download, no signal needed.

Tap **"Install now — it's free"** and follow the browser prompt. The app will appear on your home screen and open in full-screen (no browser chrome).

**On iPhone / iPad (Safari)**

The same banner shows with step-by-step instructions:

1. Tap the **Share** button ⎋ at the bottom of Safari
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **Add**

> Must be opened in Safari (not Chrome or Firefox) on iOS for this to work.

The install prompt can be dismissed with "Maybe later" and will reappear after 7 days.

---

### 7.3 Capturing a Sighting Offline

When the device has no signal:

1. An amber **"You're offline"** notice replaces the standard report buttons on the Walker Dashboard
2. Tap **📍 Quick Capture (offline)**
3. A dark full-screen offline capture flow opens:

**Step 1 — Location**
- GPS captures your coordinates automatically (GPS is satellite-based and does not require internet)
- Shows accuracy in metres — move to open ground if accuracy is poor (>50m)

**Step 2 — Photo**
- Opens the device camera or photo library
- Up to 3 photos can be captured
- Photos are stored directly on the device
- This step is optional — tap "Skip photos" to continue

**Step 3 — Details**
- Choose a category (Sheep or any active custom categories, loaded from last online session)
- Select condition from the category's options
- Adjust quantity with +/− buttons
- Optional free-text notes

**Saved**
- A confirmation screen confirms the report is stored on the device
- The screen closes automatically

All offline reports are stored in the browser's **IndexedDB** — a local database that persists across sessions and is not cleared when you close the browser.

---

### 7.4 Syncing When Back Online

When the device regains connectivity, an amber banner appears on the Walker Dashboard:

> 📡 2 offline sightings waiting to upload — You're back online — your reports from the field are ready to sync

Tap **Upload now** to sync all pending reports to Supabase. Successfully synced reports:
- Appear live on the map immediately
- Are removed from the pending queue
- Show a green confirmation: *"2 offline reports uploaded!"*

If any fail (e.g. Supabase temporarily unavailable), a "Retry" button appears and a background sync is registered — the browser will attempt the upload automatically when next connected.

---

### 7.5 Map Tile Caching

The service worker automatically caches map tiles as you browse the map online. Cached tiles remain available offline, so the map shows the terrain you've previously viewed. New areas that haven't been visited while online will show blank tiles until connectivity returns.

---

### 7.6 How It Works Technically

| Component | Technology | Purpose |
|---|---|---|
| `public/sw.js` | Custom Service Worker | Caches app shell, static assets, map tiles; handles background sync |
| `src/lib/offline-db.ts` | IndexedDB wrapper | Stores pending reports with GPS, photos, and metadata |
| `src/hooks/useOnlineStatus.ts` | React hook | Reactive online/offline detection using browser events |
| `src/hooks/usePWAInstall.ts` | React hook | Detects `beforeinstallprompt` (Android) and iOS Safari |
| `src/components/PWAInstallBanner.tsx` | UI component | Beta install prompt with platform-specific instructions |
| `src/components/OfflineCapture.tsx` | UI component | Full offline report form (GPS → Photo → Details) |
| `src/components/OfflineSyncBanner.tsx` | UI component | Detects reconnection; uploads pending reports to Supabase |
| `src/components/ServiceWorkerSetup.tsx` | Client component | Registers service worker; handles SW updates |
| `src/app/layout.tsx` | Root layout | Links `manifest.json`; adds PWA meta tags |

**Caching strategies:**
- **App shell** (HTML, CSS, JS): Network-first with cache fallback
- **Static assets** (`/_next/static/`): Cache-first, long-lived
- **Map tiles** (OpenStreetMap): Cache-first; offline returns a transparent tile so the map grid doesn't break
- **API routes** (`/api/*`): Network-only (never cached)

---

## 8. Technical Architecture

### 8.1 Application Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — PWA manifest, SW setup, i18n provider
│   ├── page.tsx                # Entry point — role-based routing
│   ├── auth/page.tsx           # Sign in / sign up
│   └── api/
│       ├── admin/
│       │   ├── reset-password/ # Server route — admin-triggered password resets
│       │   └── invite-user/    # Server route — invite new users (super_admin only)
│       └── auth/signup/        # Server route — walker/farmer self-registration
├── components/
│   ├── AdminDashboard.tsx      # Admin interface (8 tabs, 2100+ lines)
│   ├── WalkerDashboard.tsx     # Walker interface (4-step report flow)
│   ├── FarmerDashboard.tsx     # Farmer interface (farm/field management)
│   ├── HomePage.tsx            # Landing page with role selection
│   ├── Header.tsx              # Nav bar with role switcher and language selector
│   ├── Map.tsx / MapInner.tsx  # React-Leaflet wrapper with FlyToLocation
│   ├── PhotoUpload.tsx         # Supabase Storage photo upload
│   ├── ChangePasswordModal.tsx # Self-service password change
│   ├── AdminUserManagement.tsx # Admin Users tab component
│   ├── PWAInstallBanner.tsx    # Beta install prompt (iOS + Android)
│   ├── OfflineCapture.tsx      # Offline sighting capture form
│   ├── OfflineSyncBanner.tsx   # Pending report sync UI
│   └── ServiceWorkerSetup.tsx  # SW registration (client component)
├── store/
│   └── appStore.ts             # Zustand store — reports, farms, users, categories
├── lib/
│   ├── unified-auth.ts         # All Supabase Auth operations
│   ├── supabase-client.ts      # DB queries — reports, categories
│   ├── offline-db.ts           # IndexedDB — offline report storage
│   └── photo-upload.ts         # Supabase Storage upload helpers
├── hooks/
│   ├── useOnlineStatus.ts      # Online/offline detection
│   ├── usePWAInstall.ts        # PWA install prompt management
│   └── useLayerData.ts         # Map overlay data (OSM fences/walls)
└── contexts/
    └── TranslationContext.tsx  # i18n provider (en, cy, ga, gd)

public/
├── manifest.json               # PWA manifest
└── sw.js                       # Service worker

supabase/migrations/
├── 001–005_*.sql               # Auth, user_profiles, base schema
├── 006_add_dead_condition.sql  # Adds 'dead' to condition options
└── 007_report_categories.sql   # report_categories table
```

---

### 8.2 State Management

Zustand store (`src/store/appStore.ts`) with `persist` middleware (localStorage key: `little-bo-peep-storage`).

**Key state slices:**

| Slice | Type | Description |
|---|---|---|
| `reports` | `SheepReport[]` | All reports — synced from Supabase on load |
| `farms` | `Farm[]` | All farms with nested fields |
| `users` | `User[]` | Local user cache (Zustand) |
| `reportCategories` | `ReportCategory[]` | Custom categories — persisted to localStorage, available offline |
| `currentUserId` | `string \| null` | Authenticated user ID |
| `currentRole` | `UserRole` | Active role for UI routing |

**Role helpers (computed):**
- `canAccessWalkerFeatures()` — true for all roles
- `canAccessFarmerFeatures()` — true for farmer, admin, super_admin
- `canAccessAdminFeatures()` — true for admin, super_admin

---

### 8.3 Authentication

All auth is via Supabase Auth + a `user_profiles` table.

**Sign up flow** (walkers/farmers):
1. `POST /api/auth/signup` (server route)
2. Creates Supabase Auth user
3. Creates `user_profiles` row with role, full_name, phone
4. Returns session token

**Admin invite flow** (super_admin only):
1. `POST /api/admin/invite-user`
2. Uses Supabase Admin API to create user
3. Sends password-setup email
4. User sets password via the email link before first login

**Password reset:**
- User-initiated: Supabase "forgot password" email
- Admin-initiated: `POST /api/admin/reset-password` — sends reset email to target user

**Session persistence:**
- Supabase session stored in localStorage
- `getCurrentUser()` called on every dashboard mount to rehydrate session

---

### 8.4 Maps

React-Leaflet with OpenStreetMap tiles.

**Key implementation detail:** `MapContainer.center` is not reactive in React-Leaflet. A child `FlyToLocation` component uses `useMap()` to call `map.flyTo()` whenever the `center` prop changes. This is used for:
- Admin dashboard defaulting to the admin's GPS location
- Walker dashboard centring on the user's location
- Report submission centring the map on the submitted pin

Map tile caching is handled by the service worker (cache-first strategy for `tile.openstreetmap.org`).

---

### 8.5 Report Categories

Categories are stored in two places:
1. **Supabase** (`report_categories` table) — authoritative source
2. **Zustand store** (persisted to localStorage) — available offline

The `condition` field on `sheep_reports` is a plain `string` (not a constrained enum) to support dynamic category conditions. Migration 007 drops the old `CHECK` constraint.

Default sheep category is hardcoded in the app (not in the DB) with:
- `id: 'sheep'`, `name: 'Sheep'`, `emoji: '🐑'`
- `conditions: ['Healthy', 'Injured', 'Dead', 'Unknown']`

---

## 9. Database Schema

### user_profiles
```sql
id            UUID PRIMARY KEY (references auth.users)
email         TEXT NOT NULL
full_name     TEXT
phone         TEXT
role          TEXT  -- 'walker' | 'farmer' | 'admin' | 'super_admin'
status        TEXT  -- 'active' | 'suspended' | 'pending_verification' | 'password_reset_required'
last_login_at TIMESTAMPTZ
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### sheep_reports
```sql
id                  UUID PRIMARY KEY
location            JSONB  -- { lat: number, lng: number }
timestamp           TIMESTAMPTZ NOT NULL
sheep_count         INTEGER DEFAULT 1
condition           TEXT   -- free string, dynamic per category
description         TEXT
reporter_contact    TEXT
reporter_id         UUID REFERENCES auth.users
status              TEXT   -- 'reported' | 'claimed' | 'resolved'
claimed_by_farmer_id UUID REFERENCES auth.users
claimed_at          TIMESTAMPTZ
archived            BOOLEAN DEFAULT false
photo_urls          TEXT[]
category_id         TEXT DEFAULT 'sheep'
category_name       TEXT DEFAULT 'Sheep'
category_emoji      TEXT DEFAULT '🐑'
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### report_categories
```sql
id           UUID PRIMARY KEY
name         TEXT NOT NULL
emoji        TEXT NOT NULL DEFAULT '📋'
description  TEXT
conditions   TEXT[] NOT NULL DEFAULT '{}'
show_count   BOOLEAN NOT NULL DEFAULT true
count_label  TEXT NOT NULL DEFAULT 'Quantity'
is_active    BOOLEAN NOT NULL DEFAULT true
sort_order   INTEGER NOT NULL DEFAULT 0
created_by   UUID REFERENCES auth.users
created_at   TIMESTAMPTZ
updated_at   TIMESTAMPTZ
```

### RLS Policies

- `sheep_reports`: Anyone can insert (guests can report); authenticated users can read all; service role can update/delete
- `user_profiles`: Users can read/update their own row; admins can read all via service role API
- `report_categories`: Anyone can read active categories; service role manages writes

---

## 10. Deployment

### Stack
- **Host**: Cloudflare Workers (edge, global)
- **Build**: `opennextjs-cloudflare build` (converts Next.js to Cloudflare Workers format)
- **Deploy**: `wrangler deploy`

### One-command deploy
```bash
npm run deploy
# Equivalent to: opennextjs-cloudflare build && wrangler deploy
```

### Environment variables

Set in Cloudflare Workers dashboard or `wrangler.toml`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://oyfikxdowpekmcxszbqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>  # for server routes only
```

### Local development
```bash
npm run dev          # Next.js dev server at http://localhost:3000
npm run build        # Standard Next.js build
npm run build:cf     # Cloudflare Workers build
npm run deploy       # Build + deploy to Cloudflare
```

### Database migrations

Migrations are in `supabase/migrations/`. Run manually via the Supabase SQL Editor:

| File | Description |
|---|---|
| `001–005` | Core schema — auth, user_profiles, sheep_reports, RLS |
| `006_add_dead_condition.sql` | Drops old condition CHECK constraint |
| `007_report_categories.sql` | Creates `report_categories` table; adds category columns to `sheep_reports` |

---

## Appendix — Version History

| Version | Date | Key Changes |
|---|---|---|
| v3.0.0 | Apr 2026 | PWA + offline capture, custom report categories, role hierarchy overhaul, admin user management overhaul, farmer/walker role unification |
| v2.x | Feb–Mar 2026 | Dead animal condition, photo upload, admin overview map geolocation, user detail modals, clickable walker/farmer reports, password reset for all roles |
| v1.8.0 | Jan 2026 | Google Cloud Secret Manager migration (prior deployment on Cloud Run) |
| v1.7.0 | Jan 2026 | Complete dashboard translations (en/cy/ga/gd) |
| v1.4.0 | Jan 2026 | Translation system (database-driven, 4 languages, AI-generated) |
| v1.0.0 | Dec 2025 | Baseline — walker report flow, farmer dashboard, admin panel, Supabase auth |

---

*Little Bo Peep is built and maintained using Claude Code.*
*Production URL: https://littlebopeep.chris-bee.workers.dev*
