const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

console.log('🏴󠁧󠁢󠁥󠁮󠁧󠁿 Updating English flag from UK 🇬🇧 to England 🏴󠁧󠁢󠁥󠁮󠁧󠁿...\n');

function updateFlag() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/languages?code=eq.en`);

    const data = JSON.stringify({
      flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    });

    const options = {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('\n✅ Successfully updated English flag to England flag 🏴󠁧󠁢󠁥󠁮󠁧󠁿');
          console.log('Response:', responseData);
        } else {
          console.log('\n❌ Failed to update flag');
          console.log('Response:', responseData);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

updateFlag();
