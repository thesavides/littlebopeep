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
  const { t, language } = useTranslation()
  const { setRole, setCurrentUserId } = useAppStore()

  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('signup')
  const [signupRole, setSignupRole] = useState<SignupRole>('walker')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAuth(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
          setError(t('auth.nameRequired', {}, 'Please enter your full name'))
          setLoading(false)
          return
        }
        const { success, user, error: err } = await signUp(email, password, fullName.trim(), signupRole)
        if (!success || !user) {
          setError(err || t('auth.signupFailed', {}, 'Sign up failed. Please try again.'))
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
        setError(err || t('auth.authenticationFailed', {}, 'Incorrect email or password'))
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

  const actionCards = [
    { icon: '👀', label: t('home.landing.seeIt',     {}, 'See it') },
    { icon: '📍', label: t('home.landing.reportIt',  {}, 'Report it') },
    { icon: '✅', label: t('home.landing.getSorted', {}, 'Get it sorted') },
  ]

  const steps = [
    { n: 1, icon: '👀', label: t('home.landing.step1', {}, 'You see it') },
    { n: 2, icon: '📍', label: t('home.landing.step2', {}, 'You report it') },
    { n: 3, icon: '🔔', label: t('home.landing.step3', {}, 'Farmer is alerted') },
    { n: 4, icon: '✅', label: t('home.landing.step4', {}, 'It gets resolved') },
  ]

  return (
    <div className="min-h-screen bg-[#D1D9C5]" key={language}>

      {/* ═══════════════════════════════════════
          STICKY HEADER
      ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-[#D1D9C5]/95 backdrop-blur-sm border-b border-[#92998B]/30">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <img src="/logo-pin.png" alt="" aria-hidden="true" className="w-7 h-7" />
            <span className="font-serif font-semibold text-[#614270] text-base tracking-tight">Little Bo Peep</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-medium text-[#92998B] hover:text-[#614270] transition-colors px-3 py-1.5"
            >
              {t('auth.signIn', {}, 'Sign in')}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO — ABOVE THE FOLD
      ═══════════════════════════════════════ */}
      <section className="px-4 pt-10 pb-8 max-w-lg mx-auto text-center">

        <p className="text-xs font-bold tracking-widest text-[#7D8DCC] uppercase mb-4">
          {t('home.landing.eyebrow', {}, 'Real-time countryside reporting')}
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#614270] leading-[1.15] mb-4">
          Little Bo Peep<br />
          <span className="text-[#7D8DCC]">{t('home.landing.headlinePart2', {}, 'has lost her sheep.')}</span>
        </h1>

        <p className="text-[#92998B] text-sm font-medium mb-8 max-w-sm mx-auto whitespace-nowrap overflow-hidden text-ellipsis">
          {t('home.landing.subheadline', {}, 'Help find it & report anything else along the way.')}
        </p>

        {/* ── Action Cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {actionCards.map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => openAuth('signup', 'walker')}
              className="group flex flex-col items-center gap-2.5 py-5 px-2 bg-white rounded-2xl border border-[#D1D9C5] shadow-sm active:scale-95 hover:border-[#7D8DCC] hover:shadow-md transition-all"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform" role="img">{icon}</span>
              <span className="text-xs font-bold text-[#614270] tracking-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Farmer CTA ── */}
        <button
          onClick={() => openAuth('signup', 'farmer')}
          className="w-full py-3.5 bg-white text-[#92998B] text-sm font-semibold rounded-2xl border border-[#D1D9C5] hover:border-[#614270] hover:text-[#614270] transition-colors"
        >
          🧑‍🌾 {t('home.landing.farmerCta', {}, 'Farmer? Sign up to get alerts')}
        </button>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — BELOW THE FOLD
      ═══════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-[#D1D9C5]">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-center text-xl font-serif font-semibold text-[#614270] mb-8">
            {t('home.howItWorks', {}, 'How it works')}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map(({ n, icon, label }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-full bg-[#D1D9C5] border-2 border-[#92998B]/40 flex items-center justify-center text-2xl">
                    {icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#614270] text-white text-[10px] font-bold flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#614270] leading-tight">{label}</p>
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
          <p className="text-sm text-[#92998B] mb-6">
            {t('home.landing.trustText', {}, 'Unreported issues cost time, money, and livestock.')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#D1D9C5] shadow-sm p-5">
              <div className="text-3xl font-extrabold text-[#614270] font-serif">33M</div>
              <div className="text-xs text-[#92998B] mt-1 font-medium">
                {t('home.landing.stat1Label', {}, 'Sheep in the UK')}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#D1D9C5] shadow-sm p-5">
              <div className="text-3xl font-extrabold text-[#614270] font-serif">£80M</div>
              <div className="text-xs text-[#92998B] mt-1 font-medium">
                {t('home.landing.stat2Label', {}, 'Lost annually')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FARMER SECTION
      ═══════════════════════════════════════ */}
      <section className="px-4 pb-12 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-[#614270]/20 p-6 text-center">
          <span className="text-4xl mb-3 block" role="img" aria-label="farmer">🧑‍🌾</span>
          <h3 className="font-serif text-xl font-semibold text-[#614270] mb-2">
            {t('home.landing.farmerHeadline', {}, 'Own land or livestock?')}
          </h3>
          <p className="text-[#92998B] text-sm mb-5 leading-relaxed">
            {t('home.landing.farmerBody', {}, 'Get notified the moment something is reported near your land.')}
          </p>
          <button
            onClick={() => openAuth('signup', 'farmer')}
            className="w-full py-3.5 bg-[#614270] text-white font-bold rounded-xl hover:bg-[#4e3359] active:scale-[0.98] transition-all shadow-sm"
          >
            {t('home.landing.farmerButton', {}, "Get notified when something's reported")}
          </button>
        </div>
      </section>

      <div className="h-24" />

      {/* ═══════════════════════════════════════
          STICKY BOTTOM CTA
      ═══════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-20 px-4 pb-6 pt-4 bg-gradient-to-t from-[#D1D9C5] via-[#D1D9C5]/80 to-transparent pointer-events-none">
        <button
          onClick={() => openAuth('signup', 'walker')}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 py-4 bg-[#7D8DCC] text-white text-base font-bold rounded-2xl shadow-2xl pointer-events-auto active:scale-[0.98] transition-transform hover:bg-[#6b7bb8]"
        >
          <span>📍</span>
          <span>{t('home.landing.reportCta', {}, 'Report something')}</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════
          AUTH MODAL
      ═══════════════════════════════════════ */}
      {showAuth && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAuth(false)} />

          {/* Sheet / card */}
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">

            {/* Mobile pull bar */}
            <div className="sm:hidden flex justify-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-[#D1D9C5]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <h2 className="text-lg font-serif font-semibold text-[#614270]">
                {authMode === 'signup'
                  ? t('home.landing.createAccountTitle', {}, 'Create your account')
                  : t('home.landing.welcomeBack', {}, 'Welcome back')}
              </h2>
              <button
                onClick={() => setShowAuth(false)}
                className="w-8 h-8 rounded-full bg-[#D1D9C5] flex items-center justify-center text-[#92998B] hover:bg-[#c4ceba] transition-colors text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Mode switcher */}
            <div className="flex gap-4 px-6 pt-3 pb-0 border-b border-[#D1D9C5]">
              <button
                onClick={() => { setAuthMode('signup'); setError('') }}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  authMode === 'signup'
                    ? 'border-[#614270] text-[#614270]'
                    : 'border-transparent text-[#92998B] hover:text-[#614270]'
                }`}
              >
                {t('home.landing.createAccountTab', {}, 'Create account')}
              </button>
              <button
                onClick={() => { setAuthMode('signin'); setError('') }}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  authMode === 'signin'
                    ? 'border-[#614270] text-[#614270]'
                    : 'border-transparent text-[#92998B] hover:text-[#614270]'
                }`}
              >
                {t('auth.signIn', {}, 'Sign in')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {authMode === 'signup' && (
                <>
                  <div>
                    <p className="text-xs font-bold text-[#92998B] uppercase tracking-widest mb-2">
                      {t('auth.iAmA', {}, 'I am a:')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole('walker')}
                        className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-colors ${
                          signupRole === 'walker'
                            ? 'border-[#7D8DCC] bg-[#7D8DCC]/10 text-[#614270]'
                            : 'border-[#D1D9C5] text-[#92998B] hover:border-[#92998B]'
                        }`}
                      >
                        <span className="text-xl">🚶</span>
                        <span className="text-sm font-bold">{t('auth.walker', {}, 'Walker')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('farmer')}
                        className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-colors ${
                          signupRole === 'farmer'
                            ? 'border-[#614270] bg-[#614270]/10 text-[#614270]'
                            : 'border-[#D1D9C5] text-[#92998B] hover:border-[#92998B]'
                        }`}
                      >
                        <span className="text-xl">🧑‍🌾</span>
                        <span className="text-sm font-bold">{t('auth.farmer', {}, 'Farmer')}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#92998B] uppercase tracking-wide mb-1.5">
                      {t('home.landing.fullName', {}, 'Full name')}
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
                <label className="block text-xs font-bold text-[#92998B] uppercase tracking-wide mb-1.5">
                  {t('auth.email', {}, 'Email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={t('auth.emailPlaceholder', {}, 'you@example.com')}
                  className={input}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#92998B] uppercase tracking-wide mb-1.5">
                  {t('auth.password', {}, 'Password')}
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
                    className="text-xs text-[#92998B] hover:text-[#7D8DCC] transition-colors"
                  >
                    {t('home.landing.forgotPassword', {}, 'Forgot password?')}
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-[#FA9335]/10 border border-[#FA9335]/30 text-[#c96a00] px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#7D8DCC] text-white rounded-xl font-bold text-base hover:bg-[#6b7bb8] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading
                  ? t('common.pleaseWait', {}, 'Please wait…')
                  : authMode === 'signup'
                    ? t('home.landing.createAccountBtn', {}, 'Create account →')
                    : t('home.landing.signInBtn', {}, 'Sign in →')
                }
              </button>

              {authMode === 'signup' && (
                <p className="text-xs text-[#92998B] text-center leading-relaxed">
                  {t('home.landing.terms', {}, 'By creating an account you agree to our terms.')}{' '}
                  <br />
                  {t('auth.alreadyHaveAccount', {}, 'Already have an account?')}{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setError('') }}
                    className="text-[#7D8DCC] font-semibold hover:underline"
                  >
                    {t('auth.signIn', {}, 'Sign in')}
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
