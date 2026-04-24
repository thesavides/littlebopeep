import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sendEmail,
  buildNewReportAlertEmail,
  buildReportStatusEmail,
  buildThankYouAlertEmail,
} from '@/lib/email'

type NotificationType = 'new_report' | 'report_claimed' | 'report_resolved' | 'report_complete' | 'thank_you'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
  }

  // Require caller to be authenticated
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { type, recipientId, reportId, actorName, messageText, senderName } = body
  if (!type || !recipientId || !reportId) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Fetch recipient profile — check email_alerts_enabled
  const { data: recipient } = await supabaseAdmin
    .from('user_profiles')
    .select('email, full_name, email_alerts_enabled')
    .eq('id', recipientId)
    .single()

  if (!recipient?.email_alerts_enabled) {
    return NextResponse.json({ success: true, sent: false, reason: 'email alerts disabled' })
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

  const sent = await sendEmail({ to: recipient.email, subject, html })
  return NextResponse.json({ success: true, sent })
}
