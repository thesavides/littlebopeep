import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditLog } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = await request.json()
    const { userId, targetRole } = body

    if (!userId || targetRole !== 'farmer') {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (existing.role === 'farmer' || existing.role === 'admin' || existing.role === 'super_admin') {
      return NextResponse.json({ success: true, role: existing.role })
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: 'farmer' })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    writeAuditLog({
      actorId: userId,
      action: 'user.role_change',
      entityType: 'user',
      entityId: userId,
      detail: { from: existing.role, to: 'farmer' },
    })

    return NextResponse.json({ success: true, role: 'farmer' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
