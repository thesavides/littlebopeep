'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestPasswordReset } from '@/lib/unified-auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await requestPasswordReset(email)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to send reset email')
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-serif font-semibold text-[#614270] mb-2">
              Check Your Email
            </h1>
            <p className="text-[#92998B]">
              We've sent password reset instructions to <strong className="text-[#614270]">{email}</strong>
            </p>
          </div>

          <div className="bg-[#7D8DCC]/10 border border-[#7D8DCC]/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#614270]">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7bb8] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          {/* Brand logo */}
          <div className="flex justify-center mb-4">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-[#614270] mb-2">
            Forgot Password
          </h1>
          <p className="text-[#92998B]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#FA9335]/10 border border-[#FA9335]/30 rounded-xl">
            <p className="text-sm text-[#a0522d] text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#614270] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-[#92998B] rounded-xl focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#7D8DCC] text-white rounded-xl font-semibold hover:bg-[#6b7bb8] disabled:bg-[#D1D9C5] disabled:text-[#92998B] disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth')}
            className="text-sm text-[#92998B] hover:text-[#614270] underline transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
