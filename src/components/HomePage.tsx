'use client'

import { useState, useEffect } from 'react'
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
  const { language } = useTranslation()
  const { setRole, setCurrentUserId } = useAppStore()

  // Auth modal
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [signupRole, setSignupRole] = useState<SignupRole>('walker')

  // Auth form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAuth(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showAuth ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showAuth])

  const openAuth = (mode: AuthMode = 'signup', role: SignupRole = 'walker') => {
    setAuthMode(mode)
    setSignupRole(role)
    setError('')
    setEmail('')
    setPassword('')
    setFullName('')
    setShowAuth(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (authMode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        const { success, user, error: err } = await signUp(email, password, fullName.trim(), signupRole)
        if (!success || !user) {
          setError(err || 'Sign up failed. Please try again.')
          setLoading(false)
          return
        }
        setCurrentUserId(user.id)
        setRole(user.role as any)
        router.push('/')
        return
      }

      const { success, user, error: err } = await signIn(email, password)
      if (!success || !user) {
        setError(err || 'Incorrect email or password')
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
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50" key={language}>

      {/* ═══════════════════════════════════════
          STICKY HEADER
      ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="sheep">🐑</span>
            <span className="font-bold text-stone-900 text-base tracking-tight">Little Bo Peep</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-medium text-stone-600 hover:text-green-700 transition-colors px-3 py-1.5"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO — ABOVE THE FOLD
      ═══════════════════════════════════════ */}
      <section className="px-4 pt-10 pb-8 max-w-lg mx-auto text-center">

        <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-4">
          Real-time countryside reporting
        </p>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 leading-[1.1] mb-4">
          Little Bo Peep<br />
          <span className="text-green-700">has lost her sheep.</span>
        </h1>

        <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-sm mx-auto">
          Help her find it &amp; report anything else along the way.
        </p>

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '👀', label: 'See it' },
            { icon: '📍', label: 'Report it' },
            { icon: '✅', label: 'Get it sorted' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => openAuth('signup', 'walker')}
              className="group flex flex-col items-center gap-2.5 py-5 px-2 bg-white rounded-2xl border border-stone-200 shadow-sm active:scale-95 hover:border-green-300 hover:shadow-md transition-all"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform" role="img">{icon}</span>
              <span className="text-xs font-bold text-stone-700 tracking-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Secondary CTA (farmer) ── */}
        <button
          onClick={() => openAuth('signup', 'farmer')}
          className="w-full py-3.5 bg-white text-stone-600 text-sm font-semibold rounded-2xl border border-stone-200 hover:border-amber-300 hover:text-amber-700 transition-colors"
        >
          🧑‍🌾 Farmer? Sign up to get alerts
        </button>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — BELOW THE FOLD
      ═══════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-stone-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-center text-xl font-bold text-stone-800 mb-8">How it works</h2>

          {/* 2×2 grid on mobile, 4-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { n: 1, icon: '👀', label: 'You see it' },
              { n: 2, icon: '📍', label: 'You report it' },
              { n: 3, icon: '🔔', label: 'Farmer is alerted' },
              { n: 4, icon: '✅', label: 'It gets resolved' },
            ].map(({ n, icon, label }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-2xl">
                    {icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-700 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST / CONTEXT
      ═══════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-sm text-stone-500 mb-6">
            Unreported issues cost time, money, and livestock.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="text-3xl font-extrabold text-green-700">33M</div>
              <div className="text-xs text-stone-500 mt-1 font-medium">Sheep in the UK</div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="text-3xl font-extrabold text-green-700">£80M</div>
              <div className="text-xs text-stone-500 mt-1 font-medium">Lost annually</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FARMER SECTION
      ═══════════════════════════════════════ */}
      <section className="px-4 pb-12 max-w-lg mx-auto">
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 text-center">
          <span className="text-4xl mb-3 block" role="img" aria-label="farmer">🧑‍🌾</span>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Own land or livestock?</h3>
          <p className="text-stone-500 text-sm mb-5 leading-relaxed">
            Get notified the moment something is reported near your land.
          </p>
          <button
            onClick={() => openAuth('signup', 'farmer')}
            className="w-full py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all shadow-sm"
          >
            Get notified when something's reported
          </button>
        </div>
      </section>

      {/* Bottom spacer so sticky CTA doesn't overlap content */}
      <div className="h-24" />

      {/* ═══════════════════════════════════════
          STICKY BOTTOM CTA
      ═══════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-20 px-4 pb-6 pt-4 bg-gradient-to-t from-stone-50 via-stone-50/80 to-transparent pointer-events-none">
        <button
          onClick={() => openAuth('signup', 'walker')}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-4 bg-green-600 text-white text-base font-bold rounded-2xl shadow-2xl pointer-events-auto active:scale-[0.98] transition-transform hover:bg-green-700"
        >
          <span>📍</span>
          <span>Report something</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════
          AUTH MODAL — BOTTOM SHEET (mobile)
                     CENTRED CARD (desktop)
      ═══════════════════════════════════════ */}
      {showAuth && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={authMode === 'signup' ? 'Create account' : 'Sign in'}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAuth(false)}
          />

          {/* Sheet / card */}
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">

            {/* Mobile pull bar */}
            <div className="sm:hidden flex justify-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-stone-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-lg font-bold text-stone-900">
                {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Mode switcher */}
            <div className="flex gap-4 px-6 pt-3 pb-0 border-b border-stone-100">
              <button
                onClick={() => { setAuthMode('signup'); setError('') }}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  authMode === 'signup'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Create account
              </button>
              <button
                onClick={() => { setAuthMode('signin'); setError('') }}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  authMode === 'signin'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                Sign in
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* Role picker — signup only */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">I am a:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('walker')}
                        className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-colors ${
                          signupRole === 'walker'
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xl">🚶</span>
                        <span className="text-sm font-bold">Walker</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('farmer')}
                        className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-colors ${
                          signupRole === 'farmer'
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-xl">🧑‍🌾</span>
                        <span className="text-sm font-bold">Farmer</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                      Full name
                    </label>
                    <input
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

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={input}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <PasswordInput
                  id="modal-password"
                  label=""
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={authMode === 'signup' ? 6 : undefined}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                />
              </div>

              {authMode === 'signin' && (
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAuth(false); router.push('/auth/forgot-password') }}
                    className="text-xs text-stone-400 hover:text-green-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-base hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading
                  ? 'Please wait…'
                  : authMode === 'signup'
                    ? 'Create account →'
                    : 'Sign in →'
                }
              </button>

              {authMode === 'signup' && (
                <p className="text-xs text-stone-400 text-center leading-relaxed">
                  By creating an account you agree to our terms. <br />
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setError('') }}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
