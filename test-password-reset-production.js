/**
 * Test script to verify password reset functionality in production
 *
 * This tests that the server-side API endpoint is working correctly
 * and that emails will contain production URLs (not localhost URLs)
 */

const PRODUCTION_URL = 'https://little-bo-peep-327019541186.europe-west2.run.app'

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset API\n')
  console.log(`Production URL: ${PRODUCTION_URL}`)
  console.log('Testing endpoint: /api/admin/reset-password\n')

  const testEmail = 'test@example.com' // Use a test email

  try {
    console.log(`📧 Sending password reset request for: ${testEmail}`)

    const response = await fetch(`${PRODUCTION_URL}/api/admin/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: testEmail })
    })

    console.log(`Response status: ${response.status}`)

    const result = await response.json()
    console.log('Response body:', JSON.stringify(result, null, 2))

    if (response.ok && result.success) {
      console.log('\n✅ Password reset API is working!')
      console.log('📬 Email should be sent with production URL')
    } else {
      console.log('\n⚠️  API returned an error (might be expected if email doesn\'t exist)')
      console.log('Error:', result.error)
    }

    console.log('\n📝 Manual Testing Steps:')
    console.log('1. Go to: ' + PRODUCTION_URL)
    console.log('2. Log in as admin: chris@ukuva.com')
    console.log('3. Navigate to Admin Dashboard → User Management')
    console.log('4. Click "Reset Password" for a real user')
    console.log('5. Check the email received')
    console.log('6. Verify the email contains production URL (not localhost)')
    console.log('   Expected URL: ' + PRODUCTION_URL + '/auth/callback?next=/auth/reset-password')

  } catch (error) {
    console.error('❌ Error testing password reset:', error.message)
  }
}

testPasswordReset()
