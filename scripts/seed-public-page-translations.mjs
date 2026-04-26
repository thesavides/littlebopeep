/**
 * Seed public page translation keys:
 *   home.landing.*, home.howItWorks, auth.* (missing), about.*, legal.*, terms.*, privacy.*
 * Usage:
 *   node scripts/seed-public-page-translations.mjs                  # seed English only
 *   ANTHROPIC_API_KEY=sk-... node scripts/seed-public-page-translations.mjs --translate
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_ss9Nxv30n6SKVkUTv5dqfw_tJAT4zEL'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const KEYS = [
  // ── Landing page ──────────────────────────────────────────────────────────
  { key: 'home.howItWorks',             value: 'How it works',                              namespace: 'home' },
  { key: 'home.landing.eyebrow',        value: 'Real-Time Countryside Reporting',            namespace: 'home' },
  { key: 'home.landing.heroLine1',      value: 'Little Bo Peep',                            namespace: 'home' },
  { key: 'home.landing.heroLine2',      value: 'has lost her sheep.',                        namespace: 'home' },
  { key: 'home.landing.heroLine3',      value: 'Help find them and',                         namespace: 'home' },
  { key: 'home.landing.heroLine4',      value: 'report anything along the way.',             namespace: 'home' },
  { key: 'home.landing.seeIt',          value: 'See it',                                    namespace: 'home' },
  { key: 'home.landing.seeItDesc',      value: 'Spot an issue on your walk, animals, fences, gates, or fly-tipping.', namespace: 'home' },
  { key: 'home.landing.reportIt',       value: 'Report it',                                 namespace: 'home' },
  { key: 'home.landing.reportItDesc',   value: 'Pin it on the map and add a quick note. Takes about 30 seconds.', namespace: 'home' },
  { key: 'home.landing.getSorted',      value: 'Get it sorted',                             namespace: 'home' },
  { key: 'home.landing.getSortedDesc',  value: 'The right farmer gets an instant alert and can act straight away.', namespace: 'home' },
  { key: 'home.landing.ctaPrimary',     value: 'Sign up & report',                          namespace: 'home' },
  { key: 'home.landing.ctaFarmer',      value: 'Farmer? Sign up to get alerts',             namespace: 'home' },
  { key: 'home.landing.goToDashboard',  value: 'Go to your dashboard →',                    namespace: 'home' },
  { key: 'home.landing.step1Title',     value: 'Spot something',                            namespace: 'home' },
  { key: 'home.landing.step1Desc',      value: 'Notice an issue on farmland while out walking.', namespace: 'home' },
  { key: 'home.landing.step2Title',     value: 'Open the app',                              namespace: 'home' },
  { key: 'home.landing.step2Desc',      value: "No fuss, just tap Report and you're straight in.", namespace: 'home' },
  { key: 'home.landing.step3Title',     value: 'Pin & describe',                            namespace: 'home' },
  { key: 'home.landing.step3Desc',      value: 'Drop a pin, pick a category, add a photo if you like.', namespace: 'home' },
  { key: 'home.landing.step4Title',     value: 'Farmer is notified',                        namespace: 'home' },
  { key: 'home.landing.step4Desc',      value: 'They get an alert and can respond straight away.', namespace: 'home' },
  { key: 'home.landing.stat1Value',     value: '33M',                                       namespace: 'home' },
  { key: 'home.landing.stat1Label',     value: 'sheep in the UK',                           namespace: 'home' },
  { key: 'home.landing.stat2Value',     value: '£80M',                                      namespace: 'home' },
  { key: 'home.landing.stat2Label',     value: 'in livestock losses each year',             namespace: 'home' },
  { key: 'home.landing.stat3Value',     value: '30',                                        namespace: 'home' },
  { key: 'home.landing.stat3Unit',      value: '-day',                                      namespace: 'home' },
  { key: 'home.landing.stat3Label',     value: 'free trial for farmers',                    namespace: 'home' },
  { key: 'home.landing.dashboard',      value: 'Dashboard →',                               namespace: 'home' },
  { key: 'home.landing.aboutUs',        value: 'About us',                                  namespace: 'home' },
  { key: 'home.landing.faq',            value: 'FAQ',                                       namespace: 'home' },
  { key: 'home.landing.privacyPolicy',  value: 'Privacy policy',                            namespace: 'home' },
  { key: 'home.landing.termsConditions', value: 'Terms & conditions',                       namespace: 'home' },
  { key: 'home.landing.farmerSignup',   value: 'Farmer sign-up',                            namespace: 'home' },

  // ── Auth page (keys missing from main seed) ───────────────────────────────
  { key: 'auth.iAmA',                   value: 'I am a:',                                   namespace: 'auth' },
  { key: 'auth.fullName',               value: 'Full Name',                                 namespace: 'auth' },
  { key: 'auth.fullNamePlaceholder',    value: 'John Smith',                                namespace: 'auth' },
  { key: 'auth.emailPlaceholder',       value: 'you@example.com',                           namespace: 'auth' },
  { key: 'auth.forgotPassword',         value: 'Forgot Password?',                          namespace: 'auth' },
  { key: 'auth.signIn',                 value: 'Sign in',                                   namespace: 'auth' },
  { key: 'auth.nameRequired',           value: 'Please enter your full name',               namespace: 'auth' },
  { key: 'auth.termsAccept',            value: 'I have read and agree to the',              namespace: 'auth' },
  { key: 'auth.termsAnd',               value: 'and',                                       namespace: 'auth' },
  { key: 'auth.termsRequired',          value: 'You must accept the Terms & Conditions to create an account', namespace: 'auth' },
  { key: 'auth.signupFailed',           value: 'Sign up failed. Please try again.',         namespace: 'auth' },
  { key: 'auth.authenticationFailed',   value: 'Incorrect email or password',               namespace: 'auth' },
  { key: 'auth.emailAlertsWalker',      value: '📧 Email me updates when my reports are claimed or resolved', namespace: 'auth' },
  { key: 'auth.emailAlertsfarmer',      value: '📧 Email me when new reports are spotted near my farm', namespace: 'auth' },
  { key: 'auth.createAccountTab',       value: 'Create account',                            namespace: 'auth' },
  { key: 'auth.createAccountTitle',     value: 'Create your account',                       namespace: 'auth' },
  { key: 'auth.createAccountBtn',       value: 'Create account →',                          namespace: 'auth' },
  { key: 'auth.signInBtn',              value: 'Sign in →',                                 namespace: 'auth' },
  { key: 'auth.welcomeBack',            value: 'Welcome back',                              namespace: 'auth' },

  // ── Shared legal ──────────────────────────────────────────────────────────
  { key: 'legal.eyebrow',               value: 'Legal',                                     namespace: 'legal' },
  { key: 'legal.toc',                   value: 'Contents',                                  namespace: 'legal' },

  // ── About page ────────────────────────────────────────────────────────────
  { key: 'about.eyebrow',               value: 'Real-time countryside reporting',           namespace: 'about' },
  { key: 'about.title',                 value: 'About Little Bo Peep & Its Founder',        namespace: 'about' },
  { key: 'about.p1',                    value: 'Little Bo Peep began with a simple idea from', namespace: 'about' },
  { key: 'about.p1b',                   value: ', shaped through time spent walking the Welsh countryside near Llanrwst.', namespace: 'about' },
  { key: 'about.p2',                    value: 'What she experienced there is not unique to Wales. It is simply where the idea became clear.', namespace: 'about' },
  { key: 'about.p3',                    value: 'Across rural landscapes, the same patterns exist. Livestock roam freely. Land stretches across vast areas. Things go wrong. Animals get into trouble. Fences break. Trees fall. And often, farmers are simply not aware in the moment, not through lack of care or effort, but because of the sheer scale of what they are managing.', namespace: 'about' },
  { key: 'about.p4',                    value: 'At the same time, there are people moving through these spaces every day. Walkers, ramblers, and nature lovers who notice what is happening around them and who would help if there were a simple, direct way to do so.', namespace: 'about' },
  { key: 'about.tagline',               value: 'Little Bo Peep connects those two worlds.',  namespace: 'about' },
  { key: 'about.p5',                    value: 'It allows anyone out walking to quickly report what they see. A pinned location, a photo, and a short description are sent directly to the people who need to know. For farmers, this acts as a prompt, an extra set of eyes across their land, helping surface issues sooner so they can act faster.', namespace: 'about' },
  { key: 'about.p6',                    value: 'Importantly, farmers stay in control. They can define their land, choose exactly what they want to be notified about, and filter the type of reports they receive so the system remains useful rather than overwhelming.', namespace: 'about' },
  { key: 'about.p7',                    value: 'While the name may reference sheep, the platform is designed for all livestock, infrastructure such as fences and gates, and environmental issues like fallen trees or blocked paths.', namespace: 'about' },
  { key: 'about.p8',                    value: 'From the beginning, Jessica has approached this as a shared, community-driven effort. The goal is to create a practical partnership between walkers, farmers, and everyone connected to the countryside, bringing better balance and awareness to how land is used and cared for.', namespace: 'about' },
  { key: 'about.p9',                    value: 'To reflect the broader reach of the problem, Little Bo Peep is being developed with localisation in mind, including support for regional UK languages, ensuring it can be used naturally by the communities it is built for.', namespace: 'about' },
  { key: 'about.p10',                   value: 'This is not a profit-driven project. Keeping it accessible and as close to cost-free as possible is a priority. To make that sustainable, Jessica is actively seeking partnerships with organisations connected to rural life, from agricultural suppliers to technology and mapping partners.', namespace: 'about' },
  { key: 'about.p11',                   value: 'If you are interested in supporting, sponsoring, or collaborating, you are invited to get involved.', namespace: 'about' },
  { key: 'about.cta',                   value: 'Get in touch at info@littlebopeep.app',     namespace: 'about' },
  { key: 'about.closing1',              value: 'Little Bo Peep is built on a simple idea.',  namespace: 'about' },
  { key: 'about.closing2',              value: 'The people already walking the land can help look after it.', namespace: 'about' },

  // ── Terms & Conditions headings ───────────────────────────────────────────
  { key: 'terms.title',                 value: 'Terms & Conditions',                        namespace: 'terms' },
  { key: 'terms.version',               value: 'Version 1.0 · Effective 1 May 2025 · Last reviewed April 2025', namespace: 'terms' },
  { key: 'terms.toc.1',                 value: 'About Us & These Terms',                    namespace: 'terms' },
  { key: 'terms.toc.2',                 value: 'Definitions',                               namespace: 'terms' },
  { key: 'terms.toc.3',                 value: 'Eligibility & Registration',                namespace: 'terms' },
  { key: 'terms.toc.4',                 value: 'Description of Service',                    namespace: 'terms' },
  { key: 'terms.toc.5',                 value: 'No Guarantee of Delivery',                  namespace: 'terms' },
  { key: 'terms.toc.6',                 value: 'Walker Responsibilities',                   namespace: 'terms' },
  { key: 'terms.toc.7',                 value: 'Countryside Access & Law',                  namespace: 'terms' },
  { key: 'terms.toc.8',                 value: 'Farmer Responsibilities',                   namespace: 'terms' },
  { key: 'terms.toc.9',                 value: 'Prohibited Use',                            namespace: 'terms' },
  { key: 'terms.toc.10',                value: 'PWA Installation',                          namespace: 'terms' },
  { key: 'terms.toc.11',                value: 'Fees & Payment',                            namespace: 'terms' },
  { key: 'terms.toc.12',                value: 'Intellectual Property',                     namespace: 'terms' },
  { key: 'terms.toc.13',                value: 'Disclaimers & Liability',                   namespace: 'terms' },
  { key: 'terms.toc.14',                value: 'Indemnification',                           namespace: 'terms' },
  { key: 'terms.toc.15',                value: 'Third-Party Services',                      namespace: 'terms' },
  { key: 'terms.toc.16',                value: 'Service Availability',                      namespace: 'terms' },
  { key: 'terms.toc.17',                value: 'Changes to Terms',                          namespace: 'terms' },
  { key: 'terms.toc.18',                value: 'Termination',                               namespace: 'terms' },
  { key: 'terms.toc.19',                value: 'Governing Law',                             namespace: 'terms' },
  { key: 'terms.toc.20',                value: 'General Provisions',                        namespace: 'terms' },
  { key: 'terms.toc.21',                value: 'Contact Us',                                namespace: 'terms' },
  { key: 'terms.s1.title',              value: '1. About Us & These Terms',                 namespace: 'terms' },
  { key: 'terms.s2.title',              value: '2. Definitions',                            namespace: 'terms' },
  { key: 'terms.s3.title',              value: '3. Eligibility & Account Registration',     namespace: 'terms' },
  { key: 'terms.s4.title',              value: '4. Description of the Service',             namespace: 'terms' },
  { key: 'terms.s5.title',              value: '5. No Guarantee of Report Delivery or Farmer Response', namespace: 'terms' },
  { key: 'terms.s6.title',              value: '6. Walker Responsibilities',                namespace: 'terms' },
  { key: 'terms.s7.title',              value: '7. Countryside Access, Land Law & Livestock Legislation', namespace: 'terms' },
  { key: 'terms.s8.title',              value: '8. Farmer Responsibilities',                namespace: 'terms' },
  { key: 'terms.s9.title',              value: '9. Prohibited Use & Misuse',                namespace: 'terms' },
  { key: 'terms.s10.title',             value: '10. Progressive Web Application (PWA) Installation', namespace: 'terms' },
  { key: 'terms.s11.title',             value: '11. Fees, Subscriptions & Payment',         namespace: 'terms' },
  { key: 'terms.s12.title',             value: '12. Intellectual Property',                 namespace: 'terms' },
  { key: 'terms.s13.title',             value: '13. Disclaimers & Limitation of Liability', namespace: 'terms' },
  { key: 'terms.s14.title',             value: '14. Indemnification',                       namespace: 'terms' },
  { key: 'terms.s15.title',             value: '15. Third-Party Services & Links',          namespace: 'terms' },
  { key: 'terms.s16.title',             value: '16. Service Availability & Modifications',  namespace: 'terms' },
  { key: 'terms.s17.title',             value: '17. Changes to These Terms',                namespace: 'terms' },
  { key: 'terms.s18.title',             value: '18. Termination',                           namespace: 'terms' },
  { key: 'terms.s19.title',             value: '19. Governing Law & Dispute Resolution',    namespace: 'terms' },
  { key: 'terms.s20.title',             value: '20. General Provisions',                    namespace: 'terms' },
  { key: 'terms.s21.title',             value: '21. Contact Us',                            namespace: 'terms' },

  // ── Privacy Policy headings ───────────────────────────────────────────────
  { key: 'privacy.title',               value: 'Privacy Policy',                            namespace: 'privacy' },
  { key: 'privacy.version',             value: 'Version 1.0 · Effective 1 May 2025 · Last reviewed April 2025', namespace: 'privacy' },
  { key: 'privacy.toc.1',               value: 'Who We Are',                                namespace: 'privacy' },
  { key: 'privacy.toc.2',               value: 'Scope',                                     namespace: 'privacy' },
  { key: 'privacy.toc.3',               value: 'Data We Collect',                           namespace: 'privacy' },
  { key: 'privacy.toc.4',               value: 'How We Use Data',                           namespace: 'privacy' },
  { key: 'privacy.toc.5',               value: 'Legal Bases',                               namespace: 'privacy' },
  { key: 'privacy.toc.6',               value: 'Cookies',                                   namespace: 'privacy' },
  { key: 'privacy.toc.7',               value: 'Sharing Data',                              namespace: 'privacy' },
  { key: 'privacy.toc.8',               value: 'International Transfers',                   namespace: 'privacy' },
  { key: 'privacy.toc.9',               value: 'Data Retention',                            namespace: 'privacy' },
  { key: 'privacy.toc.10',              value: 'Your Rights',                               namespace: 'privacy' },
  { key: 'privacy.toc.11',              value: 'Children',                                  namespace: 'privacy' },
  { key: 'privacy.toc.12',              value: 'Security',                                  namespace: 'privacy' },
  { key: 'privacy.toc.13',              value: 'Policy Changes',                            namespace: 'privacy' },
  { key: 'privacy.toc.14',              value: 'Contact Us',                                namespace: 'privacy' },
  { key: 'privacy.s1.title',            value: '1. Who We Are',                             namespace: 'privacy' },
  { key: 'privacy.s2.title',            value: '2. Scope of This Policy',                   namespace: 'privacy' },
  { key: 'privacy.s3.title',            value: '3. Data We Collect',                        namespace: 'privacy' },
  { key: 'privacy.s4.title',            value: '4. How We Use Your Data',                   namespace: 'privacy' },
  { key: 'privacy.s5.title',            value: '5. Legal Bases for Processing',             namespace: 'privacy' },
  { key: 'privacy.s6.title',            value: '6. Cookies & Tracking Technologies',        namespace: 'privacy' },
  { key: 'privacy.s7.title',            value: '7. Sharing Your Data',                      namespace: 'privacy' },
  { key: 'privacy.s8.title',            value: '8. International Data Transfers',           namespace: 'privacy' },
  { key: 'privacy.s9.title',            value: '9. Data Retention',                         namespace: 'privacy' },
  { key: 'privacy.s10.title',           value: '10. Your Rights Under UK GDPR',             namespace: 'privacy' },
  { key: 'privacy.s11.title',           value: "11. Children's Privacy",                    namespace: 'privacy' },
  { key: 'privacy.s12.title',           value: '12. Security of Your Personal Data',        namespace: 'privacy' },
  { key: 'privacy.s13.title',           value: '13. Changes to This Privacy Policy',        namespace: 'privacy' },
  { key: 'privacy.s14.title',           value: '14. How to Contact Us',                     namespace: 'privacy' },
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

  const prompt = `Translate the following UI strings from English to ${targetLang.name}. These are strings for a countryside reporting app called Little Bo Peep.

Rules:
- Keep proper nouns in English: Little Bo Peep, Jessica Whitcutt, Llanrwst, littlebopeep.app, info@littlebopeep.app
- Keep legal abbreviations: UK GDPR, DPA 2018, PWA, PCI DSS, HMRC, ICO, TLS, HTTPS, UK IDTA
- Keep numbered section headings with their numbers (translate the words, keep the number)
- Keep dates and version numbers as-is
- Keep currency symbols (£)
- Translate naturally and idiomatically for the target language — not word-for-word
- Return ONLY a JSON array of translated strings in the same order as the input, no other text

Input strings:
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

  if (!response.ok) throw new Error(`Anthropic API error: ${await response.text()}`)

  const data = await response.json()
  const text = data.content[0].text.trim()
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) throw new Error(`Could not parse JSON: ${text.slice(0, 200)}`)
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
    if (translated.length !== texts.length) throw new Error(`Count mismatch: got ${translated.length}, expected ${texts.length}`)

    for (let j = 0; j < batch.length; j++) {
      rows.push({ key: batch[j].key, language_code: lang.code, value: translated[j], namespace: batch[j].namespace })
    }
  }

  const { error } = await supabase.from('translations').upsert(rows, { onConflict: 'key,language_code' })
  if (error) { console.error(`❌ ${lang.name} failed:`, error.message); return false }
  console.log(`✅ ${lang.name}: ${rows.length} translations saved`)
  return true
}

async function main() {
  const translate = process.argv.includes('--translate')

  const ok = await seedEnglish()
  if (!ok) process.exit(1)

  if (translate) {
    for (const lang of TARGET_LANGUAGES) {
      await translateLanguage(lang)
    }
    console.log('\n✨ Done. Bump the translation cache version in src/lib/i18n.ts to force browser refresh.')
  } else {
    console.log('\n💡 To also generate Welsh/Irish/Gaelic translations:')
    console.log('   ANTHROPIC_API_KEY=sk-... node scripts/seed-public-page-translations.mjs --translate')
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
