import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup' | 'email' | 'recovery' | etc.
  const next = requestUrl.searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(new URL('/auth', requestUrl.origin))
  }

  // Pass the code to the client-side page to exchange for a session.
  // @supabase/ssr is not compatible with Cloudflare Workers edge runtime,
  // so we handle the exchange client-side via supabase-js instead.

  // Email confirmation (signup or email-change) → dedicated landing page
  if (type === 'signup' || type === 'email') {
    const redirectUrl = new URL('/auth/email-confirmed', requestUrl.origin)
    redirectUrl.searchParams.set('code', code)
    return NextResponse.redirect(redirectUrl)
  }

  // Password reset → existing reset-password page
  const destination = next || '/auth/reset-password'
  const redirectUrl = new URL(destination, requestUrl.origin)
  redirectUrl.searchParams.set('code', code)
  return NextResponse.redirect(redirectUrl)
}
