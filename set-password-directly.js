const https = require('https');
const readline = require('readline');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyODA1MSwiZXhwIjoyMDgzNjA0MDUxfQ.SKUfR7m4eRbg8vIXjCddtk0LGI2sOMAy5ZIAdaejLMY';

const ADMIN_ID = '66de4b16-7a81-4484-a460-35c2d2ac5a20';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
  console.log('🔐 Direct Password Update for Admin User\n');
  console.log('Admin ID:', ADMIN_ID);
  console.log('Email: chris@ukuva.com\n');

  rl.question('Enter new password (min 8 characters): ', async (password) => {
    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters');
      rl.close();
      return;
    }

    console.log('\n⏳ Updating password...');

    const result = await updatePassword(password);

    if (result.statusCode === 200) {
      console.log('\n✅ Password updated successfully!');
      console.log('\nYou can now log in at:');
      console.log('https://little-bo-peep-327019541186.europe-west2.run.app/auth');
      console.log('\nCredentials:');
      console.log('  Email: chris@ukuva.com');
      console.log('  Password:', password);
    } else {
      console.log('\n❌ Failed to update password');
      console.log('Status:', result.statusCode);
      console.log('Response:', result.data);
    }

    rl.close();
  });
}

setPassword().catch(console.error);
