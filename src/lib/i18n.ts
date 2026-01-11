/**
 * Internationalization (i18n) Service
 * Database-driven translations with localStorage caching
 */

import { supabase } from './supabase-client'

export interface Language {
  code: string
  name_native: string
  name_english: string
  flag_emoji: string | null
  enabled: boolean
  display_order: number
}

export interface Translation {
  key: string
  value: string
  namespace: string
}

export type TranslationDictionary = Record<string, string>

const CACHE_PREFIX = 'translations_'
const CACHE_VERSION = 'v1'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get cache key for a language
 */
function getCacheKey(languageCode: string): string {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${languageCode}`
}

/**
 * Get cached translations from localStorage
 */
export function getCachedTranslations(languageCode: string): TranslationDictionary | null {
  try {
    const cacheKey = getCacheKey(languageCode)
    const cached = localStorage.getItem(cacheKey)

    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    const age = Date.now() - timestamp

    if (age > CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return data
  } catch (error) {
    console.error('Error reading translation cache:', error)
    return null
  }
}

/**
 * Cache translations in localStorage
 */
export function cacheTranslations(languageCode: string, translations: TranslationDictionary): void {
  try {
    const cacheKey = getCacheKey(languageCode)
    const cacheData = {
      data: translations,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching translations:', error)
  }
}

/**
 * Fetch all supported languages
 */
export async function fetchLanguages(): Promise<Language[]> {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .eq('enabled', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching languages:', error)
    return []
  }

  return data || []
}

/**
 * Fetch all translations for a language
 */
export async function fetchTranslations(languageCode: string): Promise<TranslationDictionary> {
  // Check cache first
  const cached = getCachedTranslations(languageCode)
  if (cached) {
    return cached
  }

  // Fetch from database
  const { data, error } = await supabase
    .from('translations')
    .select('key, value')
    .eq('language_code', languageCode)

  if (error) {
    console.error(`Error fetching translations for ${languageCode}:`, error)
    return {}
  }

  // Convert array to dictionary
  const translations: TranslationDictionary = {}
  data?.forEach((t) => {
    translations[t.key] = t.value
  })

  // Cache for future use
  cacheTranslations(languageCode, translations)

  return translations
}

/**
 * Get a single translation with fallback
 */
export async function getTranslation(
  key: string,
  languageCode: string = 'en'
): Promise<string> {
  const { data, error } = await supabase
    .rpc('get_translation', {
      p_key: key,
      p_language_code: languageCode,
    })

  if (error) {
    console.error(`Error getting translation for ${key}:`, error)
    return key
  }

  return data || key
}

/**
 * Upsert a translation (insert or update)
 */
export async function upsertTranslation(
  key: string,
  languageCode: string,
  value: string,
  namespace: string = 'common',
  context?: string
): Promise<boolean> {
  const { error } = await supabase.rpc('upsert_translation', {
    p_key: key,
    p_language_code: languageCode,
    p_value: value,
    p_namespace: namespace,
    p_context: context,
  })

  if (error) {
    console.error('Error upserting translation:', error)
    return false
  }

  // Invalidate cache
  clearTranslationCache(languageCode)
  return true
}

/**
 * Bulk insert translations
 */
export async function bulkUpsertTranslations(
  translations: Array<{
    key: string
    languageCode: string
    value: string
    namespace?: string
    context?: string
  }>
): Promise<boolean> {
  try {
    const inserts = translations.map((t) => ({
      key: t.key,
      language_code: t.languageCode,
      value: t.value,
      namespace: t.namespace || 'common',
      context: t.context || null,
    }))

    const { error } = await supabase
      .from('translations')
      .upsert(inserts, {
        onConflict: 'key,language_code',
      })

    if (error) {
      console.error('Error bulk upserting translations:', error)
      return false
    }

    // Clear all caches for affected languages
    const languageCodes = [...new Set(translations.map((t) => t.languageCode))]
    languageCodes.forEach(clearTranslationCache)

    return true
  } catch (error) {
    console.error('Error in bulk upsert:', error)
    return false
  }
}

/**
 * Clear translation cache for a specific language
 */
export function clearTranslationCache(languageCode: string): void {
  const cacheKey = getCacheKey(languageCode)
  localStorage.removeItem(cacheKey)
}

/**
 * Clear all translation caches
 */
export function clearAllTranslationCaches(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key))
}

/**
 * Detect browser language and return supported code or fallback
 */
export function detectBrowserLanguage(supportedLanguages: Language[]): string {
  const browserLang = navigator.language.toLowerCase().split('-')[0]
  const supported = supportedLanguages.find((l) => l.code === browserLang)
  return supported ? supported.code : 'en'
}

/**
 * Format interpolated strings
 * Example: formatString("Hello {name}!", { name: "John" }) => "Hello John!"
 */
export function formatString(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match
  })
}

/**
 * Get translation with interpolation
 */
export function translate(
  key: string,
  translations: TranslationDictionary,
  params?: Record<string, string | number>,
  fallback?: string
): string {
  const template = translations[key] || fallback || key

  if (params) {
    return formatString(template, params)
  }

  return template
}
