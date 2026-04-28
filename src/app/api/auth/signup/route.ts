import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, buildWelcomeEmail } from '@/lib/email'
import { writeAuditLogServer } from '@/lib/audit'

/**
 * Server-side signup endpoint for walkers and farmers
 * Uses service role key to bypass RLS restrictions
 */
export async function POST(request: NextRequest) {
  // Initialize Supabase client inside the handler to avoid build-time errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  try {
    const body = await request.json()
    const { email, password, fullName, role, emailAlerts, termsAcceptedAt, termsAcceptedMeta } = body

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only allow walker and farmer roles for self-signup
    if (role !== 'walker' && role !== 'farmer') {
      return NextResponse.json(
        { success: false, error: 'Invalid role for signup' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth with email_confirm: true.
    // This bypasses Supabase's own confirmation email (which would use whatever
    // Site URL is configured in the Supabase dashboard — often localhost:3000 in dev).
    // We send our own branded verification email below with the correct production URL.
    // The user can sign in immediately; our user_profiles.status tracks verification state.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { success: false, error: authError?.message || 'Sign up failed' },
        { status: 400 }
      )
    }

    // Create user profile (using service role key bypasses RLS)
    // New users start as 'pending_verification' — login is not blocked, but
    // email confirmation upgrades status to 'active' and sets email_confirmed_at.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: 'pending_verification',
        password_reset_required: false,
        email_alerts_enabled: emailAlerts === true,
        terms_accepted_at: termsAcceptedAt || new Date().toISOString(),
        terms_accepted_meta: termsAcceptedMeta || null
      }])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Generate a one-time verification magic link (our own flow, correct production URL).
    // When the user clicks it they land at /auth/callback?type=signup → /auth/email-confirmed
    // which upgrades their user_profiles.status from pending_verification to active.
    const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://littlebopeep.app'
    let verifyUrl: string | undefined
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${productionUrl}/auth/callback?type=signup` },
      })
      verifyUrl = (linkData as any)?.properties?.action_link || undefined
    } catch {
      // Non-fatal — email will fall back to the plain app link
    }

    // Send branded welcome + verification email
    const { subject, html } = buildWelcomeEmail({ name: fullName, role, verifyUrl })
    await sendEmail({ to: email, subject, html })

    await writeAuditLogServer(
      { actorId: authData.user.id, actorEmail: email, action: 'user.signup', entityType: 'user', entityId: authData.user.id, detail: { fullName, role } },
      supabaseAdmin, request.headers
    )

    // Record that a verification email was dispatched (for admin follow-up tracking)
    await writeAuditLogServer(
      { actorId: authData.user.id, actorEmail: email, action: 'user.email_verification_sent', entityType: 'user', entityId: authData.user.id, detail: { email, fullName } },
      supabaseAdmin, request.headers
    )

    return NextResponse.json({
      success: true,
      user: profile
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Sign up failed' },
      { status: 500 }
    )
  }
}
