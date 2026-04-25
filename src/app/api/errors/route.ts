import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ErrorLogParams } from '@/lib/error-log'

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
    const body: ErrorLogParams = await request.json()

    if (!body.message) {
      return NextResponse.json({ success: false, error: 'message is required' }, { status: 400 })
    }

    // Attempt to resolve identity from session (best-effort; errors before auth
    // will have no actor and that is fine).
    let actorId: string | null = body.actorId ?? null
    let actorEmail: string | null = body.actorEmail ?? null

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7))
      if (user) { actorId = user.id; actorEmail = user.email ?? null }
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null
    const ua   = request.headers.get('user-agent') || null
    const path = request.headers.get('referer') || request.headers.get('x-invoke-path') || null

    const { error } = await supabaseAdmin.from('error_logs').insert([{
      actor_id:     actorId,
      actor_email:  actorEmail,
      severity:     body.severity    ?? 'error',
      error_code:   body.errorCode   ?? null,
      message:      body.message,
      stack:        body.stack       ?? null,
      context:      body.context     ?? {},
      entity_type:  body.entityType  ?? null,
      entity_id:    body.entityId    ?? null,
      request_path: path,
      ip_address:   ip,
      user_agent:   ua,
    }])

    if (error) {
      console.error('[/api/errors] DB insert failed:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[/api/errors] Handler error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
