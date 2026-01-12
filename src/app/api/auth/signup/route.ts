import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { email, password, fullName, role } = body

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

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for walkers/farmers
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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        status: 'active',
        password_reset_required: false
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
