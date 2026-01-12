// Test specific language translations
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://oyfikxdowpekmcxszbqg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLanguage(langCode, langName) {
  console.log(`\n🔍 Testing ${langName} (${langCode})...`)

  const { data, error } = await supabase
    .from('translations')
    .select('key, value')
    .eq('language_code', langCode)
    .limit(10)

  if (error) {
    console.error(`❌ Error fetching ${langName}:`, error)
    return
  }

  console.log(`✅ Found ${data?.length || 0} sample translations:`)
  data?.forEach(t => {
    console.log(`   ${t.key}: "${t.value}"`)
  })

  // Test specific homepage keys
  const homeKeys = ['home.welcomeWalker', 'home.welcomeFarmer', 'home.tagline']
  console.log(`\n   Testing critical homepage keys:`)

  for (const key of homeKeys) {
    const { data: keyData } = await supabase
      .from('translations')
      .select('value')
      .eq('language_code', langCode)
      .eq('key', key)
      .single()

    if (keyData) {
      console.log(`   ✅ ${key}: "${keyData.value}"`)
    } else {
      console.log(`   ❌ ${key}: MISSING`)
    }
  }

  // Count total translations
  const { count } = await supabase
    .from('translations')
    .select('*', { count: 'exact', head: true })
    .eq('language_code', langCode)

  console.log(`\n   Total translations: ${count}`)
}

async function main() {
  console.log('🚀 Testing all language translations...\n')

  await testLanguage('en', 'English')
  await testLanguage('cy', 'Welsh')
  await testLanguage('ga', 'Irish')
  await testLanguage('gd', 'Scottish Gaelic')

  console.log('\n✅ Test complete!')
}

main().catch(console.error)
