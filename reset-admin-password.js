const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAyODA1MSwiZXhwIjoyMDgzNjA0MDUxfQ.SKUfR7m4eRbg8vIXjCddtk0LGI2sOMAy5ZIAdaejLMY';

const ADMIN_EMAIL = 'chris@ukuva.com';

function sendPasswordReset() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/recover`);

    const data = JSON.stringify({
      email: ADMIN_EMAIL
    });

    const options = {
      method: 'POST',
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

async function resetPassword() {
  console.log('🔐 Sending password reset email...\n');
  console.log('Email:', ADMIN_EMAIL);

  const result = await sendPasswordReset();

  if (result.statusCode === 200 || result.statusCode === 201) {
    console.log('\n✅ Password reset email sent successfully!');
    console.log('\nCheck your email inbox for:', ADMIN_EMAIL);
    console.log('Click the reset link and set a new password.');
    console.log('\nThen log in at:');
    console.log('https://little-bo-peep-327019541186.europe-west2.run.app/auth');
  } else {
    console.log('\n❌ Failed to send reset email');
    console.log('Status:', result.statusCode);
    console.log('Response:', result.data);

    console.log('\n💡 Alternative: Update password directly');
    console.log('Run this in Supabase dashboard (Authentication → Users → chris@ukuva.com → Reset Password)');
  }
}

resetPassword().catch(console.error);
