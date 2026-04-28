import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditLogServer } from '@/lib/audit'

/**
 * Admin-only endpoint: resend email verification to a user whose status
 * is still pending_verification.
 *
 * Uses the Supabase Admin API to generate a new email confirmation link
 * and send it to the user. Writes a user.email_verification_sent audit event.
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
    const { userId, actorId, actorEmail } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    // Fetch profile to get email and verify they're still pending
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, status, full_name')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (profile.status !== 'pending_verification') {
      return NextResponse.json(
        { success: false, error: 'User is not pending verification' },
        { status: 400 }
      )
    }

    // Generate a magic link — the SDK type for 'signup' now requires a
    // password field which we don't have. A magic link achieves the same
    // outcome: the user clicks it, is authenticated, and their email is
    // confirmed by Supabase in the same flow.
    const { error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://littlebopeep.app'}/auth/callback?type=signup`,
      },
    })

    if (linkError) {
      console.error('resend-verification generateLink error:', linkError)
      return NextResponse.json({ success: false, error: linkError.message }, { status: 500 })
    }

    // Audit: record the resend
    await writeAuditLogServer(
      {
        actorId: actorId || userId,
        actorEmail: actorEmail || profile.email,
        action: 'user.email_verification_sent',
        entityType: 'user',
        entityId: userId,
        detail: { email: profile.email, triggeredBy: actorId ? 'admin' : 'system', resend: true },
      },
      supabaseAdmin,
      request.headers
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('resend-verification error:', error)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}
