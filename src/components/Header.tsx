'use client'

import { useAppStore } from '@/store/appStore'
import { useTranslation } from '@/contexts/TranslationContext'

interface HeaderProps {
  showBackButton?: boolean
  onBack?: () => void
  title?: string
  onTitleClick?: () => void
}

export default function Header({ showBackButton = false, onBack, title, onTitleClick }: HeaderProps) {
  const { t } = useTranslation()
  const { isAdmin, setShowHomePage, setRole, setAdmin } = useAppStore()

  const handleLogoClick = () => {
    setAdmin(false)
    setRole(null)
    setShowHomePage(true)
  }

  return (
    <header className={`shadow-sm sticky top-0 z-40 ${isAdmin ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Back button */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className={`p-1.5 rounded-lg transition-colors ${
              isAdmin
                ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
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
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to home"
        >
          <span className="text-2xl" aria-hidden="true">🐑</span>
          {!title && (
            <span className={`font-bold ${isAdmin ? 'text-white' : 'text-green-800'}`}>
              {t('header.appName', {}, 'Little Bo Peep')}
            </span>
          )}
        </button>

        {/* Page title */}
        {title && (
          onTitleClick ? (
            <button
              onClick={onTitleClick}
              className={`font-semibold hover:opacity-70 transition-opacity ${isAdmin ? 'text-white' : 'text-slate-800'}`}
            >
              {title}
            </button>
          ) : (
            <span className={`font-semibold ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
              {title}
            </span>
          )
        )}
      </div>
    </header>
  )
}
