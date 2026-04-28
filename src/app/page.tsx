'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'
import WalkerDashboard from '@/components/WalkerDashboard'
import FarmerDashboard from '@/components/FarmerDashboard'
import AdminDashboard from '@/components/AdminDashboard'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

// ─── Landing page (logged-out view) ──────────────────────────────────────────

function LandingPage() {
  const { t } = useTranslation()
  const { currentRole } = useAppStore()
  const isLoggedIn = !!currentRole

  const cards = [
    {
      step: '1',
      icon: '👀',
      title: t('home.landing.seeIt', {}, 'See it'),
      desc: t('home.landing.seeItDesc', {}, 'Spot an issue on your walk, animals, fences, gates, or fly-tipping.'),
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
      desc: t('home.landing.step2Desc', {}, "No fuss, just tap Report and you're straight in."),
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

      <SiteNav />

      {/* ── Hero (with sheep-on-road background) ─────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'url(/hero-sheep.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark plum gradient overlay for text legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(97,66,112,0.275) 0%, rgba(97,66,112,0.175) 45%, rgba(97,66,112,0.275) 100%)',
          }}
        />

        {/* Content — compact on mobile, taller on desktop so the image breathes */}
        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-10 sm:min-h-[520px] sm:pt-12 sm:pb-14 text-center sm:flex sm:flex-col sm:items-center sm:justify-center">
          {/* Eyebrow */}
          <p
            className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
          >
            {t('home.landing.eyebrow', {}, 'Real-Time Countryside Reporting')}
          </p>

          {/* Headline */}
          <h1
            className="font-serif text-2xl sm:text-5xl leading-snug sm:leading-tight mb-2 max-w-3xl mx-auto"
            style={{ color: '#ffffff', textShadow: '0 2px 16px rgba(30,18,40,0.6)' }}
          >
            {t('home.landing.heroLine1', {}, 'Little Bo Peep')}{' '}
            <span style={{ color: '#EADA69' }}>{t('home.landing.heroLine2', {}, 'has lost her sheep.')}</span><br />
            {t('home.landing.heroLine3', {}, 'Help find them and')}{' '}
            {t('home.landing.heroLine4', {}, 'report anything along the way.')}
          </h1>
        </div>
      </section>

      {/* ── Three steps (illustrated, on white for legibility) ───────────── */}
      <section className="py-6 sm:py-8" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-8">

            {/* Step 1 — See it: walker emoji matching profile avatar style */}
            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(97,66,112,0.08)', border: '2.5px solid #614270' }}>
                🚶
              </div>
              <div className="text-2xl sm:text-3xl font-bold leading-none font-serif mt-1" style={{ color: '#D1D9C5' }}>01</div>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#614270' }}>{cards[0].title}</h3>
              <p className="text-xs sm:text-sm leading-snug" style={{ color: '#92998B' }}>{cards[0].desc}</p>
            </div>

            {/* Step 2 — Report it: brand map-pin logo (no border — it's its own shape) */}
            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-12 w-12 flex items-center justify-center">
                <img src="/logo-pin.svg" alt="" aria-hidden="true" className="h-12 w-12" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold leading-none font-serif mt-1" style={{ color: '#D1D9C5' }}>02</div>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#614270' }}>{cards[1].title}</h3>
              <p className="text-xs sm:text-sm leading-snug" style={{ color: '#92998B' }}>{cards[1].desc}</p>
            </div>

            {/* Step 3 — Get it sorted: tick in Green circle (same border treatment as Step 1) */}
            <div className="flex flex-col items-center text-center gap-1">
              <div className="h-12 w-12 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="21" stroke="#614270" strokeWidth="2.5" fill="rgba(97,66,112,0.08)"/>
                  <polyline points="14,25 21,32 34,17" stroke="#9ED663" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold leading-none font-serif mt-1" style={{ color: '#D1D9C5' }}>03</div>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: '#614270' }}>{cards[2].title}</h3>
              <p className="text-xs sm:text-sm leading-snug" style={{ color: '#92998B' }}>{cards[2].desc}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTAs ─────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-5xl px-5 py-6 sm:py-8 flex flex-col items-stretch gap-3 sm:items-center"
      >
        {isLoggedIn ? (
          <>
            <button
              onClick={() => useAppStore.getState().setShowHomePage(false)}
              className="rounded-full px-8 py-3.5 sm:py-4 text-base font-semibold text-center transition-opacity hover:opacity-90 w-full sm:w-auto sm:min-w-[280px]"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('home.landing.report', {}, 'Report')}
            </button>
            <button
              onClick={() => useAppStore.getState().setShowHomePage(false)}
              className="rounded-full px-8 py-3 sm:py-3.5 text-sm font-medium text-center border transition-colors hover:opacity-80 w-full sm:w-auto sm:min-w-[280px]"
              style={{ borderColor: '#614270', color: '#614270' }}
            >
              {t('home.landing.goToDashboard', {}, 'Go to dashboard →')}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth?mode=signup"
              className="rounded-full px-8 py-3.5 sm:py-4 text-base font-semibold text-center transition-opacity hover:opacity-90 w-full sm:w-auto sm:min-w-[280px]"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('home.landing.ctaPrimary', {}, 'Sign up & report')}
            </Link>
            <Link
              href="/auth?mode=signup&role=farmer"
              className="rounded-full px-8 py-3 sm:py-3.5 text-sm font-medium text-center border transition-colors hover:opacity-80 w-full sm:w-auto sm:min-w-[280px]"
              style={{ borderColor: '#614270', color: '#614270' }}
            >
              {t('home.landing.ctaFarmer', {}, 'Farmer? Sign up to get alerts')}
            </Link>
          </>
        )}
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-8" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-5xl px-5">
          <h2
            className="font-serif text-center text-2xl font-semibold mb-6"
            style={{ color: '#614270' }}
          >
            {t('home.howItWorks', {}, 'How it works')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div
                  className="text-4xl font-bold mb-2 leading-none font-serif"
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

      <SiteFooter />
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
