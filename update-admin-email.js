const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

const ADMIN_ID = '66de4b16-7a81-4484-a460-35c2d2ac5a20';

function updateProfile() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${ADMIN_ID}`);

    const data = JSON.stringify({
      email: 'chris@ukuva.com'
    });

    const options = {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(responseData));
        } else {
          resolve({ error: true, statusCode: res.statusCode, message: responseData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function fixEmail() {
  console.log('🔧 Updating admin email to match auth user...\n');
  console.log('Admin ID:', ADMIN_ID);
  console.log('New email: chris@ukuva.com\n');

  const result = await updateProfile();

  if (result.error) {
    console.log('❌ Update failed');
    console.log('Status:', result.statusCode);
    console.log('Error:', result.message);
  } else if (result.length > 0) {
    console.log('✅ Email updated successfully!\n');
    console.log('Updated profile:');
    console.log('  ID:', result[0].id);
    console.log('  Email:', result[0].email);
    console.log('  Name:', result[0].full_name);
    console.log('  Role:', result[0].role);
    console.log('  Status:', result[0].status);
    console.log('\n🚀 You can now log in at:');
    console.log('   https://little-bo-peep-327019541186.europe-west2.run.app/auth');
    console.log('   Email: chris@ukuva.com');
    console.log('   Password: (the password you set in Supabase Auth)');
  } else {
    console.log('⚠️  No rows updated. Profile may not exist.');
  }
}

fixEmail().catch(console.error);
