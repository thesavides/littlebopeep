/**
 * Cleanup script: deletes Supabase auth users that have no user_profiles row.
 * These are created when signup fails after the auth user is created but before
 * the profile is saved.
 *
 * Run: node scripts/cleanup-orphaned-auth-users.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = resolve(__dirname, '../.env.local')
const envVars = {}
try {
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const [k, ...vParts] = line.split('=')
    if (k && vParts.length) envVars[k.trim()] = vParts.join('=').trim()
  }
} catch {
  console.error('Could not read .env.local — add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY manually')
  process.exit(1)
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('Fetching all Supabase auth users…')

  // List all auth users (paginated, max 1000 per page)
  const authUsers = []
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) { console.error('Error listing auth users:', error.message); process.exit(1) }
    authUsers.push(...data.users)
    if (data.users.length < 1000) break
    page++
  }
  console.log(`Found ${authUsers.length} auth user(s)`)

  // Fetch all user_profiles
  const { data: profiles, error: profileErr } = await admin
    .from('user_profiles')
    .select('id, email, role, status')
  if (profileErr) { console.error('Error fetching profiles:', profileErr.message); process.exit(1) }
  console.log(`Found ${profiles.length} user_profile(s)`)

  const profileIds = new Set(profiles.map(p => p.id))

  // Find orphaned auth users (no matching profile)
  const orphans = authUsers.filter(u => !profileIds.has(u.id))

  if (orphans.length === 0) {
    console.log('\n✅ No orphaned auth users found. Nothing to clean up.')
    return
  }

  console.log(`\n⚠️  Found ${orphans.length} orphaned auth user(s):`)
  for (const u of orphans) {
    const created = new Date(u.created_at).toLocaleString()
    console.log(`   • ${u.email || '(no email)'} — created ${created} — id: ${u.id}`)
  }

  // Delete them
  console.log('\nDeleting orphaned auth users…')
  let deleted = 0
  let failed = 0
  for (const u of orphans) {
    const { error } = await admin.auth.admin.deleteUser(u.id)
    if (error) {
      console.error(`   ✗ Failed to delete ${u.email}: ${error.message}`)
      failed++
    } else {
      console.log(`   ✓ Deleted ${u.email || u.id}`)
      deleted++
    }
  }

  console.log(`\nDone. Deleted: ${deleted}  Failed: ${failed}`)
}

run()
