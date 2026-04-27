/**
 * Seed missing translation keys (walker alerts, sync UI, offline, landing page)
 * Usage:
 *   node scripts/seed-missing-translations.mjs                  # seed English only
 *   ANTHROPIC_API_KEY=sk-... node scripts/seed-missing-translations.mjs --translate  # seed + translate
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ss9Nxv30n6SKVkUTv5dqfw_tJAT4zEL'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const KEYS = [
  // Offline sync banner — sign-in prompt
  { key: 'sync.signInToUpload', value: 'Sign in to upload your saved reports', namespace: 'sync' },
  { key: 'sync.signIn', value: 'Sign in', namespace: 'sync' },

  // Offline mode banner
  { key: 'offline.notSignedIn', value: "You're offline. Sign in when you have signal to sync your reports.", namespace: 'offline' },

  // Walker bottom nav
  { key: 'walker.nav.alerts', value: 'Alerts', namespace: 'walker' },

  // Walker alerts tab header
  { key: 'walker.alerts', value: 'Alerts', namespace: 'walker' },

  // Walker notifications empty state
  { key: 'walker.notif.empty', value: 'No notifications yet', namespace: 'walker' },
  { key: 'walker.notif.emptyHint', value: "You'll be notified when a farmer responds to your report", namespace: 'walker' },

  // Landing page About Us link
  { key: 'home.landing.aboutUs', value: 'About Us', namespace: 'home' },
]

const TARGET_LANGUAGES = [
  { code: 'cy', name: 'Welsh (Cymraeg)' },
  { code: 'ga', name: 'Irish (Gaeilge)' },
  { code: 'gd', name: 'Scottish Gaelic (Gàidhlig)' },
]

async function seedEnglish() {
  console.log(`\n📝 Seeding ${KEYS.length} English keys...`)
  const rows = KEYS.map((k) => ({ key: k.key, language_code: 'en', value: k.value, namespace: k.namespace }))
  const { error } = await supabase.from('translations').upsert(rows, { onConflict: 'key,language_code' })
  if (error) { console.error('❌ English seed failed:', error.message); return false }
  console.log(`✅ Seeded ${rows.length} English translations`)
  return true
}

async function translateBatch(texts, targetLang) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const prompt = `Translate the following UI strings from English to ${targetLang.name}. These are short UI labels and messages for a countryside reporting app called Little Bo Peep.

Rules:
- Keep proper nouns in English: Little Bo Peep, Cymraeg, Gaeilge, Gàidhlig, littlebopeep.app
- Keep button labels that appear verbatim in the UI in English where appropriate
- Translate naturally and idiomatically, not word-for-word
- Return ONLY a JSON array of translated strings in the same order as the input, no other text

Input strings (one per line):
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${err}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`Could not parse JSON from response: ${text.slice(0, 200)}`)
  return JSON.parse(match[0])
}

async function translateLanguage(lang) {
  console.log(`\n🌍 Translating to ${lang.name}...`)

  const BATCH_SIZE = 30
  const rows = []

  for (let i = 0; i < KEYS.length; i += BATCH_SIZE) {
    const batch = KEYS.slice(i, i + BATCH_SIZE)
    const texts = batch.map((k) => k.value)
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(KEYS.length / BATCH_SIZE)} (${texts.length} strings)...`)

    const translated = await translateBatch(texts, lang)

    if (translated.length !== batch.length) {
      throw new Error(`Translation count mismatch: expected ${batch.length}, got ${translated.length}`)
    }

    for (let j = 0; j < batch.length; j++) {
      rows.push({
        key: batch[j].key,
        language_code: lang.code,
        value: translated[j],
        namespace: batch[j].namespace,
      })
    }
  }

  const { error } = await supabase.from('translations').upsert(rows, { onConflict: 'key,language_code' })
  if (error) { console.error(`❌ ${lang.name} upsert failed:`, error.message); return false }
  console.log(`✅ Upserted ${rows.length} ${lang.name} translations`)
  return true
}

async function main() {
  const doTranslate = process.argv.includes('--translate')

  const ok = await seedEnglish()
  if (!ok) process.exit(1)

  if (doTranslate) {
    for (const lang of TARGET_LANGUAGES) {
      await translateLanguage(lang)
    }
  } else {
    console.log('\nℹ️  Pass --translate to also generate cy/ga/gd translations')
  }

  console.log('\n🎉 Done!')
}

main().catch((err) => { console.error(err); process.exit(1) })
