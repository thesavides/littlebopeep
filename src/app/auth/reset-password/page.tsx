'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/lib/unified-auth'
import { supabase } from '@/lib/supabase-client'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams?.get('new') === 'true'

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle all Supabase password reset URL formats
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const code = searchParams.get('code')
    const hash = window.location.hash

    if (tokenHash && type === 'recovery') {
      // New Supabase format: token_hash + type=recovery in query params
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ data, error }) => {
          if (error) {
            setError('Invalid or expired reset link. Please request a new one.')
          } else if (data.session) {
            setSessionReady(true)
          }
        })
    } else if (code) {
      // PKCE flow: exchange code for session
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            setError('Invalid or expired reset link. Please request a new one.')
          } else if (data.session) {
            setSessionReady(true)
          }
        })
    } else if (hash && hash.includes('access_token')) {
      // Legacy implicit flow: token in hash fragment
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            setSessionReady(true)
          } else {
            setError('Invalid or expired reset link. Please request a new one.')
          }
        })
      }, 500)
    } else {
      // No token at all — check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true)
        } else {
          setError('Invalid or expired reset link. Please request a new one.')
        }
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!sessionReady) {
      setError('Session not ready. Please use the link from your email again.')
      return
    }

    setLoading(true)

    const result = await resetPassword(password)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/auth')
      }, 3000)
    } else {
      setError(result.error || 'Failed to reset password')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-serif font-semibold text-[#614270] mb-2">
              Password {isNewUser ? 'Set' : 'Reset'} Successfully
            </h1>
            <p className="text-[#92998B] mb-6">
              Redirecting you to login...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7D8DCC] mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Brand logo */}
          <div className="flex justify-center mb-3">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-[#614270] mb-2">
            {isNewUser ? 'Set Your Password' : 'Reset Password'}
          </h1>
          <p className="text-[#92998B]">
            {isNewUser
              ? 'Welcome! Please set a secure password for your account.'
              : 'Enter your new password below.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-xl">
            <p className="text-sm text-[#a0522d] text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#614270] mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 border border-[#92998B] rounded-xl focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92998B] hover:text-[#614270] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-[#92998B] mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#614270] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 border border-[#92998B] rounded-xl focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#92998B] hover:text-[#614270] transition-colors"
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7bb8] disabled:bg-[#D1D9C5] disabled:text-[#92998B] disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Resetting...' : !sessionReady ? 'Verifying link...' : `${isNewUser ? 'Set' : 'Reset'} Password`}
          </button>
        </form>

        <div className="mt-6 p-4 bg-[#EADA69]/10 border border-[#EADA69]/40 rounded-xl">
          <p className="text-xs text-[#614270]">
            <strong>Password Requirements:</strong>
          </p>
          <ul className="text-xs text-[#92998B] mt-2 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Mix of letters, numbers, and symbols recommended</li>
            <li>• Avoid common words or phrases</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D8DCC]"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
