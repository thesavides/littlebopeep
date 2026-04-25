import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditLogServer, type AuditLogParams } from '@/lib/audit'

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
    const body: AuditLogParams = await request.json()

    if (!body.action) {
      return NextResponse.json({ success: false, error: 'action is required' }, { status: 400 })
    }

    // Validate the session — the actor_id must match the authenticated user.
    // This prevents forged audit entries.
    const authHeader = request.headers.get('authorization')
    let verifiedActorId: string | null = null
    let verifiedActorEmail: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      if (user) {
        verifiedActorId = user.id
        verifiedActorEmail = user.email ?? null
      }
    } else {
      // Try cookie-based session (browser fetch without explicit Authorization)
      const { data: { user } } = await supabaseAdmin.auth.getUser()
      if (user) {
        verifiedActorId = user.id
        verifiedActorEmail = user.email ?? null
      }
    }

    // If a non-null actorId was supplied but doesn't match the session, reject.
    if (body.actorId && verifiedActorId && body.actorId !== verifiedActorId) {
      return NextResponse.json(
        { success: false, error: 'actorId does not match authenticated session' },
        { status: 403 }
      )
    }

    const params: AuditLogParams = {
      ...body,
      // Always use the server-verified identity when available.
      actorId:    verifiedActorId    ?? body.actorId    ?? null,
      actorEmail: verifiedActorEmail ?? body.actorEmail ?? null,
    }

    await writeAuditLogServer(params, supabaseAdmin, request.headers)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[/api/audit] Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
