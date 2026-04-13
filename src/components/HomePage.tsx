'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'
import { signIn, signUp } from '@/lib/unified-auth'
import LanguageSelector from './LanguageSelector'
import PasswordInput from './PasswordInput'
import { input } from '@/lib/ui'

type AuthMode = 'signin' | 'signup'
type SignupRole = 'walker' | 'farmer'

export default function HomePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const {
    setRole,
    setAdmin,
    setCurrentUserId,
    canAccessWalkerFeatures,
    canAccessFarmerFeatures,
  } = useAppStore()

  // Auth form state
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [signupRole, setSignupRole] = useState<SignupRole>('walker')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already authenticated, skip the form entirely and route straight in
  const handleAlreadyLoggedIn = (role: SignupRole) => {
    if (role === 'walker' && canAccessWalkerFeatures()) {
      setRole('walker')
      return true
    }
    if (role === 'farmer' && canAccessFarmerFeatures()) {
      setRole('farmer')
      return true
    }
    return false
  }

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
        const { success, user, error: signUpError } = await signUp(email, password, fullName.trim(), signupRole)
        if (!success || !user) {
          setError(signUpError || t('auth.signupFailed', {}, 'Sign up failed'))
          setLoading(false)
          return
        }
        setCurrentUserId(user.id)
        setRole(user.role as any)
        router.push('/')
        return
      }

      const { success, user, error: signInError } = await signIn(email, password)
      if (!success || !user) {
        setError(signInError || t('auth.authenticationFailed', {}, 'Incorrect email or password'))
        setLoading(false)
        return
      }
      setCurrentUserId(user.id)
      setRole(user.role as any)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐑</span>
          <span className="font-bold text-green-800 text-lg">Little Bo Peep</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={() => router.push('/admin-login')}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">

        {/* ── Hero ────────────────────────────────────────────── */}
        <div className="text-center pt-8 pb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            Helping sheep<br className="sm:hidden" /> get home
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Connect countryside walkers with farmers to recover lost livestock — fast.
          </p>
          <p className="text-xs text-slate-400 mt-2 tracking-wide">littlebopeep.app</p>
        </div>

        {/* ── Auth card ───────────────────────────────────────── */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

            {/* Tab switcher */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => { setMode('signin'); setError('') }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  mode === 'signin'
                    ? 'text-green-700 border-b-2 border-green-600 bg-green-50/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError('') }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  mode === 'signup'
                    ? 'text-green-700 border-b-2 border-green-600 bg-green-50/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Sign-up only fields */}
              {mode === 'signup' && (
                <>
                  {/* Role picker */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">I am a:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('walker')}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors ${
                          signupRole === 'walker'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">🚶</span>
                        <span className="text-sm font-medium">Walker</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('farmer')}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors ${
                          signupRole === 'farmer'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">🧑‍🌾</span>
                        <span className="text-sm font-medium">Farmer</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className={input}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={input}
                />
              </div>

              {/* Password */}
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                required
                minLength={mode === 'signup' ? 6 : undefined}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="••••••••"
              />

              {/* Forgot password */}
              {mode === 'signin' && (
                <div className="text-right -mt-1">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-xs text-slate-400 hover:text-green-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading
                  ? 'Please wait…'
                  : mode === 'signin'
                    ? 'Sign In →'
                    : 'Create Account →'
                }
              </button>

              {/* Sign-up helper */}
              {mode === 'signup' && (
                <p className="text-xs text-slate-400 text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setError('') }}
                    className="text-green-600 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ── How it works ────────────────────────────────────── */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-center text-xl font-bold text-slate-700 mb-8">How it works</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { n: '1', icon: '🚶', title: 'Spot', body: 'Walker sees lost sheep on their route' },
              { n: '2', icon: '📍', title: 'Report', body: 'Pin location, add a photo and condition' },
              { n: '3', icon: '🏡', title: 'Reunite', body: 'Farmer gets an alert and recovers the flock' },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
                  {icon}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{title}</p>
                <p className="text-xs text-slate-500 leading-snug">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
          {[
            { value: '33M', label: 'Sheep in UK' },
            { value: '£80M', label: 'Annual losses' },
            { value: 'Free', label: '30-day trial' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
              <div className="text-xl font-bold text-green-600">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
