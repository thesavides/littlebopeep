/**
 * Seed FAQ + Chat translation keys
 * Usage:
 *   node scripts/seed-faq-translations.mjs                  # seed English only
 *   ANTHROPIC_API_KEY=sk-... node scripts/seed-faq-translations.mjs --translate  # seed + translate
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ss9Nxv30n6SKVkUTv5dqfw_tJAT4zEL'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const FAQ_KEYS = [
  // Page header
  { key: 'faq.eyebrow', value: 'Help & Support', namespace: 'faq' },
  { key: 'faq.title', value: 'Frequently Asked Questions', namespace: 'faq' },
  { key: 'faq.subtitle', value: 'Step-by-step answers for walkers and farmers. Need help in your language? Use the chat assistant in the bottom-right corner.', namespace: 'faq' },
  { key: 'faq.section.walkers', value: 'For Walkers', namespace: 'faq' },
  { key: 'faq.section.farmers', value: 'For Farmers', namespace: 'faq' },
  { key: 'faq.chat.title', value: "Can't find what you're looking for?", namespace: 'faq' },
  { key: 'faq.chat.subtitle', value: 'Use the chat assistant (bottom-right) to ask a question in any language.', namespace: 'faq' },

  // Walker FAQ
  { key: 'faq.walker.submit.q', value: 'How do I submit a report?', namespace: 'faq' },
  { key: 'faq.walker.submit.s1', value: 'Open the app.', namespace: 'faq' },
  { key: 'faq.walker.submit.s2', value: 'Tap the + button at the bottom of the screen.', namespace: 'faq' },
  { key: 'faq.walker.submit.s3', value: 'Tap Use my location (or pin the spot manually on the map). Tap Confirm location.', namespace: 'faq' },
  { key: 'faq.walker.submit.s4', value: 'Choose a category (e.g. Sheep, Fence, Road).', namespace: 'faq' },
  { key: 'faq.walker.submit.s5', value: 'Tick any conditions that apply, and enter a count if asked.', namespace: 'faq' },
  { key: 'faq.walker.submit.s6', value: 'Add a short description.', namespace: 'faq' },
  { key: 'faq.walker.submit.s7', value: '(Optional) Tap Camera to take a photo, or Library to add an existing one. Up to 3 photos.', namespace: 'faq' },
  { key: 'faq.walker.submit.s8', value: 'Tap Submit Report.', namespace: 'faq' },

  { key: 'faq.walker.guest.q', value: 'How do I submit a report without an account?', namespace: 'faq' },
  { key: 'faq.walker.guest.s1', value: 'Follow the reporting steps above without signing in.', namespace: 'faq' },
  { key: 'faq.walker.guest.s2', value: 'On the last step, fill in your name, email, and phone number.', namespace: 'faq' },
  { key: 'faq.walker.guest.s3', value: 'Tap Submit Report.', namespace: 'faq' },
  { key: 'faq.walker.guest.note', value: 'As a guest you cannot edit your report or receive status updates.', namespace: 'faq' },

  { key: 'faq.walker.offline.q', value: 'How do I submit a report when I have no signal?', namespace: 'faq' },
  { key: 'faq.walker.offline.s1', value: 'Open the app — you will see an Offline mode banner at the top.', namespace: 'faq' },
  { key: 'faq.walker.offline.s2', value: 'Tap the + button.', namespace: 'faq' },
  { key: 'faq.walker.offline.s3', value: 'Fill in the report as normal, including photos.', namespace: 'faq' },
  { key: 'faq.walker.offline.s4', value: 'Tap Save for later. The report is saved on your device.', namespace: 'faq' },
  { key: 'faq.walker.offline.s5', value: 'When you have signal again, open the app.', namespace: 'faq' },
  { key: 'faq.walker.offline.s6', value: 'Tap Sync now on the banner. Your report is sent.', namespace: 'faq' },

  { key: 'faq.walker.edit.q', value: 'How do I edit a report I already submitted?', namespace: 'faq' },
  { key: 'faq.walker.edit.s1', value: 'Tap the Mine tab at the bottom of the screen.', namespace: 'faq' },
  { key: 'faq.walker.edit.s2', value: 'Find the report you want to change.', namespace: 'faq' },
  { key: 'faq.walker.edit.s3', value: 'Tap Edit on the report card. (If there is no Edit button, the report is already resolved or completed and cannot be changed.)', namespace: 'faq' },
  { key: 'faq.walker.edit.s4', value: 'Update the description, count, conditions, or add photos.', namespace: 'faq' },
  { key: 'faq.walker.edit.s5', value: 'Tap Save.', namespace: 'faq' },

  { key: 'faq.walker.status.q', value: 'How do I check the status of my report?', namespace: 'faq' },
  { key: 'faq.walker.status.s1', value: 'Tap the Mine tab.', namespace: 'faq' },
  { key: 'faq.walker.status.s2', value: 'Each report shows a status badge: Reported (waiting), Claimed (a farmer has it), Resolved (farmer has dealt with it), or Complete (closed by admin).', namespace: 'faq' },

  { key: 'faq.walker.notifications.q', value: 'How do I read messages from farmers?', namespace: 'faq' },
  { key: 'faq.walker.notifications.s1', value: 'Tap the bell icon at the top of the screen.', namespace: 'faq' },
  { key: 'faq.walker.notifications.s2', value: 'Your inbox shows all updates: claims, resolutions, and thank-you notes.', namespace: 'faq' },
  { key: 'faq.walker.notifications.s3', value: 'Tap a notification to see the full message.', namespace: 'faq' },

  { key: 'faq.walker.emailoff.q', value: 'How do I turn off email alerts?', namespace: 'faq' },
  { key: 'faq.walker.emailoff.s1', value: 'Tap the bell icon to open notifications.', namespace: 'faq' },
  { key: 'faq.walker.emailoff.s2', value: 'Tap the Email alerts toggle to switch it off. You will still see in-app notifications.', namespace: 'faq' },

  { key: 'faq.walker.language.q', value: 'How do I change the language?', namespace: 'faq' },
  { key: 'faq.walker.language.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.walker.language.s2', value: 'Tap Language.', namespace: 'faq' },
  { key: 'faq.walker.language.s3', value: 'Choose English, Welsh (Cymraeg), Irish (Gaeilge), or Scottish Gaelic (Gàidhlig).', namespace: 'faq' },

  { key: 'faq.walker.pwa.q', value: 'How do I install the app on my phone?', namespace: 'faq' },
  { key: 'faq.walker.pwa.s1', value: "Open the website on your phone's browser.", namespace: 'faq' },
  { key: 'faq.walker.pwa.s2', value: "Wait for the Install prompt to appear (or tap the browser's Add to Home Screen option).", namespace: 'faq' },
  { key: 'faq.walker.pwa.s3', value: 'Tap Install. The app is now on your home screen.', namespace: 'faq' },

  // Farmer FAQ
  { key: 'faq.farmer.signup.q', value: 'How do I sign up as a farmer?', namespace: 'faq' },
  { key: 'faq.farmer.signup.s1', value: 'Go to the sign-up page and choose Farmer.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s2', value: 'Step 1: Enter your name, email, and phone number.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s3', value: 'Step 2: Enter your billing address.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s4', value: "Step 3: Pin your farm's main location on the map.", namespace: 'faq' },
  { key: 'faq.farmer.signup.s5', value: 'Step 4: Create your first farm — give it a name and set the alert buffer.', namespace: 'faq' },
  { key: 'faq.farmer.signup.s6', value: 'Step 5: Set up your subscription. Your 30-day free trial starts immediately.', namespace: 'faq' },

  { key: 'faq.farmer.addfarm.q', value: 'How do I add another farm?', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s1', value: 'Open your dashboard.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s2', value: 'Tap Add Farm.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s3', value: 'Enter the farm name.', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s4', value: 'Set the alert buffer using the slider (default is 500m).', namespace: 'faq' },
  { key: 'faq.farmer.addfarm.s5', value: 'Tap Save.', namespace: 'faq' },

  { key: 'faq.farmer.drawfield.q', value: 'How do I draw a field?', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s1', value: 'Open the farm.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s2', value: 'Tap Add Field.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s3', value: 'Tap points on the map to place fence posts (minimum 3).', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s4', value: 'To adjust, drag any fence post to a new spot.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s5', value: 'Enter the field name and (optional) sheep count.', namespace: 'faq' },
  { key: 'faq.farmer.drawfield.s6', value: 'Tap Save Field.', namespace: 'faq' },

  { key: 'faq.farmer.buffer.q', value: 'How do I change my alert buffer?', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s1', value: 'Open your farm settings.', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s2', value: 'Drag the Alert buffer slider (between 100m and 10km).', namespace: 'faq' },
  { key: 'faq.farmer.buffer.s3', value: 'Tap Save.', namespace: 'faq' },
  { key: 'faq.farmer.buffer.note', value: 'A wider buffer catches more reports but also more reports from outside your land.', namespace: 'faq' },

  { key: 'faq.farmer.claim.q', value: 'How do I claim a report?', namespace: 'faq' },
  { key: 'faq.farmer.claim.s1', value: 'Open the report from your dashboard.', namespace: 'faq' },
  { key: 'faq.farmer.claim.s2', value: 'Tap Claim (or Claim with message to add a note for the walker).', namespace: 'faq' },
  { key: 'faq.farmer.claim.s3', value: 'The walker is automatically notified.', namespace: 'faq' },

  { key: 'faq.farmer.resolve.q', value: 'How do I resolve a report?', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s1', value: 'Open the claimed report.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s2', value: 'Tap Resolve.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s3', value: 'Choose a reason: Resolved / Resolved — Nothing to do / Resolved — Insufficient information / Resolved — Invalid report.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s4', value: '(Optional) Add a message for the walker.', namespace: 'faq' },
  { key: 'faq.farmer.resolve.s5', value: 'Tap Confirm.', namespace: 'faq' },

  { key: 'faq.farmer.unclaim.q', value: 'How do I unclaim a report?', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s1', value: 'Open a report you previously claimed.', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s2', value: 'Tap Unclaim.', namespace: 'faq' },
  { key: 'faq.farmer.unclaim.s3', value: 'If no other farmer has claimed it, the report goes back to Reported.', namespace: 'faq' },

  { key: 'faq.farmer.reopen.q', value: 'How do I reopen a resolved report?', namespace: 'faq' },
  { key: 'faq.farmer.reopen.s1', value: 'Open the resolved report.', namespace: 'faq' },
  { key: 'faq.farmer.reopen.s2', value: 'Tap Reopen. The report goes back to Claimed.', namespace: 'faq' },
  { key: 'faq.farmer.reopen.note', value: 'If the report has been marked Complete by an admin, you cannot reopen it yourself — tap Request Reopen to message the admin.', namespace: 'faq' },

  { key: 'faq.farmer.thankyou.q', value: 'How do I send a thank-you to the walker?', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s1', value: 'Open a claimed report.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s2', value: 'Tap Thank You.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s3', value: 'Type a short message.', namespace: 'faq' },
  { key: 'faq.farmer.thankyou.s4', value: 'Tap Send.', namespace: 'faq' },

  { key: 'faq.farmer.flag.q', value: 'How do I flag a report as suspicious or wrong?', namespace: 'faq' },
  { key: 'faq.farmer.flag.s1', value: 'Open the report.', namespace: 'faq' },
  { key: 'faq.farmer.flag.s2', value: 'Tap Flag to Admin.', namespace: 'faq' },
  { key: 'faq.farmer.flag.s3', value: "Type a note explaining what's wrong.", namespace: 'faq' },
  { key: 'faq.farmer.flag.s4', value: 'Tap Submit.', namespace: 'faq' },

  { key: 'faq.farmer.subscriptions.q', value: "How do I turn off alerts for a category I don't need?", namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.s1', value: 'At farm level: open your farm settings, find the category, and tap the toggle to turn it off.', namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.s2', value: 'At field level (overrides farm setting): open the field, tap Category subscriptions, and toggle each category on or off for that field only.', namespace: 'faq' },
  { key: 'faq.farmer.subscriptions.note', value: 'Some categories marked Compulsory cannot be turned off.', namespace: 'faq' },

  { key: 'faq.farmer.emailoff.q', value: 'How do I turn off email alerts?', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s2', value: 'Tap Notification settings.', namespace: 'faq' },
  { key: 'faq.farmer.emailoff.s3', value: 'Toggle Email alerts off. You will still see in-app alerts.', namespace: 'faq' },

  { key: 'faq.farmer.cancel.q', value: 'How do I cancel my subscription?', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s1', value: 'Open your profile menu.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s2', value: 'Tap Subscription.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s3', value: 'Tap Cancel subscription.', namespace: 'faq' },
  { key: 'faq.farmer.cancel.s4', value: 'Confirm. Your account stays active until the trial or billing period ends.', namespace: 'faq' },

  { key: 'faq.farmer.deletefield.q', value: 'How do I delete a field?', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s1', value: 'Open the field.', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s2', value: 'Tap Delete field.', namespace: 'faq' },
  { key: 'faq.farmer.deletefield.s3', value: 'Confirm.', namespace: 'faq' },

  { key: 'faq.farmer.deletefarm.q', value: 'How do I delete a farm?', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s1', value: 'Open the farm.', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s2', value: 'Tap Delete farm.', namespace: 'faq' },
  { key: 'faq.farmer.deletefarm.s3', value: 'Confirm. All fields under that farm are also deleted.', namespace: 'faq' },

  // Chat widget
  { key: 'chat.greeting', value: "Hi! I'm the Little Bo Peep help assistant. Ask me anything about using the app — I can answer in any language.", namespace: 'chat' },
  { key: 'chat.title', value: 'Help Assistant', namespace: 'chat' },
  { key: 'chat.subtitle', value: 'Ask anything, any language', namespace: 'chat' },
  { key: 'chat.placeholder', value: 'Ask a question…', namespace: 'chat' },
  { key: 'chat.send', value: 'Send', namespace: 'chat' },
  { key: 'chat.close', value: 'Close', namespace: 'chat' },
  { key: 'chat.open', value: 'Open help chat', namespace: 'chat' },
  { key: 'chat.error', value: 'Sorry, something went wrong. Please try again.', namespace: 'chat' },
  { key: 'chat.poweredBy', value: 'Powered by AI · Not a substitute for official advice', namespace: 'chat' },
]

const TARGET_LANGUAGES = [
  { code: 'cy', name: 'Welsh (Cymraeg)' },
  { code: 'ga', name: 'Irish (Gaeilge)' },
  { code: 'gd', name: 'Scottish Gaelic (Gàidhlig)' },
]

async function seedEnglish() {
  console.log(`\n📝 Seeding ${FAQ_KEYS.length} English keys...`)
  const rows = FAQ_KEYS.map((k) => ({ key: k.key, language_code: 'en', value: k.value, namespace: k.namespace }))
  const { error } = await supabase.from('translations').upsert(rows, { onConflict: 'key,language_code' })
  if (error) { console.error('❌ English seed failed:', error.message); return false }
  console.log(`✅ Seeded ${rows.length} English translations`)
  return true
}

async function translateBatch(texts, targetLang) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

  const prompt = `Translate the following UI strings from English to ${targetLang.name}. These are step-by-step instructions for a countryside reporting app called Little Bo Peep.

Rules:
- Keep proper nouns in English: Little Bo Peep, Cymraeg, Gaeilge, Gàidhlig, littlebopeep.app, info@littlebopeep.app
- Keep button labels in English that appear in the UI: Claim, Resolve, Unclaim, Reopen, Submit Report, Save, Edit, Flag to Admin, Thank You, Add Farm, Add Field, Save Field, Sync now, Mine, Cancel subscription, Delete field, Delete farm, Notification settings, Category subscriptions, Alert buffer
- Keep technical terms: PWA, Email alerts
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
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${err}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()
  // Extract JSON array
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`Could not parse JSON from response: ${text.slice(0, 200)}`)
  return JSON.parse(match[0])
}

async function translateLanguage(lang) {
  console.log(`\n🌍 Translating to ${lang.name}...`)

  const BATCH_SIZE = 30
  const rows = []

  for (let i = 0; i < FAQ_KEYS.length; i += BATCH_SIZE) {
    const batch = FAQ_KEYS.slice(i, i + BATCH_SIZE)
    const texts = batch.map((k) => k.value)
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(FAQ_KEYS.length / BATCH_SIZE)} (${texts.length} strings)...`)

    const translated = await translateBatch(texts, lang)

    if (translated.length !== texts.length) {
      throw new Error(`Translation count mismatch: got ${translated.length}, expected ${texts.length}`)
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
  if (error) { console.error(`❌ ${lang.name} insert failed:`, error.message); return false }
  console.log(`✅ Inserted ${rows.length} ${lang.name} translations`)
  return true
}

const doTranslate = process.argv.includes('--translate')

const englishOk = await seedEnglish()
if (!englishOk) process.exit(1)

if (doTranslate) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY is required for --translate')
    console.log('   Usage: ANTHROPIC_API_KEY=sk-... node scripts/seed-faq-translations.mjs --translate')
    process.exit(1)
  }
  for (const lang of TARGET_LANGUAGES) {
    await translateLanguage(lang)
  }
}

console.log('\n✅ Done. Translation cache will refresh on next request (v8 cache key).')
