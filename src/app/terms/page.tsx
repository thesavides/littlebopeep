'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 pl-4 py-3 pr-4 rounded-r-xl text-sm leading-relaxed"
      style={{ borderLeft: '4px solid #7D8DCC', backgroundColor: 'rgba(125,141,204,0.1)', color: '#3e2c48' }}>
      {children}
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 pl-4 py-3 pr-4 rounded-r-xl text-sm leading-relaxed"
      style={{ borderLeft: '4px solid #e6a817', backgroundColor: '#fff8e6', color: '#7a5200' }}>
      {children}
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-serif text-xl font-semibold mt-8 mb-3 pb-2"
      style={{ color: '#614270', borderBottom: '2px solid rgba(146,153,139,0.3)', scrollMarginTop: '24px' }}>
      {children}
    </h2>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold mt-4 mb-1.5 text-sm" style={{ color: '#3e2c48' }}>{children}</h3>
}

function LegalTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(146,153,139,0.3)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: '#614270', color: '#fff' }}>
            <th className="text-left px-4 py-2.5 font-semibold">{rows[0][0]}</th>
            <th className="text-left px-4 py-2.5 font-semibold">{rows[0][1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map(([a, b], i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : 'rgba(209,217,197,0.3)' }}>
              <td className="px-4 py-2.5 align-top" style={{ borderTop: '1px solid rgba(146,153,139,0.2)' }} dangerouslySetInnerHTML={{ __html: a }} />
              <td className="px-4 py-2.5 align-top" style={{ borderTop: '1px solid rgba(146,153,139,0.2)' }} dangerouslySetInnerHTML={{ __html: b }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TermsPage() {
  const { t, language, changeLanguage, languages } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const currentLang = languages.find((l) => l.code === language)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(97,66,112,0.12)' }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo-pin.svg" alt="" aria-hidden="true" className="w-8 h-8" />
            <span className="font-serif font-semibold text-lg tracking-tight leading-none">
              <span style={{ color: '#614270' }}>Little </span>
              <span style={{ color: '#92998B' }}>Bo </span>
              <span style={{ color: '#614270' }}>Peep</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                style={{ borderColor: '#92998B', color: '#92998B' }}>
                <span>{currentLang?.flag_emoji ?? '🌐'}</span>
                <span>{currentLang?.code?.toUpperCase() ?? 'EN'}</span>
                <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 rounded-xl shadow-lg border overflow-hidden z-50"
                  style={{ backgroundColor: '#D1D9C5', borderColor: '#92998B', minWidth: '140px' }}>
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { changeLanguage(lang.code); setLangOpen(false) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors hover:opacity-80"
                      style={{ backgroundColor: lang.code === language ? 'rgba(97,66,112,0.1)' : 'transparent', color: '#614270', fontWeight: lang.code === language ? 600 : 400 }}>
                      <span>{lang.flag_emoji}</span><span>{lang.name_native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/auth" className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#7D8DCC', color: '#fff' }}>
              {t('auth.signIn', {}, 'Sign in')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-4 text-center">
        <p className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ backgroundColor: 'rgba(125,141,204,0.15)', color: '#7D8DCC' }}>
          Legal
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl leading-snug" style={{ color: '#614270' }}>
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#92998B' }}>Version 1.0 · Effective 1 May 2025 · Last reviewed April 2025</p>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div className="rounded-2xl p-6 sm:p-10 text-sm leading-relaxed"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(146,153,139,0.3)', color: '#3e2c48' }}>

          {/* Important notice */}
          <Warning>
            <strong>Please read these Terms carefully before using the Service.</strong><br /><br />
            By creating an account, accessing or using the Little Bo Peep platform, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Service.
          </Warning>

          {/* ToC */}
          <div className="rounded-xl p-4 mb-8 text-xs" style={{ backgroundColor: 'rgba(209,217,197,0.4)', color: '#614270' }}>
            <p className="font-semibold uppercase tracking-widest mb-2 text-xs" style={{ color: '#92998B' }}>Contents</p>
            <ol className="list-decimal pl-5 columns-2 gap-x-8 space-y-1">
              {['About Us & These Terms','Definitions','Eligibility & Registration','Description of Service','No Guarantee of Delivery','Walker Responsibilities','Countryside Access & Law','Farmer Responsibilities','Prohibited Use','PWA Installation','Fees & Payment','Intellectual Property','Disclaimers & Liability','Indemnification','Third-Party Services','Service Availability','Changes to Terms','Termination','Governing Law','General Provisions','Contact Us'].map((s, i) => (
                <li key={i}><a href={`#t${i+1}`} className="hover:underline" style={{ color: '#614270' }}>{s}</a></li>
              ))}
            </ol>
          </div>

          <SectionTitle id="t1">1. About Us &amp; These Terms</SectionTitle>
          <p className="mb-3">Little Bo Peep Ltd operates the Little Bo Peep digital platform and progressive web application at <strong>littlebopeep.app</strong>. These Terms govern your access to and use of the Service and constitute a legally binding agreement. Read them alongside our <Link href="/privacy" style={{ color: '#614270' }}>Privacy Policy</Link>.</p>
          <p>These Terms are governed by the laws of England and Wales.</p>

          <SectionTitle id="t2">2. Definitions</SectionTitle>
          <LegalTable rows={[
            ['Term', 'Meaning'],
            ['<strong>Walker</strong>', 'A registered user who reports sightings of lost, stray or unattended livestock.'],
            ['<strong>Farmer</strong>', 'A registered user who has created a farm profile and may receive livestock sighting reports.'],
            ['<strong>Report</strong>', 'A livestock sighting submission including location, description and photographs.'],
            ['<strong>Farm Zone</strong>', 'A geographically defined area registered by a Farmer for receiving Report notifications.'],
            ['<strong>Content</strong>', 'Any text, images, data or location information submitted through the Service.'],
            ['<strong>PWA</strong>', 'Progressive Web Application — installable to a device without a third-party app store.'],
          ]} />

          <SectionTitle id="t3">3. Eligibility &amp; Account Registration</SectionTitle>
          <Sub>3.1 Age and Capacity</Sub>
          <p className="mb-3">You must be at least 16 years old and have legal capacity to enter a binding contract. If aged 16–17, you confirm parental or guardian consent.</p>
          <Sub>3.2 Account Registration</Sub>
          <p className="mb-3">Provide accurate information during registration, keep it updated, and maintain the confidentiality of your credentials. Notify us immediately at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> of any unauthorised account access.</p>
          <Sub>3.3 One Account Per User</Sub>
          <p>You may not create multiple accounts or use another person&apos;s account. We may suspend duplicate or fraudulent accounts.</p>

          <SectionTitle id="t4">4. Description of the Service</SectionTitle>
          <p className="mb-3">Little Bo Peep is an <strong>information-sharing and communication facilitation tool only</strong>. We are a technology intermediary. We do not own or manage livestock, verify the accuracy of Reports, manage farmland, act as an agent, or operate as an emergency service.</p>
          <Warning><strong>Not an emergency service:</strong> For animals in immediate distress or road accidents involving livestock, call 999 (UK), RSPCA (0300 1234 999), or local authorities directly.</Warning>

          <SectionTitle id="t5">5. No Guarantee of Report Delivery or Farmer Response</SectionTitle>
          <Sub>5.1 No Guarantee of Delivery</Sub>
          <p className="mb-3">Submitting a Report does not guarantee any Farmer will receive, read or act upon it. Delivery depends on whether a Farmer has registered a relevant Farm Zone, enabled notifications, has an active account, and infrastructure availability.</p>
          <Sub>5.2 Farmer Discretion</Sub>
          <p className="mb-3">Farmers are under <strong>no obligation</strong> to accept, respond to, or act upon any Report. We have no authority to compel Farmer action.</p>
          <Sub>5.3 No Duty of Care</Sub>
          <p>We owe no duty of care to Walkers regarding outcomes following Report submission.</p>
          <Callout><strong>Summary for Walkers:</strong> Submitting a report is a helpful act, but you should have no expectation that the farmer will receive it, respond, or act on it.</Callout>

          <SectionTitle id="t6">6. Walker Responsibilities</SectionTitle>
          <Sub>6.1 Accuracy of Reports</Sub>
          <p className="mb-3">All Reports must be honest, accurate and made in good faith. False or malicious Reports may constitute a criminal offence and result in account termination.</p>
          <Sub>6.2 Photographs and Content</Sub>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>You own or have rights to all Content you submit;</li>
            <li>You grant us a non-exclusive, royalty-free worldwide licence to use Content as necessary to operate the Service;</li>
            <li>Do not upload photographs containing identifiable individuals without their consent;</li>
            <li>Photographs may be shared with Farmers per these Terms and our Privacy Policy.</li>
          </ul>
          <Sub>6.3 Personal Safety</Sub>
          <p>Your personal safety is your own responsibility. We do not guarantee the safety of any location accessible through the Service.</p>

          <SectionTitle id="t7">7. Countryside Access, Land Law &amp; Livestock Legislation</SectionTitle>
          <p className="mb-3">This is one of the most important sections. Please read it carefully.</p>
          <Sub>7.1 No Right of Access</Sub>
          <p className="mb-3">Nothing in the Service grants any right to access, enter or traverse any land. Map displays do not indicate open public access.</p>
          <Warning><strong>Always seek permission.</strong> Before entering any land, establish you have a lawful right to do so. When in doubt, do not enter. We disclaim all liability for trespass, injury or damage arising from entry onto any land.</Warning>
          <Sub>7.2 Compliance with Local Laws</Sub>
          <p className="mb-3">You are solely responsible for compliance with the Countryside and Rights of Way Act 2000, Land Reform (Scotland) Act 2003, applicable byelaws, and landowner restrictions.</p>
          <Sub>7.3 The Countryside Code</Sub>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Respect the land — leave no litter, cause no damage;</li>
            <li>Follow signs and instructions from landowners;</li>
            <li>Keep to marked public rights of way and designated access land;</li>
            <li>Leave gates as you find them.</li>
          </ul>
          <Sub>7.4 Dogs and Livestock</Sub>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Dogs <strong>must be kept on a lead</strong> of no more than two metres near livestock;</li>
            <li>Under the Dogs (Protection of Livestock) Act 1953, allowing a dog to worry livestock is a criminal offence;</li>
            <li>Farmers have certain rights to protect livestock from dogs, including in prescribed circumstances the right to shoot an attacking dog.</li>
          </ul>
          <Sub>7.5 Disturbance of Livestock</Sub>
          <p className="mb-3">Do not approach, touch, move or interfere with livestock. Observe from a safe distance only.</p>
          <Warning><strong>Do not approach stray sheep.</strong> This Service is for <em>reporting</em> observations — not intervening with livestock. Attempting to herd or restrain animals is dangerous and may constitute a criminal offence.</Warning>

          <SectionTitle id="t8">8. Farmer Responsibilities</SectionTitle>
          <p className="mb-3">Farmers must provide accurate farm information and keep Farm Zone boundaries current. Farmers remain solely responsible for livestock welfare, compliance with agricultural and animal welfare legislation, and responding to Reports at their sole discretion.</p>

          <SectionTitle id="t9">9. Prohibited Use &amp; Misuse</SectionTitle>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Submitting false or malicious Reports;</li>
            <li>Using the Service to facilitate trespass, property damage or criminal activity;</li>
            <li>Harassing, abusing or threatening other users;</li>
            <li>Uploading infringing, defamatory or unlawful Content;</li>
            <li>Interfering with or disrupting Service infrastructure;</li>
            <li>Impersonating any person or entity.</li>
          </ul>
          <Warning><strong>Serious misuse may result in prosecution</strong> under the Computer Misuse Act 1990, Fraud Act 2006, Communications Act 2003, or other applicable legislation. We may report conduct to law enforcement and seek civil remedies.</Warning>

          <SectionTitle id="t10">10. Progressive Web Application (PWA) Installation</SectionTitle>
          <Callout><strong>Installation is entirely at the user&apos;s own risk.</strong> The PWA is provided &ldquo;as is&rdquo; with no warranty of functionality on any particular device or browser version.</Callout>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We are under no obligation to maintain the PWA or ensure future compatibility;</li>
            <li>You are responsible for managing locally cached data and securing your device;</li>
            <li>Push notifications are subject to platform limitations outside our control;</li>
            <li>You may uninstall via your device&apos;s standard application management.</li>
          </ul>

          <SectionTitle id="t11">11. Fees, Subscriptions &amp; Payment</SectionTitle>
          <Sub>11.1 Current Pricing</Sub>
          <p className="mb-3">Walker access is currently free. Farmer accounts may be offered free during a trial period. We reserve the right to introduce charges at any time.</p>
          <Sub>11.2 Right to Introduce Fees</Sub>
          <p className="mb-3">We may introduce, vary or remove fees at our sole discretion. Continued use after any fee change constitutes acceptance of revised fees.</p>
          <Sub>11.3 Payment Processing</Sub>
          <p className="mb-3">When implemented: payments will be processed by regulated third parties in compliance with the Payment Services Regulations 2017 and PCI DSS. We will not store full card numbers.</p>
          <Warning><strong>Public-facing application:</strong> Exercise caution when submitting payment information. Contact us before proceeding if you have security concerns.</Warning>
          <Sub>11.4 Refunds</Sub>
          <p>Unless required by consumer law (including the Consumer Rights Act 2015), all fees are non-refundable. Refund requests considered on a case-by-case basis.</p>

          <SectionTitle id="t12">12. Intellectual Property</SectionTitle>
          <p className="mb-3">The Service and all its content is the exclusive intellectual property of Little Bo Peep Ltd or its licensors. You may not copy, distribute, modify or exploit any part without our prior written consent. You retain ownership of Content you submit, subject to the licence in Section 6.2.</p>

          <SectionTitle id="t13">13. Disclaimers &amp; Limitation of Liability</SectionTitle>
          <p className="mb-3">The Service is provided &ldquo;<strong>as is</strong>&rdquo; and &ldquo;<strong>as available</strong>&rdquo; without warranty of any kind. We disclaim all implied warranties of merchantability, fitness for purpose, non-infringement and accuracy.</p>
          <p className="mb-3">We expressly disclaim liability for the loss, injury or death of livestock; Farmer failure to receive or respond to Reports; and any losses incurred by Walkers or Farmers through use of the Service.</p>
          <p className="mb-3">Our total cumulative liability shall not exceed the greater of: (a) total fees paid by you in the preceding 12 months; or (b) £50.</p>
          <p>Nothing limits our liability for death or personal injury caused by negligence, or fraudulent misrepresentation, or where limitation is prohibited by law (including the Consumer Rights Act 2015).</p>

          <SectionTitle id="t14">14. Indemnification</SectionTitle>
          <p>You agree to indemnify Little Bo Peep Ltd against all claims, losses, costs and expenses arising from your use of the Service, Content you submit, breach of these Terms, or violation of any applicable law or third-party right.</p>

          <SectionTitle id="t15">15. Third-Party Services &amp; Links</SectionTitle>
          <p>Third-party services (mapping providers, authentication, payment processors) are governed by their own terms. We are not responsible for their practices and inclusion of a link does not constitute endorsement.</p>

          <SectionTitle id="t16">16. Service Availability &amp; Modifications</SectionTitle>
          <p>We do not guarantee availability at any particular time. We may suspend, modify or discontinue any part of the Service without notice. We accept no liability for losses arising from unavailability.</p>

          <SectionTitle id="t17">17. Changes to These Terms</SectionTitle>
          <p>We may amend these Terms at any time. Material changes will be communicated via the Service or by email. Continued use constitutes acceptance. If you do not agree, your remedy is to close your account and cease using the Service.</p>

          <SectionTitle id="t18">18. Termination</SectionTitle>
          <Sub>18.1 Termination by You</Sub>
          <p className="mb-3">Contact us at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> to terminate your account. Termination does not automatically delete personal data, which is subject to our retention obligations.</p>
          <Sub>18.2 Termination by Us</Sub>
          <p className="mb-3">We may suspend or terminate your account without notice for breach of these Terms, suspected fraud, legal requirement, or Service discontinuation.</p>
          <Sub>18.3 Effect of Termination</Sub>
          <p>Sections 12, 13, 14 and 19 survive termination.</p>

          <SectionTitle id="t19">19. Governing Law &amp; Dispute Resolution</SectionTitle>
          <p className="mb-3">These Terms are governed by the laws of <strong>England and Wales</strong>. The courts of England and Wales have exclusive jurisdiction, except that consumers in Scotland or Northern Ireland may also bring proceedings in their local courts. We encourage informal resolution first at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a>.</p>

          <SectionTitle id="t20">20. General Provisions</SectionTitle>
          <p className="mb-3">These Terms together with our Privacy Policy constitute the entire agreement. If any provision is found invalid, the remainder continues in full force. Our failure to enforce a right is not a waiver. You may not assign your rights without our consent.</p>

          <SectionTitle id="t21">21. Contact Us</SectionTitle>
          <Callout>
            <strong>Little Bo Peep Ltd</strong><br />
            Email: <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a><br />
            Subject: <em>Terms &amp; Conditions Enquiry</em>
          </Callout>
          <p>We aim to respond within 5 working days.</p>
          <p className="mt-4 text-xs" style={{ color: '#92998B' }}>These Terms were last reviewed April 2025 and do not constitute legal advice.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t" style={{ backgroundColor: '#D1D9C5', borderColor: 'rgba(146,153,139,0.3)' }}>
        <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              { label: t('home.landing.farmerSignup', {}, 'Farmer sign-up'), href: '/auth?mode=signup&role=farmer' },
            ].map(link => (
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
