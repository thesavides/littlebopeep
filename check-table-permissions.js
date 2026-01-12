const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

console.log('🔍 Checking all profiles in user_profiles table...\n');

function checkAllProfiles() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles?select=*`);

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
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log(`\nFound ${parsed.length} user profiles:\n`);
          if (parsed.length > 0) {
            parsed.forEach(profile => {
              console.log('---');
              console.log('ID:', profile.id);
              console.log('Email:', profile.email);
              console.log('Role:', profile.role);
              console.log('Status:', profile.status);
            });
          } else {
            console.log('❌ No profiles found in table');
            console.log('\nThe INSERT may have failed due to RLS policies.');
            console.log('Try temporarily disabling RLS or using service role key.');
          }
        } else {
          console.log('Error:', data);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.end();
  });
}

checkAllProfiles();
