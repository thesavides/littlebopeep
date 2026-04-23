'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'

export default function AboutPage() {
  const { t, language, changeLanguage, languages } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = languages.find((l) => l.code === language)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-8 h-8" />
            <span className="font-serif font-semibold text-lg tracking-tight leading-none">
              <span style={{ color: '#614270' }}>Little </span>
              <span style={{ color: '#92998B' }}>Bo </span>
              <span style={{ color: '#614270' }}>Peep</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
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

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-4 text-center">
        <p
          className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ backgroundColor: 'rgba(125,141,204,0.15)', color: '#7D8DCC' }}
        >
          Real-time countryside reporting
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl leading-snug" style={{ color: '#614270' }}>
          About Little Bo Peep <span style={{ color: '#92998B' }}>&</span> Its Founder
        </h1>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div
          className="rounded-2xl p-6 sm:p-10 text-base leading-relaxed space-y-5"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(146,153,139,0.3)', color: '#3e2c48' }}
        >
          <p>
            Little Bo Peep began with a simple idea from <strong style={{ color: '#614270' }}>Jessica Whitcutt</strong>, shaped through time spent walking the Welsh countryside near Llanrwst.
          </p>
          <p>
            What she experienced there is not unique to Wales. It is simply where the idea became clear.
          </p>
          <p>
            Across rural landscapes, the same patterns exist. Livestock roam freely. Land stretches across vast areas. Things go wrong. Animals get into trouble. Fences break. Trees fall. And often, farmers are simply not aware in the moment, not through lack of care or effort, but because of the sheer scale of what they are managing.
          </p>
          <p>
            At the same time, there are people moving through these spaces every day. Walkers, ramblers, and nature lovers who notice what is happening around them and who would help if there were a simple, direct way to do so.
          </p>
          <p className="font-semibold" style={{ color: '#614270' }}>
            Little Bo Peep connects those two worlds.
          </p>
          <p>
            It allows anyone out walking to quickly report what they see. A pinned location, a photo, and a short description are sent directly to the people who need to know. For farmers, this acts as a prompt, an extra set of eyes across their land, helping surface issues sooner so they can act faster.
          </p>
          <p>
            Importantly, farmers stay in control. They can define their land, choose exactly what they want to be notified about, and filter the type of reports they receive so the system remains useful rather than overwhelming.
          </p>
          <p>
            While the name may reference sheep, the platform is designed for all livestock, infrastructure such as fences and gates, and environmental issues like fallen trees or blocked paths.
          </p>
          <p>
            From the beginning, Jessica has approached this as a shared, community-driven effort. The goal is to create a practical partnership between walkers, farmers, and everyone connected to the countryside, bringing better balance and awareness to how land is used and cared for.
          </p>
          <p>
            To reflect the broader reach of the problem, Little Bo Peep is being developed with localisation in mind, including support for regional UK languages, ensuring it can be used naturally by the communities it is built for.
          </p>
          <p>
            This is not a profit-driven project. Keeping it accessible and as close to cost-free as possible is a priority. To make that sustainable, Jessica is actively seeking partnerships with organisations connected to rural life, from agricultural suppliers to technology and mapping partners.
          </p>
          <p>
            If you are interested in supporting, sponsoring, or collaborating, you are invited to get involved.
          </p>

          {/* Contact CTA */}
          <div className="pt-4 flex flex-col items-center gap-2">
            <a
              href="mailto:info@littlebopeep.app"
              className="rounded-full px-6 py-3 text-sm font-semibold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              Get in touch at info@littlebopeep.app
            </a>
          </div>

          {/* Closing */}
          <div
            className="mt-6 pt-6 text-center italic"
            style={{ borderTop: '1px solid rgba(146,153,139,0.3)', color: '#614270' }}
          >
            <p>Little Bo Peep is built on a simple idea.</p>
            <p>The people already walking the land can help look after it.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(146,153,139,0.3)' }}>
        <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline opacity-70 hover:opacity-100 transition-opacity">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-5 h-5" />
            <span className="text-xs font-serif font-semibold tracking-tight leading-none">
              <span style={{ color: '#614270' }}>Little </span>
              <span style={{ color: '#92998B' }}>Bo </span>
              <span style={{ color: '#614270' }}>Peep</span>
            </span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: t('home.landing.aboutUs', {}, 'About us'), href: '/about' },
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
