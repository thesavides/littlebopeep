'use client'

import type { ReactNode } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'

interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
  title?: string
  onTitleClick?: () => void
  rightSlot?: ReactNode
}

export default function Header({ showBackButton = false, onBack, title, onTitleClick, rightSlot }: HeaderProps) {
  const { t } = useTranslation()
  const { isAdmin, setShowHomePage, setRole, setAdmin } = useAppStore()

  const handleLogoClick = () => {
    setAdmin(false)
    setRole(null)
    setShowHomePage(true)
  }

  return (
    <header className={`shadow-sm sticky top-0 z-40 ${isAdmin ? 'bg-[#614270]' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Back button */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className={`p-1.5 rounded-lg transition-colors ${
              isAdmin
                ? 'text-[#D1D9C5] hover:text-white hover:bg-[#4e3359]'
                : 'text-[#92998B] hover:text-[#614270] hover:bg-[#D1D9C5]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo — tap to go home */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          aria-label="Go to home"
        >
          <img src="/logo-pin.png" alt="" aria-hidden="true" className="w-7 h-7" />
          {!title && (
            <span className={`font-serif font-semibold text-lg tracking-tight ${isAdmin ? 'text-white' : 'text-[#614270]'}`}>
              {t('header.appName', {}, 'Little Bo Peep')}
            </span>
          )}
        </button>

        {/* Page title */}
        {title && (
          onTitleClick ? (
            <button
              onClick={onTitleClick}
              className={`font-semibold hover:opacity-70 transition-opacity ${isAdmin ? 'text-white' : 'text-[#614270]'}`}
            >
              {title}
            </button>
          ) : (
            <span className={`font-semibold ${isAdmin ? 'text-white' : 'text-[#614270]'}`}>
              {title}
            </span>
          )
        )}

        {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      </div>
    </header>
  )
}
