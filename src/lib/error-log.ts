/**
 * Runtime error logging utility.
 *
 * Persists errors to the error_logs table via /api/errors (server-side, service role).
 * All calls are fire-and-forget — failures fall back to console.error.
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ErrorLogParams {
  severity?: ErrorSeverity
  errorCode?: string
  message: string
  stack?: string
  context?: Record<string, unknown>
  entityType?: string
  entityId?: string
  actorId?: string | null
  actorEmail?: string | null
}

export async function writeErrorLog(params: ErrorLogParams): Promise<void> {
  // Always mirror to console so local dev and Cloudflare logs capture it.
  const severity = params.severity ?? 'error'
  const logFn = severity === 'critical' || severity === 'error' ? console.error : console.warn
  logFn(`[ErrorLog:${severity}] ${params.message}`, params.context ?? {})

  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  } catch (err) {
    // Swallow — we already logged to console above.
  }
}

/**
 * Wrap an async function so any thrown error is automatically logged.
 * Returns the result on success, or `null` on failure (error is persisted).
 */
export async function withErrorLog<T>(
  fn: () => Promise<T>,
  context: Omit<ErrorLogParams, 'message' | 'stack'>
): Promise<T | null> {
  try {
    return await fn()
  } catch (err: any) {
    await writeErrorLog({
      ...context,
      message: err?.message ?? String(err),
      stack:   err?.stack   ?? undefined,
    })
    return null
  }
}
