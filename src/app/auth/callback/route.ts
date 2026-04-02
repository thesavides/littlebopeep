import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/auth/reset-password'

  if (!code) {
    return NextResponse.redirect(new URL('/auth', requestUrl.origin))
  }

  // Pass the code to the client-side page to exchange for a session.
  // @supabase/ssr is not compatible with Cloudflare Workers edge runtime,
  // so we handle the exchange client-side via supabase-js instead.
  const redirectUrl = new URL(next, requestUrl.origin)
  redirectUrl.searchParams.set('code', code)
  return NextResponse.redirect(redirectUrl)
}
