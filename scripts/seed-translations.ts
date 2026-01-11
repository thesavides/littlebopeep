/**
 * Seed Translation Script
 * Run this to:
 * 1. Insert English base translations into Supabase
 * 2. Generate AI translations for Welsh, Irish, Scottish Gaelic
 *
 * Usage:
 *   npx ts-node scripts/seed-translations.ts
 *
 * Or with arguments:
 *   npx ts-node scripts/seed-translations.ts --translate-all
 *   npx ts-node scripts/seed-translations.ts --language=cy
 */

import { createClient } from '@supabase/supabase-js'
import { englishTranslations } from '../src/lib/seed-translations'
import { translateAll, verifyTranslation } from '../src/lib/ai-translator'
import type { TranslationEntry } from '../src/lib/ai-translator'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyfikxdowpekmcxszbqg.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const TARGET_LANGUAGES = ['cy', 'ga', 'gd']

async function seedEnglish() {
  console.log('📝 Seeding English translations...')

  const inserts = englishTranslations.map((t) => ({
    key: t.key,
    language_code: 'en',
    value: t.value,
    namespace: t.namespace,
    context: t.context || null,
  }))

  const { error } = await supabase
    .from('translations')
    .upsert(inserts, { onConflict: 'key,language_code' })

  if (error) {
    console.error('❌ Error seeding English translations:', error)
    return false
  }

  console.log(`✅ Seeded ${englishTranslations.length} English translations`)
  return true
}

async function translateLanguage(languageCode: string) {
  console.log(`\n🌍 Translating to ${languageCode.toUpperCase()}...`)

  // Check if ANTHROPIC_API_KEY is set
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set - skipping AI translation')
    console.log('   Set ANTHROPIC_API_KEY environment variable to enable AI translation')
    return false
  }

  try {
    // Translate all English strings
    const translated = await translateAll(englishTranslations, languageCode)

    console.log(`✅ Translated ${translated.length} strings to ${languageCode.toUpperCase()}`)

    // Verify translations
    let validCount = 0
    let invalidCount = 0

    for (let i = 0; i < englishTranslations.length; i++) {
      const verification = verifyTranslation(englishTranslations[i], translated[i])
      if (verification.valid) {
        validCount++
      } else {
        invalidCount++
        console.warn(`⚠️  Issues with ${englishTranslations[i].key}:`, verification.issues)
      }
    }

    console.log(`   Valid: ${validCount}, Invalid: ${invalidCount}`)

    // Insert into database
    const inserts = translated.map((t) => ({
      key: t.key,
      language_code: languageCode,
      value: t.value,
      namespace: t.namespace,
      context: null,
    }))

    const { error } = await supabase
      .from('translations')
      .upsert(inserts, { onConflict: 'key,language_code' })

    if (error) {
      console.error(`❌ Error inserting ${languageCode.toUpperCase()} translations:`, error)
      return false
    }

    // Mark as AI-generated in metadata
    const metadata = translated.map((t) => ({
      translation_key: t.key,
      language_code: languageCode,
      is_ai_generated: true,
      is_verified: false,
    }))

    await supabase
      .from('translation_metadata')
      .upsert(metadata, { onConflict: 'translation_key,language_code' })

    console.log(`✅ Inserted ${translated.length} ${languageCode.toUpperCase()} translations into database`)
    return true
  } catch (error) {
    console.error(`❌ Error translating to ${languageCode.toUpperCase()}:`, error)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  const translateAll = args.includes('--translate-all')
  const specificLanguage = args.find((arg) => arg.startsWith('--language='))?.split('=')[1]

  console.log('🚀 Starting translation seeding process...\n')

  // Step 1: Seed English
  const englishSuccess = await seedEnglish()
  if (!englishSuccess) {
    console.error('❌ Failed to seed English translations - aborting')
    process.exit(1)
  }

  // Step 2: Translate to other languages
  if (translateAll) {
    console.log('\n🌍 Translating to all languages...')
    for (const lang of TARGET_LANGUAGES) {
      await translateLanguage(lang)
      // Small delay between languages
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  } else if (specificLanguage) {
    if (!TARGET_LANGUAGES.includes(specificLanguage)) {
      console.error(`❌ Invalid language code: ${specificLanguage}`)
      console.log(`   Supported languages: ${TARGET_LANGUAGES.join(', ')}`)
      process.exit(1)
    }
    await translateLanguage(specificLanguage)
  } else {
    console.log('\n💡 Run with --translate-all to generate AI translations for all languages')
    console.log('   Or use --language=cy to translate to a specific language')
  }

  console.log('\n✨ Translation seeding complete!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
