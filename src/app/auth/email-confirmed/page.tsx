'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

// Mark as dynamic — this page is always server-rendered with query params
export const dynamic = 'force-dynamic'

function EmailConfirmedContent() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    async function confirmEmail() {
      try {
        // Read code from query string (placed there by /auth/callback)
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const tokenHash = params.get('token_hash')
        const type = params.get('type')

        let session = null

        if (code) {
          // PKCE flow — exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError('This confirmation link has expired or has already been used. Please sign in or request a new link.')
            setStatus('error')
            return
          }
          session = data.session
        } else if (tokenHash && type) {
          // Legacy token_hash flow
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'email',
          })
          if (otpError) {
            setError('This confirmation link has expired or has already been used.')
            setStatus('error')
            return
          }
          session = data.session
        } else {
          setError('Invalid confirmation link.')
          setStatus('error')
          return
        }

        if (!session?.user) {
          setError('Could not verify your email. Please try again.')
          setStatus('error')
          return
        }

        // Notify our server to upgrade the user profile status
        await fetch('/api/auth/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        })

        setStatus('success')

        // Redirect to the app after a short pause
        setTimeout(() => router.push('/'), 3000)
      } catch (err) {
        console.error('Email confirmation error:', err)
        setError('Something went wrong. Please try signing in.')
        setStatus('error')
      }
    }

    confirmEmail()
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        {/* Logo */}
        <div className="text-5xl mb-4">🐑</div>
        <h1 className="text-xl font-bold text-[#614270] mb-2">Little Bo Peep</h1>

        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-4 border-[#7D8DCC] border-t-transparent rounded-full animate-spin mx-auto mt-6 mb-4" />
            <p className="text-[#92998B] text-sm">Confirming your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mt-4 mb-3">✅</div>
            <h2 className="text-lg font-semibold text-[#614270] mb-2">Email confirmed!</h2>
            <p className="text-[#92998B] text-sm mb-4">
              Your account is now fully active. Redirecting you to the app…
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold text-sm hover:bg-[#6b7bb8] transition-colors"
            >
              Go to app
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mt-4 mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-[#614270] mb-2">Confirmation failed</h2>
            <p className="text-[#92998B] text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold text-sm hover:bg-[#6b7bb8] transition-colors"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function EmailConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#7D8DCC] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EmailConfirmedContent />
    </Suspense>
  )
}
