'use client'

import Link from 'next/link'
import { useTranslation } from '@/contexts/TranslationContext'
import { useAppStore } from '@/store/appStore'

export default function SiteFooter() {
  const { t } = useTranslation()
  const { currentRole } = useAppStore()
  const isLoggedIn = !!currentRole

  const links = [
    { label: t('home.landing.aboutUs', {}, 'About us'), href: '/about' },
    { label: t('home.landing.faq', {}, 'FAQ'), href: '/faq' },
    { label: t('home.landing.privacyPolicy', {}, 'Privacy policy'), href: '/privacy' },
    { label: t('home.landing.termsConditions', {}, 'Terms & conditions'), href: '/terms' },
    ...(isLoggedIn
      ? []
      : [
          { label: t('auth.signIn', {}, 'Sign in'), href: '/auth' },
          { label: t('home.landing.farmerSignup', {}, 'Farmer sign-up'), href: '/auth?mode=signup&role=farmer' },
        ]),
  ]

  return (
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
          {links.map((link) => (
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

        {isLoggedIn && (
          <button
            onClick={() => useAppStore.getState().setShowHomePage(false)}
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: '#7D8DCC' }}
          >
            {t('home.landing.dashboard', {}, 'Dashboard →')}
          </button>
        )}
      </div>
    </footer>
  )
}
