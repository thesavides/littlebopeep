'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  fetchTranslations,
  fetchLanguages,
  translate,
  detectBrowserLanguage,
  clearTranslationCache,
  type Language,
  type TranslationDictionary,
} from '@/lib/i18n'

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string
  language: string
  changeLanguage: (newLanguage: string) => Promise<void>
  getCurrentLanguage: () => Language | undefined
  languages: Language[]
  isLoading: boolean
  error: string | null
  refreshTranslations: () => Promise<void>
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState<TranslationDictionary>({})
  const [languages, setLanguages] = useState<Language[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize languages
  useEffect(() => {
    async function initializeLanguage() {
      try {
        const availableLanguages = await fetchLanguages()
        setLanguages(availableLanguages)

        const storedLang = localStorage.getItem('preferred_language')
        let initialLang = 'en'

        if (storedLang && availableLanguages.some((l) => l.code === storedLang)) {
          initialLang = storedLang
        } else {
          initialLang = detectBrowserLanguage(availableLanguages)
        }

        console.log('🌐 TranslationContext: Initializing with language:', initialLang)
        setCurrentLanguage(initialLang)
      } catch (err) {
        console.error('Error initializing language:', err)
        setError('Failed to load languages')
      }
    }

    initializeLanguage()
  }, [])

  // Load translations when language changes
  useEffect(() => {
    async function loadTranslations() {
      console.log('🌐 TranslationContext: Loading translations for:', currentLanguage)
      setIsLoading(true)
      setError(null)

      try {
        const translationsData = await fetchTranslations(currentLanguage)
        console.log('🌐 TranslationContext: Translations loaded:', Object.keys(translationsData).length, 'keys')
        setTranslations(translationsData)
      } catch (err) {
        console.error(`Error loading translations for ${currentLanguage}:`, err)
        setError(`Failed to load translations for ${currentLanguage}`)

        if (currentLanguage !== 'en') {
          try {
            const fallbackTranslations = await fetchTranslations('en')
            setTranslations(fallbackTranslations)
          } catch (fallbackErr) {
            console.error('Error loading fallback English translations:', fallbackErr)
          }
        }
      } finally {
        setIsLoading(false)
        console.log('🌐 TranslationContext: Translation loading complete for:', currentLanguage)
      }
    }

    if (currentLanguage) {
      loadTranslations()
    }
  }, [currentLanguage])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>, fallback?: string): string => {
      return translate(key, translations, params, fallback)
    },
    [translations]
  )

  const changeLanguage = useCallback(async (newLanguage: string) => {
    console.log('🌐 TranslationContext: changeLanguage called:', { to: newLanguage })

    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferred_language', newLanguage)
    console.log('🌐 TranslationContext: Language changed to:', newLanguage)
  }, [])

  const getCurrentLanguage = useCallback((): Language | undefined => {
    return languages.find((l) => l.code === currentLanguage)
  }, [languages, currentLanguage])

  const refreshTranslations = useCallback(async () => {
    setIsLoading(true)
    try {
      clearTranslationCache(currentLanguage)
      const translationsData = await fetchTranslations(currentLanguage)
      setTranslations(translationsData)
    } catch (err) {
      console.error('Error refreshing translations:', err)
      setError('Failed to refresh translations')
    } finally {
      setIsLoading(false)
    }
  }, [currentLanguage])

  const value: TranslationContextType = {
    t,
    language: currentLanguage,
    changeLanguage,
    getCurrentLanguage,
    languages,
    isLoading,
    error,
    refreshTranslations,
  }

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
