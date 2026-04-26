'use client'

import Link from 'next/link'
import { useTranslation } from '@/contexts/TranslationContext'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

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
  const { t } = useTranslation()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D1D9C5' }}>

      <SiteNav />

      {/* Header */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-4 text-center">
        <p className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest mb-5"
          style={{ backgroundColor: 'rgba(125,141,204,0.15)', color: '#7D8DCC' }}>
          {t('legal.eyebrow', {}, 'Legal')}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl leading-snug" style={{ color: '#614270' }}>
          {t('terms.title', {}, 'Terms & Conditions')}
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#92998B' }}>{t('terms.version', {}, 'Version 1.0 · Effective 1 May 2025 · Last reviewed April 2025')}</p>
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
            <p className="font-semibold uppercase tracking-widest mb-2 text-xs" style={{ color: '#92998B' }}>{t('legal.toc', {}, 'Contents')}</p>
            <ol className="list-decimal pl-5 columns-2 gap-x-8 space-y-1">
              {[
                t('terms.toc.1', {}, 'About Us & These Terms'),
                t('terms.toc.2', {}, 'Definitions'),
                t('terms.toc.3', {}, 'Eligibility & Registration'),
                t('terms.toc.4', {}, 'Description of Service'),
                t('terms.toc.5', {}, 'No Guarantee of Delivery'),
                t('terms.toc.6', {}, 'Walker Responsibilities'),
                t('terms.toc.7', {}, 'Countryside Access & Law'),
                t('terms.toc.8', {}, 'Farmer Responsibilities'),
                t('terms.toc.9', {}, 'Prohibited Use'),
                t('terms.toc.10', {}, 'PWA Installation'),
                t('terms.toc.11', {}, 'Fees & Payment'),
                t('terms.toc.12', {}, 'Intellectual Property'),
                t('terms.toc.13', {}, 'Disclaimers & Liability'),
                t('terms.toc.14', {}, 'Indemnification'),
                t('terms.toc.15', {}, 'Third-Party Services'),
                t('terms.toc.16', {}, 'Service Availability'),
                t('terms.toc.17', {}, 'Changes to Terms'),
                t('terms.toc.18', {}, 'Termination'),
                t('terms.toc.19', {}, 'Governing Law'),
                t('terms.toc.20', {}, 'General Provisions'),
                t('terms.toc.21', {}, 'Contact Us'),
              ].map((s, i) => (
                <li key={i}><a href={`#t${i+1}`} className="hover:underline" style={{ color: '#614270' }}>{s}</a></li>
              ))}
            </ol>
          </div>

          <SectionTitle id="t1">{t('terms.s1.title', {}, '1. About Us & These Terms')}</SectionTitle>
          <p className="mb-3">Little Bo Peep Ltd operates the Little Bo Peep digital platform and progressive web application at <strong>littlebopeep.app</strong>. These Terms govern your access to and use of the Service and constitute a legally binding agreement. Read them alongside our <Link href="/privacy" style={{ color: '#614270' }}>Privacy Policy</Link>.</p>
          <p>These Terms are governed by the laws of England and Wales.</p>

          <SectionTitle id="t2">{t('terms.s2.title', {}, '2. Definitions')}</SectionTitle>
          <LegalTable rows={[
            ['Term', 'Meaning'],
            ['<strong>Walker</strong>', 'A registered user who reports sightings of lost, stray or unattended livestock.'],
            ['<strong>Farmer</strong>', 'A registered user who has created a farm profile and may receive livestock sighting reports.'],
            ['<strong>Report</strong>', 'A livestock sighting submission including location, description and photographs.'],
            ['<strong>Farm Zone</strong>', 'A geographically defined area registered by a Farmer for receiving Report notifications.'],
            ['<strong>Content</strong>', 'Any text, images, data or location information submitted through the Service.'],
            ['<strong>PWA</strong>', 'Progressive Web Application — installable to a device without a third-party app store.'],
          ]} />

          <SectionTitle id="t3">{t('terms.s3.title', {}, '3. Eligibility & Account Registration')}</SectionTitle>
          <Sub>3.1 Age and Capacity</Sub>
          <p className="mb-3">You must be at least 16 years old and have legal capacity to enter a binding contract. If aged 16–17, you confirm parental or guardian consent.</p>
          <Sub>3.2 Account Registration</Sub>
          <p className="mb-3">Provide accurate information during registration, keep it updated, and maintain the confidentiality of your credentials. Notify us immediately at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> of any unauthorised account access.</p>
          <Sub>3.3 One Account Per User</Sub>
          <p>You may not create multiple accounts or use another person&apos;s account. We may suspend duplicate or fraudulent accounts.</p>

          <SectionTitle id="t4">{t('terms.s4.title', {}, '4. Description of the Service')}</SectionTitle>
          <p className="mb-3">Little Bo Peep is an <strong>information-sharing and communication facilitation tool only</strong>. We are a technology intermediary. We do not own or manage livestock, verify the accuracy of Reports, manage farmland, act as an agent, or operate as an emergency service.</p>
          <Warning><strong>Not an emergency service:</strong> For animals in immediate distress or road accidents involving livestock, call 999 (UK), RSPCA (0300 1234 999), or local authorities directly.</Warning>

          <SectionTitle id="t5">{t('terms.s5.title', {}, '5. No Guarantee of Report Delivery or Farmer Response')}</SectionTitle>
          <Sub>5.1 No Guarantee of Delivery</Sub>
          <p className="mb-3">Submitting a Report does not guarantee any Farmer will receive, read or act upon it. Delivery depends on whether a Farmer has registered a relevant Farm Zone, enabled notifications, has an active account, and infrastructure availability.</p>
          <Sub>5.2 Farmer Discretion</Sub>
          <p className="mb-3">Farmers are under <strong>no obligation</strong> to accept, respond to, or act upon any Report. We have no authority to compel Farmer action.</p>
          <Sub>5.3 No Duty of Care</Sub>
          <p>We owe no duty of care to Walkers regarding outcomes following Report submission.</p>
          <Callout><strong>Summary for Walkers:</strong> Submitting a report is a helpful act, but you should have no expectation that the farmer will receive it, respond, or act on it.</Callout>

          <SectionTitle id="t6">{t('terms.s6.title', {}, '6. Walker Responsibilities')}</SectionTitle>
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

          <SectionTitle id="t7">{t('terms.s7.title', {}, '7. Countryside Access, Land Law & Livestock Legislation')}</SectionTitle>
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

          <SectionTitle id="t8">{t('terms.s8.title', {}, '8. Farmer Responsibilities')}</SectionTitle>
          <p className="mb-3">Farmers must provide accurate farm information and keep Farm Zone boundaries current. Farmers remain solely responsible for livestock welfare, compliance with agricultural and animal welfare legislation, and responding to Reports at their sole discretion.</p>

          <SectionTitle id="t9">{t('terms.s9.title', {}, '9. Prohibited Use & Misuse')}</SectionTitle>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Submitting false or malicious Reports;</li>
            <li>Using the Service to facilitate trespass, property damage or criminal activity;</li>
            <li>Harassing, abusing or threatening other users;</li>
            <li>Uploading infringing, defamatory or unlawful Content;</li>
            <li>Interfering with or disrupting Service infrastructure;</li>
            <li>Impersonating any person or entity.</li>
          </ul>
          <Warning><strong>Serious misuse may result in prosecution</strong> under the Computer Misuse Act 1990, Fraud Act 2006, Communications Act 2003, or other applicable legislation. We may report conduct to law enforcement and seek civil remedies.</Warning>

          <SectionTitle id="t10">{t('terms.s10.title', {}, '10. Progressive Web Application (PWA) Installation')}</SectionTitle>
          <Callout><strong>Installation is entirely at the user&apos;s own risk.</strong> The PWA is provided &ldquo;as is&rdquo; with no warranty of functionality on any particular device or browser version.</Callout>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We are under no obligation to maintain the PWA or ensure future compatibility;</li>
            <li>You are responsible for managing locally cached data and securing your device;</li>
            <li>Push notifications are subject to platform limitations outside our control;</li>
            <li>You may uninstall via your device&apos;s standard application management.</li>
          </ul>

          <SectionTitle id="t11">{t('terms.s11.title', {}, '11. Fees, Subscriptions & Payment')}</SectionTitle>
          <Sub>11.1 Current Pricing</Sub>
          <p className="mb-3">Walker access is currently free. Farmer accounts may be offered free during a trial period. We reserve the right to introduce charges at any time.</p>
          <Sub>11.2 Right to Introduce Fees</Sub>
          <p className="mb-3">We may introduce, vary or remove fees at our sole discretion. Continued use after any fee change constitutes acceptance of revised fees.</p>
          <Sub>11.3 Payment Processing</Sub>
          <p className="mb-3">When implemented: payments will be processed by regulated third parties in compliance with the Payment Services Regulations 2017 and PCI DSS. We will not store full card numbers.</p>
          <Warning><strong>Public-facing application:</strong> Exercise caution when submitting payment information. Contact us before proceeding if you have security concerns.</Warning>
          <Sub>11.4 Refunds</Sub>
          <p>Unless required by consumer law (including the Consumer Rights Act 2015), all fees are non-refundable. Refund requests considered on a case-by-case basis.</p>

          <SectionTitle id="t12">{t('terms.s12.title', {}, '12. Intellectual Property')}</SectionTitle>
          <p className="mb-3">The Service and all its content is the exclusive intellectual property of Little Bo Peep Ltd or its licensors. You may not copy, distribute, modify or exploit any part without our prior written consent. You retain ownership of Content you submit, subject to the licence in Section 6.2.</p>

          <SectionTitle id="t13">{t('terms.s13.title', {}, '13. Disclaimers & Limitation of Liability')}</SectionTitle>
          <p className="mb-3">The Service is provided &ldquo;<strong>as is</strong>&rdquo; and &ldquo;<strong>as available</strong>&rdquo; without warranty of any kind. We disclaim all implied warranties of merchantability, fitness for purpose, non-infringement and accuracy.</p>
          <p className="mb-3">We expressly disclaim liability for the loss, injury or death of livestock; Farmer failure to receive or respond to Reports; and any losses incurred by Walkers or Farmers through use of the Service.</p>
          <p className="mb-3">Our total cumulative liability shall not exceed the greater of: (a) total fees paid by you in the preceding 12 months; or (b) £50.</p>
          <p>Nothing limits our liability for death or personal injury caused by negligence, or fraudulent misrepresentation, or where limitation is prohibited by law (including the Consumer Rights Act 2015).</p>

          <SectionTitle id="t14">{t('terms.s14.title', {}, '14. Indemnification')}</SectionTitle>
          <p>You agree to indemnify Little Bo Peep Ltd against all claims, losses, costs and expenses arising from your use of the Service, Content you submit, breach of these Terms, or violation of any applicable law or third-party right.</p>

          <SectionTitle id="t15">{t('terms.s15.title', {}, '15. Third-Party Services & Links')}</SectionTitle>
          <p>Third-party services (mapping providers, authentication, payment processors) are governed by their own terms. We are not responsible for their practices and inclusion of a link does not constitute endorsement.</p>

          <SectionTitle id="t16">{t('terms.s16.title', {}, '16. Service Availability & Modifications')}</SectionTitle>
          <p>We do not guarantee availability at any particular time. We may suspend, modify or discontinue any part of the Service without notice. We accept no liability for losses arising from unavailability.</p>

          <SectionTitle id="t17">{t('terms.s17.title', {}, '17. Changes to These Terms')}</SectionTitle>
          <p>We may amend these Terms at any time. Material changes will be communicated via the Service or by email. Continued use constitutes acceptance. If you do not agree, your remedy is to close your account and cease using the Service.</p>

          <SectionTitle id="t18">{t('terms.s18.title', {}, '18. Termination')}</SectionTitle>
          <Sub>18.1 Termination by You</Sub>
          <p className="mb-3">Contact us at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a> to terminate your account. Termination does not automatically delete personal data, which is subject to our retention obligations.</p>
          <Sub>18.2 Termination by Us</Sub>
          <p className="mb-3">We may suspend or terminate your account without notice for breach of these Terms, suspected fraud, legal requirement, or Service discontinuation.</p>
          <Sub>18.3 Effect of Termination</Sub>
          <p>Sections 12, 13, 14 and 19 survive termination.</p>

          <SectionTitle id="t19">{t('terms.s19.title', {}, '19. Governing Law & Dispute Resolution')}</SectionTitle>
          <p className="mb-3">These Terms are governed by the laws of <strong>England and Wales</strong>. The courts of England and Wales have exclusive jurisdiction, except that consumers in Scotland or Northern Ireland may also bring proceedings in their local courts. We encourage informal resolution first at <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a>.</p>

          <SectionTitle id="t20">{t('terms.s20.title', {}, '20. General Provisions')}</SectionTitle>
          <p className="mb-3">These Terms together with our Privacy Policy constitute the entire agreement. If any provision is found invalid, the remainder continues in full force. Our failure to enforce a right is not a waiver. You may not assign your rights without our consent.</p>

          <SectionTitle id="t21">{t('terms.s21.title', {}, '21. Contact Us')}</SectionTitle>
          <Callout>
            <strong>Little Bo Peep Ltd</strong><br />
            Email: <a href="mailto:info@littlebopeep.app" style={{ color: '#614270' }}>info@littlebopeep.app</a><br />
            Subject: <em>Terms &amp; Conditions Enquiry</em>
          </Callout>
          <p>We aim to respond within 5 working days.</p>
          <p className="mt-4 text-xs" style={{ color: '#92998B' }}>These Terms were last reviewed April 2025 and do not constitute legal advice.</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
