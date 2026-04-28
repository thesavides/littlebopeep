/**
 * Audit logging utility.
 *
 * Client code   → writeAuditLog()         POSTs to /api/audit (session-validated, captures IP/UA server-side)
 * API routes    → writeAuditLogServer()   writes directly via the caller's service-role client
 *
 * Both paths write to the same audit_logs table and are fire-and-forget.
 */
import { supabase } from './supabase-client'

export type AuditAction =
  // User lifecycle
  | 'user.invite'
  | 'user.signup'
  | 'user.delete'
  | 'user.suspend'
  | 'user.activate'
  | 'user.password_reset'
  | 'user.role_change'
  | 'user.profile_update'
  | 'user.email_verification_sent'
  | 'user.email_verified'
  // Farm lifecycle
  | 'farm.create'
  | 'farm.update'
  | 'farm.delete'
  | 'farm.reassign'
  // Field lifecycle
  | 'field.create'
  | 'field.update'
  | 'field.delete'
  // Report lifecycle
  | 'report.create'
  | 'report.claim'
  | 'report.unclaim'
  | 'report.reassign'
  | 'report.resolve'
  | 'report.reopen'
  | 'report.escalate'
  | 'report.complete'
  | 'report.flag'
  | 'report.archive'
  | 'report.delete'
  | 'report.photo_delete'
  // Auth events
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'

export interface AuditLogParams {
  actorId?: string | null
  actorEmail?: string | null
  action: AuditAction
  entityType?: string
  entityId?: string
  detail?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — safe to call from browser code.
// Sends to /api/audit which validates the session before writing.
// ─────────────────────────────────────────────────────────────────────────────
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch (err) {
    console.error('[Audit] Failed to write log:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER — for use inside API route handlers that already hold a service-role
// Supabase client. Pass `request.headers` to capture IP / UA automatically.
// ─────────────────────────────────────────────────────────────────────────────
export async function writeAuditLogServer(
  params: AuditLogParams,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any,
  requestHeaders?: Headers
): Promise<void> {
  const ip =
    requestHeaders?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    requestHeaders?.get('x-real-ip') ||
    null
  const ua = requestHeaders?.get('user-agent') || null
  const path = requestHeaders?.get('x-invoke-path') || null

  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert([{
      actor_id:     params.actorId     ?? null,
      actor_email:  params.actorEmail  ?? null,
      action:       params.action,
      entity_type:  params.entityType  ?? null,
      entity_id:    params.entityId    ?? null,
      detail:       params.detail      ?? {},
      ip_address:   ip,
      user_agent:   ua,
      request_path: path,
    }])
    if (error) console.error('[Audit] Server failed to write log:', error)
  } catch (err) {
    console.error('[Audit] Server exception writing log:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — only admins can read via RLS; uses the anon client (JWT carries role).
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAuditLogs(opts?: {
  limit?: number
  entityType?: string
  entityId?: string
  actorId?: string
}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 200)

  if (opts?.entityType) query = query.eq('entity_type', opts.entityType)
  if (opts?.entityId)   query = query.eq('entity_id',   opts.entityId)
  if (opts?.actorId)    query = query.eq('actor_id',    opts.actorId)

  const { data, error } = await query
  if (error) {
    console.error('[Audit] Failed to fetch logs:', error)
    return []
  }
  return data || []
}

export async function fetchErrorLogs(opts?: {
  limit?: number
  severity?: string
  entityId?: string
}) {
  let query = supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 200)

  if (opts?.severity) query = query.eq('severity', opts.severity)
  if (opts?.entityId) query = query.eq('entity_id', opts.entityId)

  const { data, error } = await query
  if (error) {
    console.error('[Audit] Failed to fetch error logs:', error)
    return []
  }
  return data || []
}
