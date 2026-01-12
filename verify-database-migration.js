const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

const ADMIN_ID = '66de4b16-7a81-4484-a460-35c2d2ac5a20';

function makeRequest(tableName) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${tableName}?select=*`);

    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(responseData);
            resolve({ success: true, data, count: data.length });
          } catch (e) {
            resolve({ success: false, error: e.message });
          }
        } else if (res.statusCode === 404 || res.statusCode === 406) {
          resolve({ success: false, notFound: true, error: 'Table does not exist' });
        } else {
          resolve({ success: false, error: responseData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function verifyMigration() {
  console.log('🔍 Verifying Database Migration Status\n');
  console.log('Expected Super Admin ID:', ADMIN_ID);
  console.log('=' .repeat(80));

  // Check critical tables
  const tables = [
    { name: 'user_profiles', description: 'New unified auth system' },
    { name: 'admin_credentials', description: 'Old admin system (should be deprecated)' },
    { name: 'sheep_reports', description: 'Sheep sighting reports' },
    { name: 'reports', description: 'Alternative reports table' },
    { name: 'farms', description: 'Farms data' },
    { name: 'farmers', description: 'Farmers profiles' },
    { name: 'translations', description: 'Translation keys' }
  ];

  for (const table of tables) {
    console.log(`\n📋 ${table.name.toUpperCase()}`);
    console.log(`   Description: ${table.description}`);

    const result = await makeRequest(table.name);

    if (result.notFound) {
      console.log(`   ❌ Table does NOT exist`);
    } else if (result.success) {
      console.log(`   ✅ Table exists`);
      console.log(`   Records: ${result.count}`);

      if (result.count > 0 && result.count <= 5) {
        console.log(`\n   📊 All Records:`);
        result.data.forEach((record, idx) => {
          console.log(`\n   Record ${idx + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            const display = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50);
            console.log(`     ${key}: ${display}${String(value).length > 50 ? '...' : ''}`);
          });
        });
      } else if (result.count > 5) {
        console.log(`\n   📊 First Record (sample):`);
        const record = result.data[0];
        Object.entries(record).forEach(([key, value]) => {
          const display = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50);
          console.log(`     ${key}: ${display}${String(value).length > 50 ? '...' : ''}`);
        });
      }

      // Check for admin user
      if (table.name === 'user_profiles') {
        const adminProfile = result.data.find(r => r.id === ADMIN_ID);
        if (adminProfile) {
          console.log(`\n   ⭐ SUPER ADMIN PROFILE FOUND:`);
          Object.entries(adminProfile).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        } else if (result.count > 0) {
          console.log(`\n   ⚠️  Super admin profile NOT FOUND for ID: ${ADMIN_ID}`);
          console.log(`   Available profile IDs:`);
          result.data.forEach(r => console.log(`     - ${r.id} (${r.email})`));
        }
      }
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }

    console.log('-'.repeat(80));
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 MIGRATION STATUS SUMMARY\n');

  // Check migration status
  const userProfilesResult = await makeRequest('user_profiles');
  const adminCredsResult = await makeRequest('admin_credentials');

  if (userProfilesResult.notFound) {
    console.log('❌ MIGRATION NOT RUN');
    console.log('   The user_profiles table does not exist.');
    console.log('   ACTION REQUIRED:');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Run: supabase/migrations/004_unified_auth_system.sql');
    console.log('   3. Create super admin user in Supabase Auth');
    console.log('   4. Run: INSERT INTO user_profiles (id, email, full_name, role, status)');
    console.log(`      VALUES ('${ADMIN_ID}', 'admin@littlebopeep.com', 'Super Administrator', 'super_admin', 'active');`);
  } else if (userProfilesResult.success && userProfilesResult.count === 0) {
    console.log('⚠️  MIGRATION PARTIALLY COMPLETE');
    console.log('   The user_profiles table exists but is empty.');
    console.log('   ACTION REQUIRED:');
    console.log('   1. Create super admin user in Supabase Auth Dashboard');
    console.log('   2. Copy the user ID');
    console.log('   3. Run: INSERT INTO user_profiles (id, email, full_name, role, status)');
    console.log(`      VALUES ('PASTE_USER_ID_HERE', 'admin@littlebopeep.com', 'Super Administrator', 'super_admin', 'active');`);
  } else if (userProfilesResult.success && userProfilesResult.count > 0) {
    const hasAdmin = userProfilesResult.data.some(r => r.id === ADMIN_ID);
    if (hasAdmin) {
      console.log('✅ MIGRATION COMPLETE');
      console.log('   Super admin profile exists and is configured.');
      console.log('   You can now test login at /auth');
    } else {
      console.log('⚠️  MIGRATION COMPLETE BUT ADMIN NOT FOUND');
      console.log(`   user_profiles table exists with ${userProfilesResult.count} record(s), but expected admin ID not found.`);
      console.log('   Expected admin ID:', ADMIN_ID);
      console.log('   Found profile IDs:');
      userProfilesResult.data.forEach(r => {
        console.log(`     - ${r.id} (${r.email}) - role: ${r.role}`);
      });
    }
  }

  // Check old system
  if (!adminCredsResult.notFound) {
    console.log('\n⚠️  OLD ADMIN SYSTEM STILL EXISTS');
    console.log('   The admin_credentials table still exists.');
    console.log('   After confirming new system works, you can drop it with:');
    console.log('   DROP TABLE IF EXISTS admin_credentials CASCADE;');
  }

  console.log('\n✅ Verification complete!\n');
}

verifyMigration().catch(console.error);
