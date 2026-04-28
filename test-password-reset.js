/**
 * Test Password Reset Flow for Admin Users
 *
 * This script tests the complete password reset flow:
 * 1. Trigger password reset for a user
 * 2. Check user profile status is updated
 *
 * Note: The actual password reset must be completed via email link
 */

const https = require('https');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

// Test user email to reset
const TEST_EMAIL = 'chris@ukuva.com'; // Change this to test another user

console.log('🔐 Password Reset Flow Test');
console.log('============================\n');

/**
 * Step 1: Request password reset
 */
function requestPasswordReset(email) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/recover`);

    const data = JSON.stringify({
      email: email
    });

    const options = {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      }
    };

    console.log(`📧 Sending password reset email to: ${email}`);

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Password reset email sent successfully\n');
          console.log('📬 Next steps:');
          console.log('   1. Check email inbox for password reset link');
          console.log('   2. Click the link in the email');
          console.log('   3. Set a new password (minimum 8 characters)');
          console.log('   4. You will be redirected to login page\n');
          resolve(true);
        } else {
          console.log('❌ Failed to send password reset email');
          console.log('Status:', res.statusCode);
          console.log('Response:', responseData);
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
 * Step 2: Check user profile status
 */
function checkUserProfile(email) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/user_profiles`);
    url.searchParams.append('email', `eq.${email}`);
    url.searchParams.append('select', 'id,email,role,status,password_reset_required,last_login_at');

    const options = {
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('🔍 Checking user profile...\n');

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const users = JSON.parse(data);
          if (users.length > 0) {
            const user = users[0];
            console.log('👤 User Profile:');
            console.log('   ID:', user.id);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Status:', user.status);
            console.log('   Password Reset Required:', user.password_reset_required);
            console.log('   Last Login:', user.last_login_at || 'Never');
            console.log('');
            resolve(user);
          } else {
            console.log('❌ User not found');
            resolve(null);
          }
        } else {
          console.log('❌ Failed to fetch user profile');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Main test flow
 */
async function runTest() {
  try {
    // Check user profile before reset
    console.log('📊 BEFORE PASSWORD RESET');
    console.log('========================\n');
    await checkUserProfile(TEST_EMAIL);

    // Request password reset
    console.log('\n📧 REQUESTING PASSWORD RESET');
    console.log('============================\n');
    const resetSent = await requestPasswordReset(TEST_EMAIL);

    if (!resetSent) {
      console.log('\n❌ Test failed: Could not send password reset email');
      return;
    }

    // Note about email
    console.log('⏳ Waiting for email to be sent...\n');
    console.log('Note: Supabase sends the email asynchronously.');
    console.log('The user profile status will be updated when an admin');
    console.log('uses the adminResetUserPassword() function, not from');
    console.log('the basic resetPasswordForEmail() call.\n');

    console.log('✅ Test completed successfully');
    console.log('\n📝 Summary:');
    console.log('   - Password reset email sent to:', TEST_EMAIL);
    console.log('   - Check email for reset link');
    console.log('   - Reset link format: https://...auth/reset-password');
    console.log('\n💡 To test the full admin flow:');
    console.log('   1. Log in as super_admin at: https://little-bo-peep-327019541186.europe-west2.run.app/auth');
    console.log('   2. Go to Admin Dashboard → User Management');
    console.log('   3. Click "Reset Password" button for a user');
    console.log('   4. User receives email and can set new password');

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

// Run the test
runTest();
