const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

const TEST_EMAIL = 'chris@ukuva.com';
const TEST_PASSWORD = 'LittleBoP33p2026!';

function attemptLogin() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/token?grant_type=password`);

    const data = JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

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
        resolve({ statusCode: res.statusCode, data: responseData });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function testLogin() {
  console.log('🔐 Testing Login\n');
  console.log('Email:', TEST_EMAIL);
  console.log('Password: LittleBoP33p2026!\n');
  console.log('Attempting login...\n');

  const result = await attemptLogin();

  if (result.statusCode === 200) {
    console.log('✅ Login SUCCESSFUL!\n');
    const parsed = JSON.parse(result.data);
    console.log('User ID:', parsed.user?.id);
    console.log('Email:', parsed.user?.email);
    console.log('Access token received:', parsed.access_token ? 'Yes' : 'No');
  } else {
    console.log('❌ Login FAILED\n');
    console.log('Status:', result.statusCode);
    console.log('Error:', result.data);

    try {
      const error = JSON.parse(result.data);
      console.log('\nError details:');
      console.log('  Message:', error.msg || error.message || error.error_description);
      console.log('  Code:', error.code || error.error);
    } catch (e) {
      // Not JSON
    }
  }
}

testLogin().catch(console.error);
