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

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#92998B' }}>Version 1.0 · Effective 1 May 2025 · Last reviewed April 2025</p>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-5 pb-12">
        <div className="rounded-2xl p-6 sm:p-10 text-sm leading-relaxed"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(146,153,139,0.3)', color: '#3e2c48' }}>

          {/* ToC */}
          <div className="rounded-xl p-4 mb-8 text-xs" style={{ backgroundColor: 'rgba(209,217,197,0.4)', color: '#614270' }}>
            <p className="font-semibold uppercase tracking-widest mb-2 text-xs" style={{ color: '#92998B' }}>Contents</p>
            <ol className="list-decimal pl-5 columns-2 gap-x-8 space-y-1">
              {['Who We Are','Scope','Data We Collect','How We Use Data','Legal Bases','Cookies','Sharing Data','International Transfers','Data Retention','Your Rights','Children','Security','Policy Changes','Contact Us'].map((s, i) => (
                <li key={i}><a href={`#s${i+1}`} className="hover:underline" style={{ color: '#614270' }}>{s}</a></li>
              ))}
            </ol>
          </div>

          <SectionTitle id="s1">1. Who We Are</SectionTitle>
          <p className="mb-3">Little Bo Peep Ltd (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;) is a private limited company incorporated and registered in England and Wales. We operate the Little Bo Peep digital platform and mobile-progressive web application (collectively, the &ldquo;<strong>Service</strong>&rdquo;), accessible at <strong>littlebopeep.app</strong>.</p>
          <p className="mb-3">For the purposes of the UK GDPR and the Data Protection Act 2018, Little Bo Peep Ltd is the <strong>data controller</strong> of personal data processed through the Service.</p>
          <Callout><strong>Data Controller:</strong> Little Bo Peep Ltd · Email: <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a></Callout>

          <SectionTitle id="s2">2. Scope of This Policy</SectionTitle>
          <p className="mb-3">This Privacy Policy applies to all personal data we collect when you visit or register on our platform, use the Service as a Walker or Farmer, or contact us by any means. It does not apply to third-party websites linked from our platform.</p>

          <SectionTitle id="s3">3. Data We Collect</SectionTitle>
          <Sub>3.1 Data you provide</Sub>
          <LegalTable rows={[
            ['Category', 'Examples'],
            ['Identity data', 'First name, last name, username'],
            ['Contact data', 'Email address, telephone number (optional)'],
            ['Account credentials', 'Hashed password, authentication tokens'],
            ['Farmer profile data', 'Farm name, address, land zone coordinates, billing contact'],
            ['Report data (Walker)', 'Sheep description, photographs, date/time, location, notes'],
            ['Payment data', 'Billing name, address, payment method (processed by PCI DSS-compliant processor; we do not store card numbers)'],
            ['Communications', 'Content of messages you send to us'],
          ]} />
          <Sub>3.2 Data collected automatically</Sub>
          <LegalTable rows={[
            ['Category', 'Examples'],
            ['Location data', 'GPS coordinates at point of sighting (Walkers); farm zone coordinates (Farmers). Processed only with your explicit consent.'],
            ['Device & technical data', 'IP address, browser type, OS, device identifiers, time zone'],
            ['Usage data', 'Pages visited, features used, session timestamps'],
            ['Photographic data', 'Images uploaded by Walkers. Do not upload photos containing identifiable individuals.'],
          ]} />
          <Sub>3.3 Data from third parties</Sub>
          <p>We may receive limited data from third-party authentication providers or mapping service providers (such as Mapbox) in connection with your use of the Service.</p>

          <SectionTitle id="s4">4. How We Use Your Data</SectionTitle>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li><strong>Operating the Service:</strong> account management, enabling report submission and receipt.</li>
            <li><strong>Communications:</strong> service notifications, report alerts, account confirmations.</li>
            <li><strong>Payment processing:</strong> subscriptions and billing for Farmer accounts.</li>
            <li><strong>Service improvement:</strong> usage analysis, technical diagnostics, feature development.</li>
            <li><strong>Legal compliance:</strong> responding to lawful requests from public authorities.</li>
            <li><strong>Security:</strong> detecting and preventing fraudulent or unlawful use.</li>
          </ul>
          <p>We will not use your data for automated decision-making producing legal effects without your explicit consent.</p>

          <SectionTitle id="s5">5. Legal Bases for Processing</SectionTitle>
          <LegalTable rows={[
            ['Processing Activity', 'Lawful Basis'],
            ['Account creation and management', 'Performance of a contract (Art. 6(1)(b))'],
            ['Core Service features (reports, alerts)', 'Performance of a contract (Art. 6(1)(b))'],
            ['Location data collection', 'Consent (Art. 6(1)(a)) — withdraw at any time'],
            ['Payment processing', 'Performance of a contract (Art. 6(1)(b))'],
            ['Service improvement and analytics', 'Legitimate interests (Art. 6(1)(f))'],
            ['Compliance with legal obligations', 'Legal obligation (Art. 6(1)(c))'],
            ['Marketing communications', 'Consent (Art. 6(1)(a)) — withdraw at any time'],
          ]} />

          <SectionTitle id="s6">6. Cookies &amp; Tracking Technologies</SectionTitle>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li><strong>Strictly necessary:</strong> required for login and core features.</li>
            <li><strong>Functional:</strong> remember your preferences (map layers, language).</li>
            <li><strong>Analytics:</strong> understand usage patterns; anonymised where possible.</li>
          </ul>
          <p>You may control non-essential cookies via your browser settings, though this may affect Service functionality.</p>

          <SectionTitle id="s7">7. Sharing Your Data</SectionTitle>
          <p className="mb-3">We do not sell, rent or trade your personal data. We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li><strong>Registered Farmers:</strong> report data (location, photos, description) shared with Farmers whose alert zones cover the sighting area.</li>
            <li><strong>Service providers:</strong> cloud hosts, database providers, mapping services, payment processors, email delivery — contractually bound to our instructions.</li>
            <li><strong>Professional advisers:</strong> lawyers, accountants, auditors.</li>
            <li><strong>Regulatory authorities:</strong> ICO, HMRC, or law enforcement where required by law.</li>
          </ul>
          <Callout><strong>Note to Walkers:</strong> Report data — including location, photos and descriptions — will be visible to Farmers with registered zones covering the relevant area. Do not include personal information about third parties without their consent.</Callout>

          <SectionTitle id="s8">8. International Data Transfers</SectionTitle>
          <p className="mb-3">We host primarily within the UK and EEA. Where transfers occur outside these areas without an adequacy decision, we rely on UK IDTAs, Standard Contractual Clauses, or other ICO-approved mechanisms. Contact us for details: <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a>.</p>

          <SectionTitle id="s9">9. Data Retention</SectionTitle>
          <LegalTable rows={[
            ['Data Category', 'Retention Period'],
            ['Account and profile data', 'Duration of account plus 12 months after closure'],
            ['Sheep sighting reports', '24 months from submission (unless earlier deletion requested)'],
            ['Payment and billing records', '6 years from end of relevant tax year (HMRC requirement)'],
            ['Location data', 'Duration of related report plus 24 months'],
            ['Communications', '3 years from last communication'],
            ['System logs', 'Up to 12 months'],
          ]} />
          <Callout><strong>Right to erasure:</strong> Where you request erasure we will delete or anonymise your data, subject to overriding legal obligations (e.g. HMRC financial records).</Callout>

          <SectionTitle id="s10">10. Your Rights Under UK GDPR</SectionTitle>
          <Sub>10.1 Right of Access</Sub>
          <p className="mb-3">Request a copy of the data we hold about you (Subject Access Request). We will respond within one calendar month, free of charge.</p>
          <Sub>10.2 Right to Rectification</Sub>
          <p className="mb-3">Request correction of inaccurate or incomplete data.</p>
          <Sub>10.3 Right to Erasure</Sub>
          <p className="mb-3">Request deletion where data is no longer necessary, consent is withdrawn, or processing is unlawful. Legal retention obligations may limit full erasure.</p>
          <Sub>10.4 Right to Restriction</Sub>
          <p className="mb-3">Request restricted processing while a complaint or objection is assessed.</p>
          <Sub>10.5 Right to Data Portability</Sub>
          <p className="mb-3">Where processing is by automated means on the basis of consent or contract, request your data in a machine-readable format.</p>
          <Sub>10.6 Right to Object</Sub>
          <p className="mb-3">Object to processing based on legitimate interests or for direct marketing.</p>
          <Sub>10.7 Automated Decision-Making</Sub>
          <p className="mb-3">You have the right not to be subject to decisions based solely on automated processing that produce significant effects, unless permitted by law or you have consented.</p>
          <Sub>10.8 Right to Withdraw Consent</Sub>
          <p className="mb-3">Withdraw consent at any time; this does not affect prior lawful processing.</p>
          <Sub>10.9 Right to Lodge a Complaint</Sub>
          <Callout>
            <strong>Information Commissioner&apos;s Office</strong><br />
            Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF<br />
            Tel: 0303 123 1113 · <a href="https://www.ico.org.uk" target="_blank" rel="noreferrer" style={{ color: '#614270' }}>www.ico.org.uk</a>
          </Callout>
          <p className="mb-3">Please contact us first at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> — we aim to resolve concerns directly.</p>
          <Sub>10.10 How to Exercise Your Rights</Sub>
          <p>Email <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> with &ldquo;<strong>Data Rights Request</strong>&rdquo; in the subject line. We may verify your identity before actioning a request.</p>

          <SectionTitle id="s11">11. Children&apos;s Privacy</SectionTitle>
          <p>The Service is not intended for persons under 16. If you believe a child has provided personal data without consent, contact us at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> and we will delete it promptly.</p>

          <SectionTitle id="s12">12. Security of Your Personal Data</SectionTitle>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Encrypted data transmission via TLS/HTTPS</li>
            <li>Password hashing and credential protection</li>
            <li>Access controls limiting staff access to personal data</li>
            <li>Regular security assessments</li>
          </ul>
          <Callout><strong>Important:</strong> No internet transmission is 100% secure. You accept this inherent risk by using the Service. Never share your account credentials.</Callout>
          <p>In the event of a breach likely to risk your rights and freedoms, we will notify the ICO within 72 hours and affected users without undue delay.</p>

          <SectionTitle id="s13">13. Changes to This Privacy Policy</SectionTitle>
          <p className="mb-3">We may update this Policy at any time. Material changes will be communicated via the Service or by email. Continued use after an update constitutes acceptance of the revised Policy.</p>

          <SectionTitle id="s14">14. How to Contact Us</SectionTitle>
          <Callout>
            <strong>Little Bo Peep Ltd</strong> — Data Privacy Enquiries<br />
            Email: <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a><br />
            Subject: <em>Privacy Policy Enquiry</em>
          </Callout>
          <p>We aim to respond within 5 working days and to formal rights requests within the statutory timescales in Section 10.</p>
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
