export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;600&display=swap');

        :root {
          --green:      #2d5a27;
          --green-mid:  #3d7a35;
          --green-pale: #eef4ec;
          --cream:      #faf8f3;
          --text:       #1c2519;
          --muted:      #5a6b56;
          --border:     #c8d9c4;
          --accent:     #8fbc4e;
        }

        .legal-page {
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 400;
          background: var(--cream);
          color: var(--text);
          line-height: 1.75;
          font-size: 16px;
          min-height: 100vh;
        }

        .legal-nav {
          background: var(--green);
          padding: 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .legal-nav .nav-logo {
          font-family: 'Lora', serif;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legal-nav .nav-back {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
        }

        .legal-nav .nav-back:hover { color: #fff; }

        .legal-page header {
          background: var(--green);
          color: #fff;
          padding: 48px 32px 40px;
          text-align: center;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .legal-page header .logo-mark {
          font-family: 'Lora', serif;
          font-size: 13px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }

        .legal-page header h1 {
          font-family: 'Lora', serif;
          font-size: clamp(26px, 5vw, 40px);
          font-weight: 600;
          margin-bottom: 12px;
        }

        .legal-page header .meta {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.04em;
        }

        .legal-page .page-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 56px 32px 80px;
        }

        .legal-page .toc {
          background: var(--green-pale);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 28px 32px;
          margin-bottom: 56px;
        }

        .legal-page .toc h2 {
          font-family: 'Lora', serif;
          font-size: 16px;
          color: var(--green);
          margin-bottom: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .legal-page .toc ol {
          padding-left: 20px;
          columns: 2;
          column-gap: 32px;
        }

        .legal-page .toc li { margin-bottom: 5px; }

        .legal-page .toc a {
          color: var(--green-mid);
          text-decoration: none;
          font-size: 14px;
        }

        .legal-page .toc a:hover { text-decoration: underline; }

        .legal-page section { margin-bottom: 52px; }
        .legal-page section:last-of-type { margin-bottom: 0; }

        .legal-page h2.section-title {
          font-family: 'Lora', serif;
          font-size: 22px;
          color: var(--green);
          border-bottom: 2px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 22px;
          scroll-margin-top: 24px;
        }

        .legal-page h3 {
          font-family: 'Source Sans 3', sans-serif;
          font-weight: 600;
          font-size: 16px;
          color: var(--text);
          margin: 22px 0 8px;
        }

        .legal-page p { margin-bottom: 14px; }
        .legal-page p:last-child { margin-bottom: 0; }

        .legal-page ul, .legal-page ol {
          padding-left: 22px;
          margin-bottom: 14px;
        }

        .legal-page li { margin-bottom: 6px; }

        .legal-page .callout {
          border-left: 4px solid var(--green-mid);
          background: var(--green-pale);
          padding: 16px 20px;
          border-radius: 0 6px 6px 0;
          margin: 20px 0;
          font-size: 15px;
        }

        .legal-page .callout strong { color: var(--green); }

        .legal-page table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin: 16px 0 20px;
        }

        .legal-page th {
          background: var(--green);
          color: #fff;
          text-align: left;
          padding: 10px 14px;
          font-weight: 600;
        }

        .legal-page td {
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }

        .legal-page tr:last-child td { border-bottom: none; }
        .legal-page tr:nth-child(even) td { background: var(--green-pale); }

        .legal-page footer {
          background: var(--green);
          color: rgba(255,255,255,0.7);
          text-align: center;
          padding: 32px;
          font-size: 13px;
        }

        .legal-page footer a { color: var(--accent); text-decoration: none; }

        @media (max-width: 600px) {
          .legal-page .toc ol { columns: 1; }
          .legal-page .page-wrap { padding: 32px 20px 60px; }
          .legal-page header { padding: 36px 20px 28px; }
          .legal-nav { padding: 12px 20px; }
        }
      `}</style>

      <div className="legal-page">
        <nav className="legal-nav">
          <a href="/" className="nav-logo">
            <img src="/logo-pin.svg" alt="" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />
            Little Bo Peep
          </a>
          <a href="/" className="nav-back">← Back to app</a>
        </nav>

        <header>
          <div className="logo-mark">Little Bo Peep Ltd</div>
          <h1>Privacy Policy</h1>
          <div className="meta">Version 1.0 &nbsp;·&nbsp; Effective date: 1 May 2025 &nbsp;·&nbsp; Last reviewed: April 2025</div>
        </header>

        <div className="page-wrap">

          <div className="toc">
            <h2>Contents</h2>
            <ol>
              <li><a href="#s1">Who We Are</a></li>
              <li><a href="#s2">Scope of This Policy</a></li>
              <li><a href="#s3">Data We Collect</a></li>
              <li><a href="#s4">How We Use Your Data</a></li>
              <li><a href="#s5">Legal Bases for Processing</a></li>
              <li><a href="#s6">Cookies &amp; Tracking</a></li>
              <li><a href="#s7">Sharing Your Data</a></li>
              <li><a href="#s8">International Transfers</a></li>
              <li><a href="#s9">Data Retention</a></li>
              <li><a href="#s10">Your Rights</a></li>
              <li><a href="#s11">Children&apos;s Privacy</a></li>
              <li><a href="#s12">Security</a></li>
              <li><a href="#s13">Changes to This Policy</a></li>
              <li><a href="#s14">How to Contact Us</a></li>
            </ol>
          </div>

          <section id="s1">
            <h2 className="section-title">1. Who We Are</h2>
            <p>Little Bo Peep Ltd (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;) is a private limited company incorporated and registered in England and Wales. We operate the Little Bo Peep digital platform and mobile-progressive web application (collectively, the &ldquo;<strong>Service</strong>&rdquo;), accessible at <strong>littlebopeep.app</strong> and any associated subdomains.</p>
            <p>For the purposes of the UK General Data Protection Regulation (<strong>UK GDPR</strong>) and the Data Protection Act 2018 (<strong>DPA 2018</strong>), Little Bo Peep Ltd is the <strong>data controller</strong> of personal data processed through the Service.</p>
            <div className="callout">
              <strong>Data Controller contact:</strong><br />
              Little Bo Peep Ltd<br />
              Email: <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a>
            </div>
            <p>We are committed to registering with the Information Commissioner&apos;s Office (<strong>ICO</strong>) as required by the DPA 2018 and to maintaining that registration in good standing.</p>
          </section>

          <section id="s2">
            <h2 className="section-title">2. Scope of This Policy</h2>
            <p>This Privacy Policy applies to all personal data we collect when you:</p>
            <ul>
              <li>Visit, browse, or register on our website or application;</li>
              <li>Use the Service as a countryside walker or rambler (&ldquo;<strong>Walker</strong>&rdquo;);</li>
              <li>Use the Service as a registered farmer or landowner (&ldquo;<strong>Farmer</strong>&rdquo;);</li>
              <li>Contact us by any means, including by email.</li>
            </ul>
            <p>It does not apply to third-party websites or services linked from our platform. We recommend you review the privacy policies of any third-party services you access.</p>
          </section>

          <section id="s3">
            <h2 className="section-title">3. Data We Collect</h2>
            <h3>3.1 Data you provide to us</h3>
            <table>
              <tbody>
                <tr><th>Category</th><th>Examples</th></tr>
                <tr><td>Identity data</td><td>First name, last name, username</td></tr>
                <tr><td>Contact data</td><td>Email address, telephone number (optional)</td></tr>
                <tr><td>Account credentials</td><td>Hashed password, authentication tokens</td></tr>
                <tr><td>Farmer profile data</td><td>Farm name, farm address, land zone coordinates, billing contact details</td></tr>
                <tr><td>Report data (Walker)</td><td>Description of a lost or stray sheep, photographs uploaded by you, date/time of sighting, notes</td></tr>
                <tr><td>Payment data</td><td>Billing name, address, payment method details (processed by our PCI DSS-compliant payment processor; we do not store full card numbers)</td></tr>
                <tr><td>Communications</td><td>Content of messages you send to us via email or support channels</td></tr>
              </tbody>
            </table>
            <h3>3.2 Data collected automatically</h3>
            <table>
              <tbody>
                <tr><th>Category</th><th>Examples</th></tr>
                <tr><td>Location data</td><td>GPS coordinates at the point of sheep sighting (Walkers); farm zone coordinates (Farmers). Location data is personal data and is processed only with your explicit consent obtained at account creation or at first use of location features.</td></tr>
                <tr><td>Device &amp; technical data</td><td>IP address, browser type and version, operating system, device identifiers, time zone</td></tr>
                <tr><td>Usage data</td><td>Pages visited, features used, report submission events, session timestamps</td></tr>
                <tr><td>Photographic data</td><td>Images of livestock uploaded by Walkers. We note that photographs may incidentally capture third parties. You should not upload photographs containing identifiable individuals. Where such images are uploaded, we will treat them as personal data subject to this policy.</td></tr>
              </tbody>
            </table>
            <h3>3.3 Data received from third parties</h3>
            <p>We may receive limited data from third-party authentication providers (if you choose to sign in via a third-party identity service) or mapping service providers (such as Mapbox) in connection with your use of the Service.</p>
          </section>

          <section id="s4">
            <h2 className="section-title">4. How We Use Your Data</h2>
            <p>We use personal data for the following purposes:</p>
            <ul>
              <li><strong>Providing and operating the Service:</strong> creating and managing your account; enabling Walkers to submit lost sheep reports; enabling Farmers to receive, manage and respond to reports within their registered farm zones.</li>
              <li><strong>Communicating with you:</strong> sending service notifications, report alerts, account confirmations and administrative messages.</li>
              <li><strong>Processing payments:</strong> administering subscriptions, free-trial periods and any billing for Farmer accounts.</li>
              <li><strong>Improving the Service:</strong> analysing usage patterns, diagnosing technical issues, developing new features.</li>
              <li><strong>Legal compliance:</strong> meeting our obligations under applicable law, including responding to lawful requests from public authorities.</li>
              <li><strong>Safety and security:</strong> detecting and preventing fraudulent, abusive or unlawful use of the Service.</li>
            </ul>
            <p>We will not use your personal data for automated decision-making or profiling that produces legal or similarly significant effects without your explicit consent.</p>
          </section>

          <section id="s5">
            <h2 className="section-title">5. Legal Bases for Processing</h2>
            <p>Under the UK GDPR, we rely on the following lawful bases:</p>
            <table>
              <tbody>
                <tr><th>Processing Activity</th><th>Lawful Basis</th></tr>
                <tr><td>Account creation and management</td><td>Performance of a contract (Art. 6(1)(b))</td></tr>
                <tr><td>Delivery of core Service features (reports, alerts)</td><td>Performance of a contract (Art. 6(1)(b))</td></tr>
                <tr><td>Location data collection</td><td>Consent (Art. 6(1)(a)) — you may withdraw consent at any time</td></tr>
                <tr><td>Payment processing</td><td>Performance of a contract (Art. 6(1)(b))</td></tr>
                <tr><td>Service improvement and analytics</td><td>Legitimate interests (Art. 6(1)(f)) — our interest in improving the Service, balanced against your rights</td></tr>
                <tr><td>Compliance with legal obligations (e.g. HMRC records)</td><td>Legal obligation (Art. 6(1)(c))</td></tr>
                <tr><td>Marketing communications (if applicable)</td><td>Consent (Art. 6(1)(a)) — you may withdraw consent at any time</td></tr>
              </tbody>
            </table>
            <p>Where we rely on <strong>legitimate interests</strong>, we have assessed that our interests do not override your fundamental rights and freedoms. You may object to processing carried out on this basis by contacting us.</p>
          </section>

          <section id="s6">
            <h2 className="section-title">6. Cookies &amp; Tracking Technologies</h2>
            <p>We use cookies and similar technologies (including local storage and session tokens) to operate and improve the Service. Cookies we use include:</p>
            <ul>
              <li><strong>Strictly necessary cookies:</strong> required for you to log in, navigate the Service, and use core features. These cannot be disabled without affecting the functionality of the Service.</li>
              <li><strong>Functional cookies:</strong> remember your preferences (e.g. map layer settings, language preference).</li>
              <li><strong>Analytics cookies:</strong> help us understand how the Service is used (e.g. pages visited, errors encountered). Where we use third-party analytics, data is anonymised or pseudonymised where possible.</li>
            </ul>
            <p>You may control non-essential cookies via your browser settings. Blocking certain cookies may affect Service functionality. A full cookie notice is presented on your first visit to the Service.</p>
          </section>

          <section id="s7">
            <h2 className="section-title">7. Sharing Your Data</h2>
            <p>We do not sell, rent or trade your personal data. We may share personal data with:</p>
            <ul>
              <li><strong>Registered Farmers:</strong> when a Walker submits a sheep sighting report, relevant report data (including the sighting location, photographs, and description) may be shared with Farmers who have registered alert zones that include or are proximate to the sighting location. Walkers acknowledge and accept this sharing as a core function of the Service.</li>
              <li><strong>Service providers (data processors):</strong> including cloud hosting providers, database providers, mapping service providers, payment processors, and email delivery services. These third parties are contractually bound to process data only on our instructions and in accordance with applicable data protection law.</li>
              <li><strong>Professional advisers:</strong> lawyers, accountants, auditors and insurers, subject to confidentiality obligations.</li>
              <li><strong>Regulatory authorities:</strong> including the ICO, HMRC, or law enforcement agencies where we are required or permitted to do so by law.</li>
            </ul>
            <div className="callout">
              <strong>Note to Walkers:</strong> Report data you submit — including location, photographs and descriptions — will be visible to Farmers with registered zones covering the relevant area. Do not include personal information about third parties in your reports without their consent.
            </div>
          </section>

          <section id="s8">
            <h2 className="section-title">8. International Data Transfers</h2>
            <p>We host our Service infrastructure primarily within the United Kingdom and the European Economic Area (EEA). Where personal data is transferred to a country outside the UK or EEA that does not benefit from an adequacy decision, we ensure appropriate safeguards are in place, such as:</p>
            <ul>
              <li>UK International Data Transfer Agreements (IDTAs) or Addenda to the EU Standard Contractual Clauses;</li>
              <li>Binding Corporate Rules; or</li>
              <li>Another lawful transfer mechanism approved by the ICO.</li>
            </ul>
            <p>You may request further information about the transfer mechanisms we rely on by contacting us at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a>.</p>
          </section>

          <section id="s9">
            <h2 className="section-title">9. Data Retention</h2>
            <p>We retain personal data only for as long as necessary for the purposes for which it was collected, or as required by law. Our general retention periods are as follows:</p>
            <table>
              <tbody>
                <tr><th>Data Category</th><th>Retention Period</th></tr>
                <tr><td>Account and profile data</td><td>Duration of account plus 12 months following account closure</td></tr>
                <tr><td>Sheep sighting reports</td><td>24 months from date of submission, unless earlier deletion is requested</td></tr>
                <tr><td>Payment and billing records</td><td>6 years from the end of the relevant tax year, as required by HMRC</td></tr>
                <tr><td>Location data</td><td>Duration of the report to which it relates, plus 24 months</td></tr>
                <tr><td>Communications with us</td><td>3 years from date of last communication</td></tr>
                <tr><td>System logs and technical data</td><td>Up to 12 months, unless required longer for security or legal purposes</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <strong>Right to erasure and legal obligations:</strong> Where you exercise your right to erasure (see Section 10), we will delete or anonymise your personal data subject to any overriding legal obligation to retain it — for example, financial records required by HMRC. In such cases, we will retain only the minimum data necessary to satisfy that obligation and will inform you accordingly.
            </div>
          </section>

          <section id="s10">
            <h2 className="section-title">10. Your Rights Under UK GDPR</h2>
            <p>Subject to certain conditions and exemptions, you have the following rights in relation to your personal data:</p>
            <h3>10.1 Right of Access</h3>
            <p>You may request a copy of the personal data we hold about you and information about how we process it (a &ldquo;Subject Access Request&rdquo; or SAR). We will respond within one calendar month of receipt of a valid request, free of charge.</p>
            <h3>10.2 Right to Rectification</h3>
            <p>You may request correction of inaccurate or incomplete personal data we hold about you.</p>
            <h3>10.3 Right to Erasure (&ldquo;Right to Be Forgotten&rdquo;)</h3>
            <p>You may request deletion of your personal data where it is no longer necessary for the purpose for which it was collected, where you withdraw consent (and no other lawful basis applies), where you have objected and there are no overriding legitimate grounds, or where the data has been unlawfully processed. We will action valid requests within one calendar month. Please note that legal retention obligations (including financial record-keeping under HMRC requirements) may limit our ability to fully erase certain categories of data, and we will notify you of any such limitations.</p>
            <h3>10.4 Right to Restriction of Processing</h3>
            <p>You may request that we restrict processing of your data in certain circumstances, for example while a complaint or objection is being assessed.</p>
            <h3>10.5 Right to Data Portability</h3>
            <p>Where processing is based on consent or performance of a contract, and is carried out by automated means, you may request a copy of your data in a structured, commonly used, machine-readable format, and request that we transmit it directly to another controller where technically feasible.</p>
            <h3>10.6 Right to Object</h3>
            <p>You may object to processing based on legitimate interests or for direct marketing purposes. We will cease processing unless we can demonstrate compelling legitimate grounds that override your interests, or the processing is necessary for legal claims.</p>
            <h3>10.7 Rights Related to Automated Decision-Making</h3>
            <p>You have the right not to be subject to decisions based solely on automated processing, including profiling, that produce legal or similarly significant effects, unless such processing is necessary for a contract, is authorised by law, or you have given explicit consent.</p>
            <h3>10.8 Right to Withdraw Consent</h3>
            <p>Where processing is based on your consent (including for location data), you may withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.</p>
            <h3>10.9 Right to Lodge a Complaint</h3>
            <p>You have the right to lodge a complaint with the <strong>Information Commissioner&apos;s Office (ICO)</strong> if you believe your data protection rights have been infringed:</p>
            <div className="callout">
              Information Commissioner&apos;s Office<br />
              Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF<br />
              Tel: 0303 123 1113 &nbsp;·&nbsp; <a href="https://www.ico.org.uk" target="_blank" rel="noreferrer">www.ico.org.uk</a>
            </div>
            <p>We ask that you contact us first at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a> so we can attempt to resolve your concern.</p>
            <h3>10.10 How to Exercise Your Rights</h3>
            <p>To exercise any of the above rights, please contact us at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a> with &ldquo;<strong>Data Rights Request</strong>&rdquo; in the subject line. We may need to verify your identity before actioning a request. We will not charge a fee for routine requests but reserve the right to charge a reasonable administrative fee for manifestly unfounded or excessive requests.</p>
          </section>

          <section id="s11">
            <h2 className="section-title">11. Children&apos;s Privacy</h2>
            <p>The Service is not intended for use by persons under the age of 16 years. We do not knowingly collect personal data from children under 16. If you are a parent or guardian and believe your child has provided personal data to us without appropriate consent, please contact us at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a> and we will take steps to delete such data promptly.</p>
          </section>

          <section id="s12">
            <h2 className="section-title">12. Security of Your Personal Data</h2>
            <p>We take reasonable and appropriate technical and organisational measures to protect personal data against unauthorised access, loss, destruction, alteration or disclosure. These include, without limitation:</p>
            <ul>
              <li>Encrypted transmission of data using TLS/HTTPS protocols;</li>
              <li>Hashing of passwords and authentication credentials;</li>
              <li>Access controls limiting staff access to personal data to those with a legitimate need;</li>
              <li>Regular security assessments of our infrastructure and codebase.</li>
            </ul>
            <div className="callout">
              <strong>Important:</strong> The Service is a public-facing application accessible via the internet. No method of electronic transmission or storage is 100% secure. We cannot guarantee the absolute security of data transmitted to or from the Service. Users accept this inherent risk by using the Service. You should take care when submitting any personal, financial or sensitive information and should not share your account credentials with any third party.
            </div>
            <p>In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the ICO within 72 hours of becoming aware of it and, where required, notify affected individuals without undue delay.</p>
          </section>

          <section id="s13">
            <h2 className="section-title">13. Changes to This Privacy Policy</h2>
            <p>We reserve the right to update or amend this Privacy Policy at any time. Where changes are material, we will take reasonable steps to notify you, which may include prominently displaying a notice within the Service or sending an email to your registered address. Your continued use of the Service following publication of an updated Privacy Policy constitutes your acceptance of the revised terms.</p>
            <p>We encourage you to review this Privacy Policy periodically. The date of the most recent version is shown at the top of this document.</p>
          </section>

          <section id="s14">
            <h2 className="section-title">14. How to Contact Us</h2>
            <p>If you have any questions, concerns or requests relating to this Privacy Policy or our data practices, please contact us:</p>
            <div className="callout">
              <strong>Little Bo Peep Ltd</strong><br />
              Data Privacy Enquiries<br />
              Email: <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a><br />
              Subject line: <em>Privacy Policy Enquiry</em>
            </div>
            <p>We aim to respond to all enquiries within 5 working days and will respond to formal rights requests within the statutory timescales set out in Section 10.</p>
          </section>

        </div>

        <footer>
          <p>&copy; 2025 Little Bo Peep Ltd. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>Registered in England and Wales &nbsp;·&nbsp; <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a></p>
          <p style={{ marginTop: '12px' }}>
            <a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms">Terms &amp; Conditions</a> &nbsp;·&nbsp; <a href="/">Back to App</a>
          </p>
        </footer>
      </div>
    </>
  )
}
