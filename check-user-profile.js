const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

function checkProfile(userId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${userId}&select=*`);

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
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        const parsed = JSON.parse(data);
        if (parsed.length > 0) {
          console.log('\n✅ User profile EXISTS:');
          console.log(JSON.stringify(parsed[0], null, 2));
        } else {
          console.log('\n❌ User profile NOT FOUND');
          console.log('Need to create profile for user:', userId);
        }
        resolve(parsed);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

checkProfile('66de4b16-7a81-4484-a460-35c2d2ac5a20');
