import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditLog } from '@/lib/audit'

/**
 * Server-side user deletion — requires super_admin role.
 * Deletes from Supabase Auth (cascades to user_profiles via FK).
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Verify the requesting user is a super_admin
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Missing authorization header' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user: requestingUser }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !requestingUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: requestingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', requestingUser.id)
    .single()

  if (!requestingProfile || requestingProfile.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Only super admins can delete users' }, { status: 403 })
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const { userId } = body
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
  }

  // Prevent self-deletion
  if (userId === requestingUser.id) {
    return NextResponse.json({ success: false, error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    // Fetch the user's email before deleting for the audit log
    const { data: deletedProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name, role')
      .eq('id', userId)
      .single()

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
      console.error('Delete user error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    await writeAuditLog({
      actorId: requestingUser.id,
      actorEmail: requestingUser.email,
      action: 'user.delete',
      entityType: 'user',
      entityId: userId,
      detail: {
        email: deletedProfile?.email,
        fullName: deletedProfile?.full_name,
        role: deletedProfile?.role,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}
