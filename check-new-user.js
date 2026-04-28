/**
 * Check New User Status
 * Verifies if a newly invited user exists and their status
 */

const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

// User to check
const USER_EMAIL = 'jessica.yellin@gmail.com';

console.log('👤 Checking User Status');
console.log('======================\n');
console.log('Email:', USER_EMAIL);
console.log('');

/**
 * Check if user exists in user_profiles
 */
function checkUserProfile(email) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles`);
    url.searchParams.append('email', `eq.${email}`);
    url.searchParams.append('select', '*');

    const options = {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🔍 Checking user_profiles table...\n');

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);

        if (res.statusCode === 200) {
          const users = JSON.parse(data);
          if (users.length > 0) {
            const user = users[0];
            console.log('\n✅ User Found in Database:\n');
            console.log('   ID:', user.id);
            console.log('   Email:', user.email);
            console.log('   Full Name:', user.full_name || 'Not set');
            console.log('   Phone:', user.phone || 'Not set');
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
            console.log('   Password Reset Required:', user.password_reset_required);
            console.log('   Created By:', user.created_by || 'Not set');
            console.log('   Last Login:', user.last_login_at || 'Never');
            console.log('   Created At:', user.created_at);
            console.log('');
            resolve(user);
          } else {
            console.log('\n❌ User NOT found in user_profiles table');
            console.log('   This could mean:');
            console.log('   1. User invitation failed');
            console.log('   2. User profile was not created');
            console.log('   3. RLS policies are blocking access');
            console.log('');
            resolve(null);
          }
        } else {
          console.log('\n❌ Failed to query user_profiles');
          console.log('Response:', data);
          console.log('');
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Try to log in with a password (will fail if not set)
 */
function attemptLogin(email, password) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/token?grant_type=password`);

    const data = JSON.stringify({ email, password });

    const options = {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    console.log('🔐 Testing login (will fail if password not set)...\n');

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Login successful - password has been set');
          resolve(true);
        } else {
          const error = JSON.parse(responseData);
          console.log('❌ Login failed (expected)');
          console.log('   Error:', error.error_description || error.error || error.message);
          console.log('   This is normal if password has not been set yet');
          console.log('');
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Main check
 */
async function runCheck() {
  try {
    // Check user profile
    const user = await checkUserProfile(USER_EMAIL);

    if (!user) {
      console.log('💡 Troubleshooting Steps:');
      console.log('   1. Verify user was invited via Admin Dashboard');
      console.log('   2. Check Supabase Auth users list:');
      console.log('      https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/auth/users');
      console.log('   3. Check if RLS policies are working correctly');
      console.log('   4. Try inviting the user again');
      return;
    }

    // If user exists, try a dummy login to see if account is active
    await attemptLogin(USER_EMAIL, 'DummyPassword123!');

    console.log('📝 Status Summary:');
    console.log('   User exists:', user ? '✅' : '❌');
    console.log('   Status:', user ? user.status : 'N/A');
    console.log('   Password reset required:', user ? user.password_reset_required : 'N/A');
    console.log('');

    if (user && user.status === 'password_reset_required') {
      console.log('✅ User is correctly set up and waiting for password reset');
      console.log('');
      console.log('📧 Next steps for user:');
      console.log('   1. Check email for password reset link');
      console.log('   2. Click the link (should go to /auth/reset-password?new=true)');
      console.log('   3. Enter new password (minimum 8 characters)');
      console.log('   4. Submit form');
      console.log('   5. Should be redirected to /auth for login');
      console.log('');
      console.log('🔗 Reset URL format:');
      console.log('   https://little-bo-peep-327019541186.europe-west2.run.app/auth/reset-password?new=true');
    }

  } catch (error) {
    console.error('\n❌ Check error:', error);
  }
}

// Run the check
runCheck();
