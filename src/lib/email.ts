/**
 * Email utility for Little Bo Peep
 *
 * Uses Resend (https://resend.com) when RESEND_API_KEY is configured.
 * Silently skips sending if the key is absent — set the secret in Cloudflare:
 *   wrangler secret put RESEND_API_KEY
 * And add it to .env.local for local dev.
 *
 * The FROM address must match a domain verified in your Resend account.
 * Update RESEND_FROM below once your domain is verified.
 */

const RESEND_FROM = process.env.RESEND_FROM || 'Little Bo Peep <hello@littlebopeep.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://littlebopeep.chris-bee.workers.dev'

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[Email] No RESEND_API_KEY — skipping email to ${params.to}: "${params.subject}"`)
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error(`[Email] Resend error ${response.status}:`, body)
      return false
    }

    return true
  } catch (err) {
    console.error('[Email] Failed to send:', err)
    return false
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

function baseTemplate(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Little Bo Peep</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#1e293b;padding:24px 32px;text-align:center;">
              <span style="font-size:28px;">🐑</span>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Little Bo Peep</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Little Bo Peep — Connecting countryside walkers with farmers.<br />
                <a href="${APP_URL}" style="color:#64748b;">Visit the platform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildWelcomeEmail(params: { name: string; role: string }): { subject: string; html: string } {
  const roleLabel = params.role === 'farmer' ? 'Farmer' : 'Walker'
  const roleGuidance =
    params.role === 'farmer'
      ? `
        <p style="margin:0 0 12px;color:#475569;font-size:15px;">As a <strong>Farmer</strong> you can:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:1.7;">
          <li>Set up your farm and map your fields</li>
          <li>Claim reports when walkers spot your straying livestock</li>
          <li>Receive alerts when animals are spotted near your land</li>
        </ul>`
      : `
        <p style="margin:0 0 12px;color:#475569;font-size:15px;">As a <strong>Walker</strong> you can:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:1.7;">
          <li>Report livestock you spot that may have strayed</li>
          <li>Help farmers recover their animals</li>
          <li>Use the offline mode when you're in areas with no signal</li>
        </ul>`

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Welcome, ${params.name}! 👋</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;">
      Your <strong>${roleLabel}</strong> account is ready. Here's what you can do:
    </p>
    ${roleGuidance}
    <a href="${APP_URL}"
       style="display:inline-block;background:#f59e0b;color:#1e293b;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Go to Little Bo Peep →
    </a>
  `)

  return { subject: `Welcome to Little Bo Peep, ${params.name}!`, html }
}

export function buildInviteEmail(params: {
  name: string
  role: string
  inviterName?: string
}): { subject: string; html: string } {
  const roleLabel = params.role === 'farmer' ? 'Farmer' : params.role === 'admin' ? 'Administrator' : 'Walker'
  const inviterLine = params.inviterName
    ? `<strong>${params.inviterName}</strong> has invited you`
    : 'You have been invited'

  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">You've been invited 🎉</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;">
      ${inviterLine} to join <strong>Little Bo Peep</strong> as a <strong>${roleLabel}</strong>.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;">
      Check your inbox for a separate email with a link to set your password and activate your account.
      Once you've logged in, you'll be able to access the platform straight away.
    </p>
    ${params.role === 'farmer' ? `
    <p style="margin:0 0 12px;color:#475569;font-size:15px;">As a farmer you'll be able to:</p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:1.7;">
      <li>View farms that have been set up for you</li>
      <li>Claim reports of straying livestock near your land</li>
      <li>Receive alerts from walkers who spot your animals</li>
    </ul>
    ` : ''}
    <a href="${APP_URL}"
       style="display:inline-block;background:#f59e0b;color:#1e293b;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
      Go to Little Bo Peep →
    </a>
    <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">
      If you weren't expecting this invitation, you can ignore this email.
    </p>
  `)

  return { subject: `You've been invited to Little Bo Peep`, html }
}
