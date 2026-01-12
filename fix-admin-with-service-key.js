const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyODA1MSwiZXhwIjoyMDgzNjA0MDUxfQ.SKUfR7m4eRbg8vIXjCddtk0LGI2sOMAy5ZIAdaejLMY';

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
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
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

function verifyProfile() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${ADMIN_ID}&select=*`);

    const options = {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
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
    req.end();
  });
}

async function fixAdmin() {
  console.log('🔧 Fixing admin profile with service role key...\n');
  console.log('Admin ID:', ADMIN_ID);
  console.log('Updating email to: chris@ukuva.com\n');

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
  } else {
    console.log('⚠️  No rows updated. Verifying profile...\n');
    const verify = await verifyProfile();
    if (verify.length > 0) {
      console.log('Profile exists:');
      console.log('  ID:', verify[0].id);
      console.log('  Email:', verify[0].email);
      console.log('  Name:', verify[0].full_name);
      console.log('  Role:', verify[0].role);
      console.log('  Status:', verify[0].status);
    }
  }

  console.log('\n🚀 You can now log in at:');
  console.log('   https://little-bo-peep-327019541186.europe-west2.run.app/auth');
  console.log('   Email: chris@ukuva.com');
  console.log('   Password: (your Supabase Auth password)');
}

fixAdmin().catch(console.error);
