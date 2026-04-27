import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditLogServer } from '@/lib/audit'

/**
 * Called after the user clicks the email confirmation link.
 * The client exchanges the Supabase auth code for a session (client-side),
 * then POSTs the user's auth token here so we can:
 *  1. Set email_confirmed_at on their user_profile
 *  2. Upgrade their status from pending_verification → active
 *  3. Write a user.email_verified audit event
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    // Fetch the current profile to check it's in the right state
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, status')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Only update if still pending — idempotent for already-confirmed users
    if (profile.status === 'pending_verification') {
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          status: 'active',
          email_confirmed_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('confirm-email update error:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to confirm email' }, { status: 500 })
      }

      await writeAuditLogServer(
        {
          actorId: userId,
          actorEmail: profile.email,
          action: 'user.email_verified',
          entityType: 'user',
          entityId: userId,
          detail: { email: profile.email },
        },
        supabaseAdmin,
        request.headers
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('confirm-email error:', error)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}
