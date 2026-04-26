'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAppStore } from '@/store/appStore'

export default function SiteNav() {
  const { t, language, changeLanguage, languages } = useTranslation()
  const { currentRole } = useAppStore()
  const [langOpen, setLangOpen] = useState(false)

  const currentLang = languages.find((l) => l.code === language)
  const isLoggedIn = !!currentRole

  return (
    <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
      <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-8 h-8" />
          <span className="font-serif font-semibold text-lg tracking-tight leading-none">
            <span style={{ color: '#614270' }}>Little </span>
            <span style={{ color: '#92998B' }}>Bo </span>
            <span style={{ color: '#614270' }}>Peep</span>
          </span>
        </Link>

        {/* Centre nav links (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-5">
          <Link href="/about" className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#614270' }}>
            {t('home.landing.aboutUs', {}, 'About us')}
          </Link>
          <Link href="/faq" className="text-sm hover:opacity-80 transition-opacity" style={{ color: '#614270' }}>
            {t('home.landing.faq', {}, 'FAQ')}
          </Link>
        </div>

        {/* Right: language + auth action */}
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

          {/* Auth action */}
          {isLoggedIn ? (
            <button
              onClick={() => useAppStore.getState().setShowHomePage(false)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('home.landing.dashboard', {}, 'Dashboard →')}
            </button>
          ) : (
            <Link
              href="/auth"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('auth.signIn', {}, 'Sign in')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
