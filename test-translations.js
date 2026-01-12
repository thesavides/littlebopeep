// Quick diagnostic script to check translations in Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oyfikxdowpekmcxszbqg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTranslations() {
  console.log('🔍 Testing Supabase translations...\n')

  // Test 1: Check if languages table exists and has data
  console.log('1️⃣ Checking languages table...')
  const { data: languages, error: langError } = await supabase
    .from('languages')
    .select('*')
    .order('display_order')

  if (langError) {
    console.error('❌ Error fetching languages:', langError)
  } else {
    console.log(`✅ Found ${languages?.length || 0} languages:`)
    languages?.forEach(lang => {
      console.log(`   ${lang.flag_emoji} ${lang.name_native} (${lang.code}) - enabled: ${lang.enabled}`)
    })
  }

  console.log('\n2️⃣ Checking translations table...')

  // Test 2: Check if translations table exists
  const { data: allTranslations, error: allError } = await supabase
    .from('translations')
    .select('language_code, key, value')
    .limit(5)

  if (allError) {
    console.error('❌ Error fetching translations:', allError)
  } else {
    console.log(`✅ Translations table exists. Sample:`)
    allTranslations?.forEach(t => {
      console.log(`   [${t.language_code}] ${t.key}: "${t.value}"`)
    })
  }

  // Test 3: Count translations per language
  console.log('\n3️⃣ Counting translations per language...')
  const { data: counts, error: countError } = await supabase
    .from('translations')
    .select('language_code')

  if (countError) {
    console.error('❌ Error counting translations:', countError)
  } else {
    const countMap = {}
    counts?.forEach(t => {
      countMap[t.language_code] = (countMap[t.language_code] || 0) + 1
    })
    Object.entries(countMap).forEach(([lang, count]) => {
      console.log(`   ${lang}: ${count} translations`)
    })
  }

  // Test 4: Fetch English translations (what the app needs)
  console.log('\n4️⃣ Fetching English translations (like the app does)...')
  const { data: enTranslations, error: enError } = await supabase
    .from('translations')
    .select('key, value')
    .eq('language_code', 'en')

  if (enError) {
    console.error('❌ Error fetching English translations:', enError)
  } else {
    console.log(`✅ Found ${enTranslations?.length || 0} English translations`)
    if (enTranslations && enTranslations.length > 0) {
      console.log('   Sample keys:')
      enTranslations.slice(0, 10).forEach(t => {
        console.log(`   - ${t.key}: "${t.value}"`)
      })
    } else {
      console.log('   ⚠️ No English translations found!')
    }
  }

  console.log('\n✅ Diagnostic complete!')
}

testTranslations().catch(console.error)
