/**
 * Audit logging utility
 * Writes immutable records to the audit_logs table in Supabase.
 * All calls are fire-and-forget — errors are logged to console only.
 */
import { supabase } from './supabase-client'

export type AuditAction =
  // User actions
  | 'user.invite'
  | 'user.signup'
  | 'user.delete'
  | 'user.suspend'
  | 'user.activate'
  | 'user.password_reset'
  | 'user.role_change'
  // Farm actions
  | 'farm.create'
  | 'farm.update'
  | 'farm.delete'
  | 'farm.reassign'
  // Field actions
  | 'field.create'
  | 'field.update'
  | 'field.delete'
  // Report actions
  | 'report.create'
  | 'report.claim'
  | 'report.unclaim'
  | 'report.resolve'
  | 'report.reopen'
  | 'report.escalate'
  | 'report.complete'
  | 'report.flag'
  | 'report.archive'
  | 'report.delete'
  // Auth actions
  | 'auth.login'
  | 'auth.logout'

export async function writeAuditLog(params: {
  actorId?: string | null
  actorEmail?: string | null
  action: AuditAction
  entityType?: string
  entityId?: string
  detail?: Record<string, unknown>
}): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert([{
      actor_id: params.actorId || null,
      actor_email: params.actorEmail || null,
      action: params.action,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      detail: params.detail || {},
    }])
    if (error) console.error('[Audit] Failed to write log:', error)
  } catch (err) {
    console.error('[Audit] Exception writing log:', err)
  }
}

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
  if (opts?.entityId) query = query.eq('entity_id', opts.entityId)
  if (opts?.actorId) query = query.eq('actor_id', opts.actorId)

  const { data, error } = await query
  if (error) {
    console.error('[Audit] Failed to fetch logs:', error)
    return []
  }
  return data || []
}
