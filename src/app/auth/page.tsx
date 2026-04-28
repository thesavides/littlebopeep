'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/unified-auth'
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
  const [fullName, setFullName] = useState('')
  const [role, setRoleSelection] = useState<'walker' | 'farmer'>('walker')
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null)

  // Pre-select mode and role from query params (e.g. ?mode=signup&role=farmer)
  // If already logged in, always redirect back to dashboard — covers the
  // back-button case where the browser history contains /auth but the user
  // is still authenticated (no query params, so the old guard never fired).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const { currentRole } = useAppStore.getState()
    if (currentRole) {
      useAppStore.getState().setShowHomePage(false)
      router.replace('/')
      return
    }
    if (params.get('mode') === 'signup') setMode('signup')
    if (params.get('role') === 'farmer') setRoleSelection('farmer')
  }, [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError(t('auth.nameRequired', {}, 'Please enter your full name'))
          setLoading(false)
          return
        }

        if (!termsAccepted) {
          setError(t('auth.termsRequired', {}, 'You must accept the Terms & Conditions to create an account'))
          setLoading(false)
          return
        }

        const now = new Date().toISOString()
        const meta = {
          user_agent: navigator.userAgent,
          language: navigator.language,
          platform: (navigator as any).platform ?? 'unknown',
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer || null,
        }

        const { success, user, error: signUpError } = await signUp(
          email,
          password,
          fullName.trim(),
          role,
          emailAlerts,
          now,
          meta
        )

        if (!success || !user) {
          setError(signUpError || t('auth.signupFailed', {}, 'Sign up failed'))
          setLoading(false)
          return
        }

        // Set user state
        setCurrentUserId(user.id)
        setRole(user.role as any)

        // Redirect to homepage
        router.push('/')
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

      // Redirect to homepage - it handles role-based dashboard routing
      router.push('/')
    } catch (err: any) {
      setError(err.message || t('auth.authenticationFailed', {}, 'Authentication failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-[#D1D9C5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Brand logo + wordmark */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-12 h-12" />
          <span className="font-serif font-semibold text-xl tracking-tight leading-none">
            <span style={{ color: '#614270' }}>Little </span>
            <span style={{ color: '#92998B' }}>Bo </span>
            <span style={{ color: '#614270' }}>Peep</span>
          </span>
        </div>

        {/* Sign in / Sign up tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-[#7D8DCC] text-white'
                : 'bg-[#D1D9C5] text-[#92998B] hover:bg-[#c5cdb9]'
            }`}
          >
            {t('auth.signIn', {}, 'Sign In')}
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-[#7D8DCC] text-white'
                : 'bg-[#D1D9C5] text-[#92998B] hover:bg-[#c5cdb9]'
            }`}
          >
            {t('auth.signUp', {}, 'Sign Up')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#614270] mb-2">
                  {t('auth.iAmA', {}, 'I am a:')}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="walker"
                      checked={role === 'walker'}
                      onChange={(e) => setRoleSelection(e.target.value as 'walker')}
                      className="mr-2 accent-[#7D8DCC]"
                    />
                    <span className="text-[#614270]">{t('auth.walker', {}, 'Walker')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="farmer"
                      checked={role === 'farmer'}
                      onChange={(e) => setRoleSelection(e.target.value as 'farmer')}
                      className="mr-2 accent-[#7D8DCC]"
                    />
                    <span className="text-[#614270]">{t('auth.farmer', {}, 'Farmer')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#614270] mb-1">
                  {t('auth.fullName', {}, 'Full Name')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[#92998B] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
                  placeholder={t('auth.fullNamePlaceholder', {}, 'John Smith')}
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-0.5 accent-[#7D8DCC] w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-[#614270]">
                  {role === 'farmer'
                    ? t('auth.emailAlertsfarmer', {}, '📧 Email me when new reports are spotted near my farm')
                    : t('auth.emailAlertsWalker', {}, '📧 Email me updates when my reports are claimed or resolved')}
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-[#614270] w-4 h-4 flex-shrink-0"
                  required
                />
                <span className="text-sm text-[#614270]">
                  {t('auth.termsAccept', {}, 'I have read and agree to the')}{' '}
                  <button type="button" onClick={() => setLegalModal('terms')}
                    className="underline font-medium hover:opacity-70 transition-opacity"
                    style={{ color: '#614270' }}>
                    {t('home.landing.termsConditions', {}, 'Terms & Conditions')}
                  </button>
                  {' '}{t('auth.termsAnd', {}, 'and')}{' '}
                  <button type="button" onClick={() => setLegalModal('privacy')}
                    className="underline font-medium hover:opacity-70 transition-opacity"
                    style={{ color: '#614270' }}>
                    {t('home.landing.privacyPolicy', {}, 'Privacy Policy')}
                  </button>
                </span>
              </label>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#614270] mb-1">
              {t('auth.email', {}, 'Email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[#92998B] rounded-lg focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent"
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
            <div className="bg-[#FA9335]/10 border border-[#FA9335]/30 text-[#a0522d] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7D8DCC] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#6b7bb8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="text-sm text-[#92998B] hover:text-[#614270] underline transition-colors"
            >
              {t('auth.forgotPassword', {}, 'Forgot Password?')}
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-[#92998B]">
          <button
            onClick={() => router.push('/')}
            className="text-[#7D8DCC] hover:text-[#6b7bb8] font-medium transition-colors"
          >
            ← {t('common.backToHome', {}, 'Back to Home')}
          </button>
        </div>
      </div>
    </div>

      {/* Legal content modal */}

      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setLegalModal(null)}>
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D1D9C5] flex-shrink-0">
              <h2 className="font-serif font-semibold text-lg" style={{ color: '#614270' }}>
                {legalModal === 'terms' ? t('home.landing.termsConditions', {}, 'Terms & Conditions') : t('home.landing.privacyPolicy', {}, 'Privacy Policy')}
              </h2>
              <button onClick={() => setLegalModal(null)}
                className="text-[#92998B] hover:text-[#614270] transition-colors text-2xl leading-none">
                ×
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <iframe
                src={legalModal === 'terms' ? '/terms' : '/privacy'}
                className="w-full border-0"
                style={{ height: '60vh', minHeight: '400px' }}
                title={legalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              />
            </div>
            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#D1D9C5] flex-shrink-0">
              <button onClick={() => setLegalModal(null)}
                className="w-full py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{ backgroundColor: '#614270', color: '#fff' }}>
                {t('legal.close', {}, 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
