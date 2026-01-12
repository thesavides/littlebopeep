'use client'

import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'

export default function LanguageSelector() {
  const { language, languages, changeLanguage, getCurrentLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  // CRITICAL: Must recalculate on every render when language changes
  // Using language in the component scope ensures re-render on language change
  const currentLang = getCurrentLanguage()

  console.log('🔄 LanguageSelector rendering with language:', language, 'currentLang:', currentLang)

  if (languages.length === 0) {
    return null // Don't show if no languages loaded yet
  }

  return (
    <div className="relative">
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Select language"
      >
        <span className="text-xl" role="img" aria-label={currentLang?.name_english || 'Language'}>
          {currentLang?.flag_emoji || '🌐'}
        </span>
        <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">
          {currentLang?.name_native || 'Language'}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 min-w-[220px] z-50 border border-slate-200 dark:border-slate-700">
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Select Language
              </p>
            </div>

            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  console.log('🔘 Language button clicked:', lang.code, lang.name_native)
                  changeLanguage(lang.code)
                  setIsOpen(false)
                  console.log('🔘 Dropdown closed')
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  lang.code === language ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                aria-current={lang.code === language ? 'true' : 'false'}
              >
                {/* Flag */}
                <span className="text-2xl" role="img" aria-label={lang.name_english}>
                  {lang.flag_emoji || '🌐'}
                </span>

                {/* Language Names */}
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {lang.name_native}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {lang.name_english}
                  </div>
                </div>

                {/* Selected Indicator */}
                {lang.code === language && (
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
