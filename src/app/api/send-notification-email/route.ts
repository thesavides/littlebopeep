import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  buildNewReportAlertEmail,
  buildReportStatusEmail,
  buildThankYouAlertEmail,
} from '@/lib/email'
import { pushToUser } from '@/lib/push-notify'

type NotificationType = 'new_report' | 'report_claimed' | 'report_resolved' | 'report_complete' | 'thank_you'

// Push notification titles for each event type
const PUSH_TITLES: Record<NotificationType, (actorName?: string) => string> = {
  new_report:      () => '🚨 New report near your farm',
  report_claimed:  (a) => `🙋 ${a ? a + ' claimed' : 'Your report was claimed'}`,
  report_resolved: (a) => `✅ ${a ? a + ' resolved' : 'Your report was resolved'}`,
  report_complete: () => '🎉 Your report is complete',
  thank_you:       (a) => `💌 ${a ? a + ' says thank you' : 'A farmer says thank you'}`,
}

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let body: {
    type: NotificationType
    recipientId: string
    reportId: string
    actorName?: string
    messageText?: string
    senderName?: string
    badge?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { type, recipientId, reportId, actorName, messageText, senderName, badge } = body
  if (!type || !recipientId || !reportId) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch recipient profile
  const { data: recipient } = await supabaseAdmin
    .from('user_profiles')
    .select('email, full_name, email_alerts_enabled')
    .eq('id', recipientId)
    .single()

  if (!recipient) {
    return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 })
  }

  // Fetch report for context
  const { data: report } = await supabaseAdmin
    .from('sheep_reports')
    .select('id, category_name, category_emoji, sheep_count')
    .eq('id', reportId)
    .single()

  const reportRef = reportId.slice(0, 8).toUpperCase()
  const categoryEmoji = report?.category_emoji || '🐑'
  const categoryName = report?.category_name || 'sheep'
  const count = report?.sheep_count || 1
  const recipientName = recipient.full_name || 'there'

  // ── Push notification (independent of email opt-in) ──────────────────────
  const pushTitle = PUSH_TITLES[type]?.(actorName || senderName) || 'Little Bo Peep'
  const pushBody = messageText
    ? messageText.slice(0, 100)
    : `${categoryEmoji} ${count} ${categoryName} · Ref ${reportRef}`

  await pushToUser(recipientId, {
    title: pushTitle,
    body: pushBody,
    badge: badge ?? 1,
    url: '/',
    tag: `lbp-${type}-${reportId}`,
  }).catch(() => {}) // non-fatal

  // ── Email notification (only if opted in) ────────────────────────────────
  if (!recipient.email_alerts_enabled) {
    return NextResponse.json({ success: true, pushSent: true, emailSent: false, reason: 'email alerts disabled' })
  }

  let subject = ''
  let html = ''

  if (type === 'new_report') {
    ;({ subject, html } = buildNewReportAlertEmail({
      farmerName: recipientName,
      categoryEmoji,
      categoryName,
      count,
      reportRef,
    }))
  } else if (type === 'thank_you') {
    ;({ subject, html } = buildThankYouAlertEmail({
      walkerName: recipientName,
      senderName: senderName || actorName || 'A farmer',
      messageText: messageText || 'Thank you for reporting this!',
      categoryEmoji,
      categoryName,
      reportRef,
    }))
  } else {
    ;({ subject, html } = buildReportStatusEmail({
      walkerName: recipientName,
      status: type as 'report_claimed' | 'report_resolved' | 'report_complete',
      categoryEmoji,
      categoryName,
      count,
      reportRef,
      actorName,
    }))
  }

  const emailSent = await sendEmail({ to: recipient.email, subject, html })
  return NextResponse.json({ success: true, pushSent: true, emailSent })
}
