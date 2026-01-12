'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/unified-auth'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'
import PasswordInput from '@/components/PasswordInput'

export default function AuthPage() {
  const router = useRouter()
  const { setRole, setCurrentUserId } = useAppStore()
  const { t } = useTranslation()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRoleSelection] = useState<'walker' | 'farmer'>('walker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Signup is now handled by admin invitations only
        setError(t('auth.signupDisabled', {}, 'Please contact an administrator to create an account'))
        setLoading(false)
        return
      }

      // Sign in with unified auth
      const { success, user, error: signInError } = await signIn(email, password)

      if (!success || !user) {
        setError(signInError || t('auth.authenticationFailed', {}, 'Authentication failed'))
        setLoading(false)
        return
      }

      // Set user state
      setCurrentUserId(user.id)
      setRole(user.role as any) // Set to primary role

      // Check if password reset is required
      if (user.password_reset_required) {
        router.push('/auth/reset-password?new=true')
        return
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message || t('auth.authenticationFailed', {}, 'Authentication failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {t('header.appName', {}, 'Little Bo Peep')}
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.signIn', {}, 'Sign In')}
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.signUp', {}, 'Sign Up')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.iAmA', {}, 'I am a:')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="walker"
                    checked={role === 'walker'}
                    onChange={(e) => setRoleSelection(e.target.value as 'walker')}
                    className="mr-2"
                  />
                  <span>{t('auth.walker', {}, 'Walker')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="farmer"
                    checked={role === 'farmer'}
                    onChange={(e) => setRoleSelection(e.target.value as 'farmer')}
                    className="mr-2"
                  />
                  <span>{t('auth.farmer', {}, 'Farmer')}</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email', {}, 'Email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t('auth.emailPlaceholder', {}, 'you@example.com')}
            />
          </div>

          <PasswordInput
            id="password"
            label={t('auth.password', {}, 'Password')}
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t('common.pleaseWait', {}, 'Please wait...')
              : mode === 'signin'
                ? t('auth.signIn', {}, 'Sign In')
                : t('auth.signUp', {}, 'Sign Up')
            }
          </button>
        </form>

        {mode === 'signin' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/auth/forgot-password')}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {t('auth.forgotPassword', {}, 'Forgot Password?')}
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            onClick={() => router.push('/')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← {t('common.backToHome', {}, 'Back to Home')}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              {t('auth.signupInfo', {}, 'To create an account, please contact an administrator who will send you an invitation email.')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
