/**
 * Server-side helper: look up a user's push subscriptions and send them a push notification.
 * Called from notification creation code (server-side API routes only).
 */

import { createClient } from '@supabase/supabase-js'
import { sendPushNotification, PushPayload } from './push-sender'

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY  || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY             || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'info@littlebopeep.app'

export async function pushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return // Not configured — skip silently

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return

  await Promise.allSettled(
    subs.map(sub =>
      sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload,
        VAPID_PUBLIC,
        VAPID_PRIVATE,
        VAPID_SUBJECT
      ).then(result => {
        if (!result.success && result.status === 410) {
          // Subscription expired — remove it
          supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
            .then(() => {})
        }
      })
    )
  )
}
