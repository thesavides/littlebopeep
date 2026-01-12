const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyODA1MSwiZXhwIjoyMDgzNjA0MDUxfQ.SKUfR7m4eRbg8vIXjCddtk0LGI2sOMAy5ZIAdaejLMY';

const ADMIN_ID = '66de4b16-7a81-4484-a460-35c2d2ac5a20';
const NEW_PASSWORD = 'LittleBoP33p2026!'; // Temporary password - change after first login

function updatePassword(password) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users/${ADMIN_ID}`);

    const data = JSON.stringify({
      password: password
    });

    const options = {
      method: 'PUT',
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
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function setPassword() {
  console.log('🔐 Setting Admin Password\n');
  console.log('Admin ID:', ADMIN_ID);
  console.log('Email: chris@ukuva.com');
  console.log('New Password:', NEW_PASSWORD);
  console.log('\n⏳ Updating password...\n');

  const result = await updatePassword(NEW_PASSWORD);

  if (result.statusCode === 200) {
    console.log('✅ Password set successfully!\n');
    console.log('='.repeat(80));
    console.log('\n🚀 You can now log in at:');
    console.log('   https://little-bo-peep-327019541186.europe-west2.run.app/auth\n');
    console.log('📧 Credentials:');
    console.log('   Email: chris@ukuva.com');
    console.log('   Password: LittleBoP33p2026!\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');
    console.log('='.repeat(80));
  } else {
    console.log('❌ Failed to update password');
    console.log('Status:', result.statusCode);
    console.log('Response:', result.data);
  }
}

setPassword().catch(console.error);
