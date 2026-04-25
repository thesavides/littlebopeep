'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/contexts/TranslationContext'

interface FaqItem {
  q: string
  steps: string[]
  note?: string
}

interface FaqSection {
  id: string
  title: string
  items: FaqItem[]
}

export default function FaqPage() {
  const { t, language, changeLanguage, languages } = useTranslation()
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = languages.find((l) => l.code === language)

  const sections: FaqSection[] = [
    {
      id: 'walkers',
      title: t('faq.section.walkers', {}, 'For Walkers'),
      items: [
        {
          q: t('faq.walker.submit.q', {}, 'How do I submit a report?'),
          steps: [
            t('faq.walker.submit.s1', {}, 'Open the app.'),
            t('faq.walker.submit.s2', {}, 'Tap the + button at the bottom of the screen.'),
            t('faq.walker.submit.s3', {}, 'Tap Use my location (or pin the spot manually on the map). Tap Confirm location.'),
            t('faq.walker.submit.s4', {}, 'Choose a category (e.g. Sheep, Fence, Road).'),
            t('faq.walker.submit.s5', {}, 'Tick any conditions that apply, and enter a count if asked.'),
            t('faq.walker.submit.s6', {}, 'Add a short description.'),
            t('faq.walker.submit.s7', {}, '(Optional) Tap Camera to take a photo, or Library to add an existing one. Up to 3 photos.'),
            t('faq.walker.submit.s8', {}, 'Tap Submit Report.'),
          ],
        },
        {
          q: t('faq.walker.guest.q', {}, 'How do I submit a report without an account?'),
          steps: [
            t('faq.walker.guest.s1', {}, 'Follow the reporting steps above without signing in.'),
            t('faq.walker.guest.s2', {}, 'On the last step, fill in your name, email, and phone number.'),
            t('faq.walker.guest.s3', {}, 'Tap Submit Report.'),
          ],
          note: t('faq.walker.guest.note', {}, 'As a guest you cannot edit your report or receive status updates.'),
        },
        {
          q: t('faq.walker.offline.q', {}, 'How do I submit a report when I have no signal?'),
          steps: [
            t('faq.walker.offline.s1', {}, 'Open the app — you will see an Offline mode banner at the top.'),
            t('faq.walker.offline.s2', {}, 'Tap the + button.'),
            t('faq.walker.offline.s3', {}, 'Fill in the report as normal, including photos.'),
            t('faq.walker.offline.s4', {}, 'Tap Save for later. The report is saved on your device.'),
            t('faq.walker.offline.s5', {}, 'When you have signal again, open the app.'),
            t('faq.walker.offline.s6', {}, 'Tap Sync now on the banner. Your report is sent.'),
          ],
        },
        {
          q: t('faq.walker.edit.q', {}, 'How do I edit a report I already submitted?'),
          steps: [
            t('faq.walker.edit.s1', {}, 'Tap the Mine tab at the bottom of the screen.'),
            t('faq.walker.edit.s2', {}, 'Find the report you want to change.'),
            t('faq.walker.edit.s3', {}, 'Tap Edit on the report card. (If there is no Edit button, the report is already resolved or completed and cannot be changed.)'),
            t('faq.walker.edit.s4', {}, 'Update the description, count, conditions, or add photos.'),
            t('faq.walker.edit.s5', {}, 'Tap Save.'),
          ],
        },
        {
          q: t('faq.walker.status.q', {}, 'How do I check the status of my report?'),
          steps: [
            t('faq.walker.status.s1', {}, 'Tap the Mine tab.'),
            t('faq.walker.status.s2', {}, 'Each report shows a status badge: Reported (waiting), Claimed (a farmer has it), Resolved (farmer has dealt with it), or Complete (closed by admin).'),
          ],
        },
        {
          q: t('faq.walker.notifications.q', {}, 'How do I read messages from farmers?'),
          steps: [
            t('faq.walker.notifications.s1', {}, 'Tap the bell icon at the top of the screen.'),
            t('faq.walker.notifications.s2', {}, 'Your inbox shows all updates: claims, resolutions, and thank-you notes.'),
            t('faq.walker.notifications.s3', {}, 'Tap a notification to see the full message.'),
          ],
        },
        {
          q: t('faq.walker.emailoff.q', {}, 'How do I turn off email alerts?'),
          steps: [
            t('faq.walker.emailoff.s1', {}, 'Tap the bell icon to open notifications.'),
            t('faq.walker.emailoff.s2', {}, 'Tap the Email alerts toggle to switch it off. You will still see in-app notifications.'),
          ],
        },
        {
          q: t('faq.walker.language.q', {}, 'How do I change the language?'),
          steps: [
            t('faq.walker.language.s1', {}, 'Open your profile menu.'),
            t('faq.walker.language.s2', {}, 'Tap Language.'),
            t('faq.walker.language.s3', {}, 'Choose English, Welsh (Cymraeg), Irish (Gaeilge), or Scottish Gaelic (Gàidhlig).'),
          ],
        },
        {
          q: t('faq.walker.pwa.q', {}, 'How do I install the app on my phone?'),
          steps: [
            t('faq.walker.pwa.s1', {}, 'Open the website on your phone\'s browser.'),
            t('faq.walker.pwa.s2', {}, 'Wait for the Install prompt to appear (or tap the browser\'s Add to Home Screen option).'),
            t('faq.walker.pwa.s3', {}, 'Tap Install. The app is now on your home screen.'),
          ],
        },
      ],
    },
    {
      id: 'farmers',
      title: t('faq.section.farmers', {}, 'For Farmers'),
      items: [
        {
          q: t('faq.farmer.signup.q', {}, 'How do I sign up as a farmer?'),
          steps: [
            t('faq.farmer.signup.s1', {}, 'Go to the sign-up page and choose Farmer.'),
            t('faq.farmer.signup.s2', {}, 'Step 1: Enter your name, email, and phone number.'),
            t('faq.farmer.signup.s3', {}, 'Step 2: Enter your billing address.'),
            t('faq.farmer.signup.s4', {}, 'Step 3: Pin your farm\'s main location on the map.'),
            t('faq.farmer.signup.s5', {}, 'Step 4: Create your first farm — give it a name and set the alert buffer.'),
            t('faq.farmer.signup.s6', {}, 'Step 5: Set up your subscription. Your 30-day free trial starts immediately.'),
          ],
        },
        {
          q: t('faq.farmer.addfarm.q', {}, 'How do I add another farm?'),
          steps: [
            t('faq.farmer.addfarm.s1', {}, 'Open your dashboard.'),
            t('faq.farmer.addfarm.s2', {}, 'Tap Add Farm.'),
            t('faq.farmer.addfarm.s3', {}, 'Enter the farm name.'),
            t('faq.farmer.addfarm.s4', {}, 'Set the alert buffer using the slider (default is 500m).'),
            t('faq.farmer.addfarm.s5', {}, 'Tap Save.'),
          ],
        },
        {
          q: t('faq.farmer.drawfield.q', {}, 'How do I draw a field?'),
          steps: [
            t('faq.farmer.drawfield.s1', {}, 'Open the farm.'),
            t('faq.farmer.drawfield.s2', {}, 'Tap Add Field.'),
            t('faq.farmer.drawfield.s3', {}, 'Tap points on the map to place fence posts (minimum 3).'),
            t('faq.farmer.drawfield.s4', {}, 'To adjust, drag any fence post to a new spot.'),
            t('faq.farmer.drawfield.s5', {}, 'Enter the field name and (optional) sheep count.'),
            t('faq.farmer.drawfield.s6', {}, 'Tap Save Field.'),
          ],
        },
        {
          q: t('faq.farmer.buffer.q', {}, 'How do I change my alert buffer?'),
          steps: [
            t('faq.farmer.buffer.s1', {}, 'Open your farm settings.'),
            t('faq.farmer.buffer.s2', {}, 'Drag the Alert buffer slider (between 100m and 10km).'),
            t('faq.farmer.buffer.s3', {}, 'Tap Save.'),
          ],
          note: t('faq.farmer.buffer.note', {}, 'A wider buffer catches more reports but also more reports from outside your land.'),
        },
        {
          q: t('faq.farmer.claim.q', {}, 'How do I claim a report?'),
          steps: [
            t('faq.farmer.claim.s1', {}, 'Open the report from your dashboard.'),
            t('faq.farmer.claim.s2', {}, 'Tap Claim (or Claim with message to add a note for the walker).'),
            t('faq.farmer.claim.s3', {}, 'The walker is automatically notified.'),
          ],
        },
        {
          q: t('faq.farmer.resolve.q', {}, 'How do I resolve a report?'),
          steps: [
            t('faq.farmer.resolve.s1', {}, 'Open the claimed report.'),
            t('faq.farmer.resolve.s2', {}, 'Tap Resolve.'),
            t('faq.farmer.resolve.s3', {}, 'Choose a reason: Resolved / Resolved — Nothing to do / Resolved — Insufficient information / Resolved — Invalid report.'),
            t('faq.farmer.resolve.s4', {}, '(Optional) Add a message for the walker.'),
            t('faq.farmer.resolve.s5', {}, 'Tap Confirm.'),
          ],
        },
        {
          q: t('faq.farmer.unclaim.q', {}, 'How do I unclaim a report?'),
          steps: [
            t('faq.farmer.unclaim.s1', {}, 'Open a report you previously claimed.'),
            t('faq.farmer.unclaim.s2', {}, 'Tap Unclaim.'),
            t('faq.farmer.unclaim.s3', {}, 'If no other farmer has claimed it, the report goes back to Reported.'),
          ],
        },
        {
          q: t('faq.farmer.reopen.q', {}, 'How do I reopen a resolved report?'),
          steps: [
            t('faq.farmer.reopen.s1', {}, 'Open the resolved report.'),
            t('faq.farmer.reopen.s2', {}, 'Tap Reopen. The report goes back to Claimed.'),
          ],
          note: t('faq.farmer.reopen.note', {}, 'If the report has been marked Complete by an admin, you cannot reopen it yourself — tap Request Reopen to message the admin.'),
        },
        {
          q: t('faq.farmer.thankyou.q', {}, 'How do I send a thank-you to the walker?'),
          steps: [
            t('faq.farmer.thankyou.s1', {}, 'Open a claimed report.'),
            t('faq.farmer.thankyou.s2', {}, 'Tap Thank You.'),
            t('faq.farmer.thankyou.s3', {}, 'Type a short message.'),
            t('faq.farmer.thankyou.s4', {}, 'Tap Send.'),
          ],
        },
        {
          q: t('faq.farmer.flag.q', {}, 'How do I flag a report as suspicious or wrong?'),
          steps: [
            t('faq.farmer.flag.s1', {}, 'Open the report.'),
            t('faq.farmer.flag.s2', {}, 'Tap Flag to Admin.'),
            t('faq.farmer.flag.s3', {}, 'Type a note explaining what\'s wrong.'),
            t('faq.farmer.flag.s4', {}, 'Tap Submit.'),
          ],
        },
        {
          q: t('faq.farmer.subscriptions.q', {}, 'How do I turn off alerts for a category I don\'t need?'),
          steps: [
            t('faq.farmer.subscriptions.s1', {}, 'At farm level: open your farm settings, find the category, and tap the toggle to turn it off.'),
            t('faq.farmer.subscriptions.s2', {}, 'At field level (overrides farm setting): open the field, tap Category subscriptions, and toggle each category on or off for that field only.'),
          ],
          note: t('faq.farmer.subscriptions.note', {}, 'Some categories marked Compulsory cannot be turned off.'),
        },
        {
          q: t('faq.farmer.emailoff.q', {}, 'How do I turn off email alerts?'),
          steps: [
            t('faq.farmer.emailoff.s1', {}, 'Open your profile menu.'),
            t('faq.farmer.emailoff.s2', {}, 'Tap Notification settings.'),
            t('faq.farmer.emailoff.s3', {}, 'Toggle Email alerts off. You will still see in-app alerts.'),
          ],
        },
        {
          q: t('faq.farmer.cancel.q', {}, 'How do I cancel my subscription?'),
          steps: [
            t('faq.farmer.cancel.s1', {}, 'Open your profile menu.'),
            t('faq.farmer.cancel.s2', {}, 'Tap Subscription.'),
            t('faq.farmer.cancel.s3', {}, 'Tap Cancel subscription.'),
            t('faq.farmer.cancel.s4', {}, 'Confirm. Your account stays active until the trial or billing period ends.'),
          ],
        },
        {
          q: t('faq.farmer.deletefield.q', {}, 'How do I delete a field?'),
          steps: [
            t('faq.farmer.deletefield.s1', {}, 'Open the field.'),
            t('faq.farmer.deletefield.s2', {}, 'Tap Delete field.'),
            t('faq.farmer.deletefield.s3', {}, 'Confirm.'),
          ],
        },
        {
          q: t('faq.farmer.deletefarm.q', {}, 'How do I delete a farm?'),
          steps: [
            t('faq.farmer.deletefarm.s1', {}, 'Open the farm.'),
            t('faq.farmer.deletefarm.s2', {}, 'Tap Delete farm.'),
            t('faq.farmer.deletefarm.s3', {}, 'Confirm. All fields under that farm are also deleted.'),
          ],
        },
      ],
    },
  ]

  const toggleItem = (key: string) => setOpenItem((prev) => (prev === key ? null : key))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-7 h-7" />
            <span className="font-serif font-semibold text-base tracking-tight leading-none">
              <span style={{ color: '#614270' }}>Little </span>
              <span style={{ color: '#92998B' }}>Bo </span>
              <span style={{ color: '#614270' }}>Peep</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                style={{ borderColor: '#92998B', color: '#92998B' }}
              >
                <span>{currentLang?.flag_emoji ?? '🌐'}</span>
                <span>{currentLang?.code?.toUpperCase() ?? 'EN'}</span>
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50"
                  style={{ backgroundColor: '#D1D9C5', borderColor: '#92998B', minWidth: '140px' }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: lang.code === language ? 'rgba(97,66,112,0.1)' : 'transparent',
                        color: '#614270',
                        fontWeight: lang.code === language ? 600 : 400,
                      }}
                    >
                      <span>{lang.flag_emoji}</span>
                      <span>{lang.name_native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/auth"
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}
            >
              {t('auth.signIn', {}, 'Sign in')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-10 text-center" style={{ backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#92998B' }}>
            {t('faq.eyebrow', {}, 'Help & Support')}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold mb-3" style={{ color: '#614270' }}>
            {t('faq.title', {}, 'Frequently Asked Questions')}
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: '#92998B' }}>
            {t('faq.subtitle', {}, 'Step-by-step answers for walkers and farmers. Need help in your language? Use the chat assistant in the bottom-right corner.')}
          </p>
        </div>
      </header>

      {/* Section tabs */}
      <div className="sticky top-[57px] z-30 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
        <div className="mx-auto max-w-3xl px-5 flex gap-1 py-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
              style={{ color: '#614270' }}
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>

      {/* FAQ content */}
      <main className="mx-auto max-w-3xl px-5 py-8 space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-serif text-xl font-semibold mb-4 pb-2 border-b" style={{ color: '#614270', borderColor: 'rgba(97,66,112,0.15)' }}>
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, i) => {
                const key = `${section.id}-${i}`
                const isOpen = openItem === key
                return (
                  <div
                    key={key}
                    className="rounded-xl border overflow-hidden"
                    style={{ backgroundColor: '#fff', borderColor: isOpen ? 'rgba(97,66,112,0.3)' : 'rgba(146,153,139,0.2)' }}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[rgba(97,66,112,0.03)]"
                    >
                      <span className="text-sm font-medium pr-4" style={{ color: '#614270' }}>
                        {item.q}
                      </span>
                      <svg
                        className="w-4 h-4 flex-shrink-0 transition-transform"
                        style={{
                          color: '#92998B',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(146,153,139,0.15)' }}>
                        <ol className="mt-3 space-y-1.5 list-decimal list-outside ml-4">
                          {item.steps.map((step, si) => (
                            <li key={si} className="text-sm pl-1" style={{ color: '#4a4a4a' }}>
                              {step}
                            </li>
                          ))}
                        </ol>
                        {item.note && (
                          <p
                            className="mt-3 text-xs rounded-lg px-3 py-2 border-l-2"
                            style={{ color: '#614270', backgroundColor: 'rgba(97,66,112,0.06)', borderColor: '#614270' }}
                          >
                            {item.note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* Chat CTA */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ backgroundColor: 'rgba(97,66,112,0.08)', border: '1px solid rgba(97,66,112,0.15)' }}
        >
          <p className="text-2xl mb-2">💬</p>
          <p className="font-semibold text-sm mb-1" style={{ color: '#614270' }}>
            {t('faq.chat.title', {}, "Can't find what you're looking for?")}
          </p>
          <p className="text-xs" style={{ color: '#92998B' }}>
            {t('faq.chat.subtitle', {}, 'Use the chat assistant (bottom-right) to ask a question in any language.')}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(146,153,139,0.3)' }}>
        <div className="mx-auto max-w-3xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 no-underline opacity-70 hover:opacity-100 transition-opacity">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-5 h-5" />
            <span className="text-xs font-serif font-semibold tracking-tight leading-none">
              <span style={{ color: '#614270' }}>Little </span>
              <span style={{ color: '#92998B' }}>Bo </span>
              <span style={{ color: '#614270' }}>Peep</span>
            </span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: t('home.landing.aboutUs', {}, 'About us'), href: '/about' },
              { label: t('home.landing.privacyPolicy', {}, 'Privacy policy'), href: '/privacy' },
              { label: t('home.landing.termsConditions', {}, 'Terms & conditions'), href: '/terms' },
              { label: t('auth.signIn', {}, 'Sign in'), href: '/auth' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="text-xs hover:opacity-80 transition-opacity" style={{ color: '#92998B' }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
