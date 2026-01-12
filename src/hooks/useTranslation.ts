/**
 * useTranslation Hook
 * React hook for accessing translations in components
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchTranslations,
  fetchLanguages,
  translate,
  detectBrowserLanguage,
  type Language,
  type TranslationDictionary,
} from '@/lib/i18n'
import { useAppStore } from '@/store/appStore'

export function useTranslation() {
  const { currentUserId, users } = useAppStore()
  const [translations, setTranslations] = useState<TranslationDictionary>({})
  const [languages, setLanguages] = useState<Language[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user from store
  const currentUser = currentUserId ? users.find(u => u.id === currentUserId) : null

  // Determine initial language
  useEffect(() => {
    async function initializeLanguage() {
      try {
        // Fetch available languages
        const availableLanguages = await fetchLanguages()
        setLanguages(availableLanguages)

        // Priority order:
        // 1. User preference (if logged in)
        // 2. localStorage preference (if guest)
        // 3. Browser language (if supported)
        // 4. Default to English
        let initialLang = 'en'

        if (currentUser?.preferred_language) {
          initialLang = currentUser.preferred_language
        } else {
          const storedLang = localStorage.getItem('preferred_language')
          if (storedLang && availableLanguages.some((l) => l.code === storedLang)) {
            initialLang = storedLang
          } else {
            initialLang = detectBrowserLanguage(availableLanguages)
          }
        }

        setCurrentLanguage(initialLang)
      } catch (err) {
        console.error('Error initializing language:', err)
        setError('Failed to load languages')
      }
    }

    initializeLanguage()
  }, [currentUser])

  // Load translations when language changes
  useEffect(() => {
    async function loadTranslations() {
      console.log('🌐 Loading translations for:', currentLanguage)
      setIsLoading(true)
      setError(null)

      try {
        const translationsData = await fetchTranslations(currentLanguage)
        console.log('🌐 Translations loaded:', Object.keys(translationsData).length, 'keys')
        setTranslations(translationsData)
      } catch (err) {
        console.error(`Error loading translations for ${currentLanguage}:`, err)
        setError(`Failed to load translations for ${currentLanguage}`)

        // Fallback to English
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
        console.log('🌐 Translation loading complete for:', currentLanguage)
      }
    }

    if (currentLanguage) {
      loadTranslations()
    }
  }, [currentLanguage])

  /**
   * Get translation by key
   * @param key - Translation key (e.g., 'auth.login.title')
   * @param params - Optional parameters for string interpolation
   * @param fallback - Optional fallback text if translation not found
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>, fallback?: string): string => {
      const result = translate(key, translations, params, fallback)
      // Debug: Log first few translations to verify they're changing
      if (key === 'home.welcomeWalker' || key === 'home.welcomeFarmer') {
        console.log(`🌐 t('${key}') in ${currentLanguage}:`, result)
      }
      return result
    },
    [translations, currentLanguage] // Include currentLanguage to force re-creation when language changes
  )

  /**
   * Change the current language
   * @param newLanguage - Language code (e.g., 'cy', 'ga', 'gd')
   */
  const changeLanguage = useCallback(
    async (newLanguage: string) => {
      console.log('🌐 changeLanguage called:', { from: currentLanguage, to: newLanguage })

      if (newLanguage === currentLanguage) {
        console.log('🌐 Language unchanged, skipping')
        return
      }

      // Update state
      console.log('🌐 Setting current language to:', newLanguage)
      setCurrentLanguage(newLanguage)

      // Persist to localStorage
      localStorage.setItem('preferred_language', newLanguage)
      console.log('🌐 Saved to localStorage:', newLanguage)

      // TODO: Update user preference in database if logged in
      // This will be implemented when we integrate with user profile
    },
    [currentLanguage]
  )

  /**
   * Get current language details
   */
  const getCurrentLanguage = useCallback((): Language | undefined => {
    return languages.find((l) => l.code === currentLanguage)
  }, [languages, currentLanguage])

  /**
   * Refresh translations from server (bypassing cache)
   */
  const refreshTranslations = useCallback(async () => {
    setIsLoading(true)
    try {
      // Clear cache and reload - use the clearTranslationCache function from i18n
      const { clearTranslationCache } = await import('@/lib/i18n')
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

  return {
    t,
    language: currentLanguage,
    changeLanguage,
    getCurrentLanguage,
    languages,
    isLoading,
    error,
    refreshTranslations,
  }
}
