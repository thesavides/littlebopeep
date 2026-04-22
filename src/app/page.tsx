'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'
import WalkerDashboard from '@/components/WalkerDashboard'
import FarmerDashboard from '@/components/FarmerDashboard'
import AdminDashboard from '@/components/AdminDashboard'

// ─── Landing page (logged-out view) ──────────────────────────────────────────

function LandingPage() {
  const { t, language, changeLanguage, languages } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === language)

  const cards = [
    {
      step: '1',
      icon: '👀',
      title: t('home.landing.seeIt', {}, 'See it'),
      desc: t('home.landing.seeItDesc', {}, 'Spot an issue on your walk — animals, fences, gates, or fly-tipping.'),
    },
    {
      step: '2',
      icon: '📍',
      title: t('home.landing.reportIt', {}, 'Report it'),
      desc: t('home.landing.reportItDesc', {}, 'Pin it on the map and add a quick note. Takes about 30 seconds.'),
    },
    {
      step: '3',
      icon: '✅',
      title: t('home.landing.getSorted', {}, 'Get it sorted'),
      desc: t('home.landing.getSortedDesc', {}, 'The right farmer gets an instant alert and can act straight away.'),
    },
  ]

  const steps = [
    {
      num: '01',
      title: t('home.landing.step1Title', {}, 'Spot something'),
      desc: t('home.landing.step1Desc', {}, 'Notice an issue on farmland while out walking.'),
    },
    {
      num: '02',
      title: t('home.landing.step2Title', {}, 'Open the app'),
      desc: t('home.landing.step2Desc', {}, "No fuss — just tap Report and you're straight in."),
    },
    {
      num: '03',
      title: t('home.landing.step3Title', {}, 'Pin & describe'),
      desc: t('home.landing.step3Desc', {}, 'Drop a pin, pick a category, add a photo if you like.'),
    },
    {
      num: '04',
      title: t('home.landing.step4Title', {}, 'Farmer is notified'),
      desc: t('home.landing.step4Desc', {}, 'They get an alert and can respond straight away.'),
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-pin.png" alt="" aria-hidden="true" className="w-7 h-7" />
            <span className="font-serif font-semibold text-sm tracking-tight" style={{ color: '#614270' }}>
              Little Bo Peep
            </span>
          </Link>

          {/* Right: language + sign in */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                style={{ borderColor: '#92998B', color: '#92998B' }}
              >
                <span>{currentLang?.flag_emoji ?? '🌐'}</span>
                <span>{currentLang?.code?.toUpperCase() ?? 'EN'}</span>
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50"
                  style={{ backgroundColor: '#D1D9C5', borderColor: '#92998B', minWidth: '140px' }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: lang.code === language ? 'rgba(97,66,112,0.1)' : 'transparent',
                        color: '#614270',
                        fontWeight: lang.code === language ? 600 : 400,
                      }}
                    >
                      <span>{lang.flag_emoji}</span>
                      <span>{lang.name_native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign in */}
            <Link
              href="/auth"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('auth.signIn', {}, 'Sign in')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pt-8 pb-6 text-center">
        {/* Eyebrow */}
        <p
          className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-6"
          style={{ backgroundColor: 'rgba(125,141,204,0.15)', color: '#7D8DCC' }}
        >
          {t('home.landing.eyebrow', {}, 'Real-Time Countryside Reporting')}
        </p>

        {/* Headline */}
        <h1
          className="font-serif text-3xl sm:text-4xl leading-snug mb-5 max-w-2xl mx-auto"
          style={{ color: '#614270' }}
        >
          {t('home.landing.heroLine1', {}, 'Little Bo Peep')}<br />
          <span style={{ color: '#7D8DCC' }}>{t('home.landing.heroLine2', {}, 'has lost her sheep.')}</span><br />
          {t('home.landing.heroLine3', {}, 'Help find them and')}<br />
          {t('home.landing.heroLine4', {}, 'report anything along the way.')}
        </h1>
      </section>

      {/* ── Three cards ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-6">
        <div className="grid grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.step}
              className="rounded-2xl p-5 flex flex-col items-center text-center gap-2"
              style={{ backgroundColor: '#fff', border: '1px solid rgba(146,153,139,0.3)' }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#92998B' }}
              >
                {t('home.landing.stepLabel', {}, 'Step')} {card.step}
              </div>
              <div className="text-3xl">{card.icon}</div>
              <h3 className="font-semibold text-base" style={{ color: '#614270' }}>
                {card.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTAs ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-10 flex flex-col items-center gap-4">
        <Link
          href="/auth?mode=signup"
          className="rounded-full px-8 py-4 text-base font-semibold text-center transition-opacity hover:opacity-90 w-full sm:w-auto sm:min-w-[280px]"
          style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
        >
          {t('home.landing.ctaPrimary', {}, 'Sign up & report')}
        </Link>
        <Link
          href="/auth?mode=signup&role=farmer"
          className="rounded-full px-8 py-3.5 text-sm font-medium text-center border transition-colors hover:opacity-80 w-full sm:w-auto sm:min-w-[280px]"
          style={{ borderColor: '#614270', color: '#614270' }}
        >
          {t('home.landing.ctaFarmer', {}, 'Farmer? Sign up to get alerts')}
        </Link>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-14" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-5xl px-5">
          <h2
            className="font-serif text-center text-2xl font-semibold mb-10"
            style={{ color: '#614270' }}
          >
            {t('home.howItWorks', {}, 'How it works')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-start">
                <div
                  className="text-4xl font-bold mb-3 leading-none font-serif"
                  style={{ color: '#D1D9C5' }}
                >
                  {step.num}
                </div>
                <h3 className="font-semibold text-base mb-1" style={{ color: '#614270' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#92998B' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: '#614270' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold font-serif mb-1" style={{ color: '#D1D9C5' }}>
                {t('home.landing.stat1Value', {}, '33M')}
              </p>
              <p className="text-sm" style={{ color: 'rgba(209,217,197,0.7)' }}>
                {t('home.landing.stat1Label', {}, 'sheep in the UK')}
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-1" style={{ color: '#D1D9C5' }}>
                {t('home.landing.stat2Value', {}, '£80M')}
              </p>
              <p className="text-sm" style={{ color: 'rgba(209,217,197,0.7)' }}>
                {t('home.landing.stat2Label', {}, 'in livestock losses each year')}
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-1" style={{ color: '#D1D9C5' }}>
                {t('home.landing.stat3Value', {}, '30')}
                <span className="text-2xl font-semibold">{t('home.landing.stat3Unit', {}, '-day')}</span>
              </p>
              <p className="text-sm" style={{ color: 'rgba(209,217,197,0.7)' }}>
                {t('home.landing.stat3Label', {}, 'free trial for farmers')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(146,153,139,0.3)' }}>
        <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline opacity-70 hover:opacity-100 transition-opacity">
            <img src="/logo-pin.png" alt="" aria-hidden="true" className="w-6 h-6" />
            <span className="text-xs font-serif font-semibold tracking-tight" style={{ color: '#614270' }}>
              Little Bo Peep
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: t('home.landing.privacyPolicy', {}, 'Privacy policy'), href: '/privacy' },
              { label: t('home.landing.termsConditions', {}, 'Terms & conditions'), href: '/terms' },
              { label: t('auth.signIn', {}, 'Sign in'), href: '/auth' },
              { label: t('home.landing.farmerSignup', {}, 'Farmer sign-up'), href: '/auth?mode=signup&role=farmer' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: '#92998B' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  )
}

// ─── Root page router ─────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter()
  const { currentRole, showHomePage, isAdmin } = useAppStore()

  // Supabase sometimes lands the user on / instead of /auth/reset-password
  // when the redirect_to param is missing. Detect the recovery token here and redirect.
  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(window.location.search)
    if (
      (hash && hash.includes('type=recovery')) ||
      params.get('type') === 'recovery'
    ) {
      router.replace('/auth/reset-password' + window.location.hash + window.location.search)
      return
    }
  }, [])

  if (showHomePage || !currentRole) {
    return <LandingPage />
  }

  if (isAdmin || currentRole === 'admin' || currentRole === 'super_admin') {
    return <AdminDashboard />
  }

  if (currentRole === 'walker') {
    return <WalkerDashboard />
  }

  if (currentRole === 'farmer') {
    return <FarmerDashboard />
  }

  return <LandingPage />
}
