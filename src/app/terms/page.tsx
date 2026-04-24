export default function TermsPage() {
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
          --warn-bg:    #fff8e6;
          --warn-border:#e6a817;
          --warn-text:  #7a5200;
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

        .legal-page .important-notice {
          background: var(--warn-bg);
          border: 2px solid var(--warn-border);
          border-radius: 8px;
          padding: 24px 28px;
          margin-bottom: 48px;
          color: var(--warn-text);
          font-size: 15px;
          line-height: 1.65;
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

        .legal-page .warning {
          border-left: 4px solid var(--warn-border);
          background: var(--warn-bg);
          padding: 16px 20px;
          border-radius: 0 6px 6px 0;
          margin: 20px 0;
          font-size: 15px;
          color: var(--warn-text);
        }

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
          <h1>Terms &amp; Conditions</h1>
          <div className="meta">Version 1.0 &nbsp;·&nbsp; Effective date: 1 May 2025 &nbsp;·&nbsp; Last reviewed: April 2025</div>
        </header>

        <div className="page-wrap">

          <div className="important-notice">
            <strong>Please read these Terms carefully before using the Service.</strong><br /><br />
            By creating an account, accessing or using the Little Bo Peep platform (the &ldquo;<strong>Service</strong>&rdquo;), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy, which is incorporated herein by reference. If you do not agree, you must not use the Service.
          </div>

          <div className="toc">
            <h2>Contents</h2>
            <ol>
              <li><a href="#t1">About Us &amp; These Terms</a></li>
              <li><a href="#t2">Definitions</a></li>
              <li><a href="#t3">Eligibility &amp; Account Registration</a></li>
              <li><a href="#t4">Description of the Service</a></li>
              <li><a href="#t5">No Guarantee of Report Delivery</a></li>
              <li><a href="#t6">Walker Responsibilities</a></li>
              <li><a href="#t7">Countryside Access, Land &amp; Livestock Law</a></li>
              <li><a href="#t8">Farmer Responsibilities</a></li>
              <li><a href="#t9">Prohibited Use &amp; Abuse</a></li>
              <li><a href="#t10">PWA Installation &amp; Device Use</a></li>
              <li><a href="#t11">Fees, Subscriptions &amp; Payment</a></li>
              <li><a href="#t12">Intellectual Property</a></li>
              <li><a href="#t13">Disclaimers &amp; Limitation of Liability</a></li>
              <li><a href="#t14">Indemnification</a></li>
              <li><a href="#t15">Third-Party Services</a></li>
              <li><a href="#t16">Service Availability</a></li>
              <li><a href="#t17">Changes to These Terms</a></li>
              <li><a href="#t18">Termination</a></li>
              <li><a href="#t19">Governing Law &amp; Jurisdiction</a></li>
              <li><a href="#t20">General Provisions</a></li>
              <li><a href="#t21">Contact Us</a></li>
            </ol>
          </div>

          <section id="t1">
            <h2 className="section-title">1. About Us &amp; These Terms</h2>
            <p>Little Bo Peep Ltd (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;, &ldquo;<strong>our</strong>&rdquo;, or the &ldquo;<strong>Company</strong>&rdquo;) is a private limited company incorporated and registered in England and Wales. We operate the Little Bo Peep digital platform and progressive web application, accessible at <strong>littlebopeep.app</strong> and any associated subdomains (collectively, the &ldquo;<strong>Service</strong>&rdquo;).</p>
            <p>These Terms and Conditions (&ldquo;<strong>Terms</strong>&rdquo;) govern your access to and use of the Service, and constitute a legally binding agreement between you and Little Bo Peep Ltd. They should be read in conjunction with our Privacy Policy, available at <strong>littlebopeep.app/privacy</strong>.</p>
            <p>These Terms are governed by the laws of England and Wales. Any dispute arising out of or in connection with these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales, subject to Section 19.</p>
          </section>

          <section id="t2">
            <h2 className="section-title">2. Definitions</h2>
            <table>
              <tbody>
                <tr><th>Term</th><th>Meaning</th></tr>
                <tr><td><strong>Walker</strong></td><td>A registered user who uses the Service to report sightings of lost, stray or unattended livestock.</td></tr>
                <tr><td><strong>Farmer</strong></td><td>A registered user who has created a farm or landowner profile and who may receive livestock sighting reports via the Service.</td></tr>
                <tr><td><strong>Report</strong></td><td>A livestock sighting submission made by a Walker through the Service, including location data, description, and any accompanying photographs.</td></tr>
                <tr><td><strong>Farm Zone</strong></td><td>A geographically defined area registered by a Farmer within the Service, within which Farmers elect to receive Report notifications.</td></tr>
                <tr><td><strong>Content</strong></td><td>Any text, images, data, location information or other material submitted by users through the Service.</td></tr>
                <tr><td><strong>PWA</strong></td><td>Progressive Web Application — a version of the Service that can be installed to a user&apos;s device using web browser functionality, without distribution through a third-party application store.</td></tr>
              </tbody>
            </table>
          </section>

          <section id="t3">
            <h2 className="section-title">3. Eligibility &amp; Account Registration</h2>
            <h3>3.1 Age and Capacity</h3>
            <p>You must be at least 16 years of age to create an account and use the Service. By registering, you confirm that you are at least 16 years old and, if you are between 16 and 18, that you have obtained the consent of a parent or guardian to use the Service.</p>
            <p>You must have the legal capacity to enter into a binding contract under the laws of England and Wales.</p>
            <h3>3.2 Account Registration</h3>
            <p>You agree to provide accurate, current and complete information during registration and to keep that information updated. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>
            <p>You must notify us immediately at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a> if you become aware of any unauthorised access to or use of your account. We will not be liable for any loss or damage arising from your failure to keep your credentials secure.</p>
            <h3>3.3 One Account Per User</h3>
            <p>You may not create multiple accounts or use another person&apos;s account without their authorisation. We reserve the right to suspend or terminate duplicate or fraudulent accounts.</p>
          </section>

          <section id="t4">
            <h2 className="section-title">4. Description of the Service</h2>
            <p>The Little Bo Peep Service is a digital platform that enables countryside Walkers to submit reports of lost, stray or unattended livestock — primarily sheep — and enables registered Farmers to receive notifications of such reports within geographic areas they have defined.</p>
            <p>The Service is an <strong>information-sharing and communication facilitation tool only</strong>. We are a technology intermediary. We do not:</p>
            <ul>
              <li>Own, manage, or have any responsibility for any livestock;</li>
              <li>Guarantee or warrant the accuracy, completeness or timeliness of any Report submitted by a Walker;</li>
              <li>Manage or control farmers&apos; land, livestock husbandry, or fencing;</li>
              <li>Act as an agent for any Walker or Farmer;</li>
              <li>Operate as an emergency service or animal welfare reporting body.</li>
            </ul>
            <div className="warning">
              <strong>Not an emergency service:</strong> If you believe an animal is in immediate distress or danger, or if you witness a road traffic accident involving livestock, please contact the relevant emergency services (999 in the UK), the RSPCA (0300 1234 999), or local authorities directly. The Little Bo Peep Service is not a substitute for these services.
            </div>
          </section>

          <section id="t5">
            <h2 className="section-title">5. No Guarantee of Report Delivery or Farmer Response</h2>
            <p>By using the Service as a Walker, you <strong>expressly acknowledge and agree</strong> to the following:</p>
            <h3>5.1 No Guarantee of Delivery</h3>
            <p>The submission of a Report does not guarantee that any Farmer will receive, read, or act upon it. Delivery of a Report notification to a Farmer depends on, among other factors: whether a Farmer has registered a Farm Zone covering the relevant area; whether the Farmer has enabled notifications; whether the Farmer&apos;s account is active; and the availability of our technical infrastructure at the time of submission.</p>
            <h3>5.2 Farmer Discretion</h3>
            <p>Farmers are under <strong>no obligation</strong> to accept, respond to, acknowledge, or act upon any Report submitted through the Service. A Farmer may at any time: choose not to register for or configure Farm Zones; disable or limit the types of notifications they receive; ignore, dismiss or decline to action any Report. We have no authority to compel any Farmer to take any action in respect of a Report, and we accept no liability for a Farmer&apos;s failure or decision not to respond to a Report.</p>
            <h3>5.3 No Duty of Care to Walkers Regarding Outcomes</h3>
            <p>We owe no duty of care to Walkers in respect of outcomes following the submission of a Report, including but not limited to whether a lost animal is recovered, whether livestock is returned to safe land, or whether a Farmer takes any remedial action. The Service is a communication tool and nothing more.</p>
            <div className="callout">
              <strong>Summary for Walkers:</strong> Submitting a report is a helpful act, but you should have no expectation that the relevant farmer will receive it, respond to it, or act on it. We thank you for using the Service, but we cannot promise outcomes.
            </div>
          </section>

          <section id="t6">
            <h2 className="section-title">6. Walker Responsibilities</h2>
            <h3>6.1 Accuracy of Reports</h3>
            <p>You agree that all Reports you submit will be honest, accurate and made in good faith. You must not submit false, exaggerated, misleading or vexatious Reports. Submission of deliberately inaccurate or malicious Reports may constitute a criminal offence and/or result in suspension or termination of your account.</p>
            <h3>6.2 Photographs and Content</h3>
            <p>Where you upload photographs or other Content as part of a Report:</p>
            <ul>
              <li>You confirm you are the author or owner of the Content, or that you have all necessary rights and permissions to submit it;</li>
              <li>You grant us a non-exclusive, royalty-free, worldwide licence to use, store, transmit, display and share that Content as necessary to operate the Service;</li>
              <li>You confirm that the Content does not infringe any third party&apos;s intellectual property, privacy or other rights;</li>
              <li>You must not upload photographs that contain identifiable images of persons without their consent;</li>
              <li>You understand that photographs submitted as part of a Report may be shared with Farmers in accordance with these Terms and our Privacy Policy.</li>
            </ul>
            <h3>6.3 Personal Safety</h3>
            <p>Your personal safety is your own responsibility when using the Service in the field. We do not encourage, endorse or guarantee the safety of any location, route or terrain depicted or accessible through the Service. You must exercise your own judgement at all times.</p>
          </section>

          <section id="t7">
            <h2 className="section-title">7. Countryside Access, Land Law &amp; Livestock Legislation</h2>
            <p>This is one of the most important sections of these Terms. Please read it carefully.</p>
            <h3>7.1 The Service Does Not Grant Rights of Access</h3>
            <p>Nothing in the Service — including the display of maps, Farm Zones, reported sightings, or any other feature — constitutes, implies or grants any right to access, enter or traverse any land, whether private, common, agricultural, or otherwise. The display of a location or zone on any map within the Service does not indicate that such land is open to public access.</p>
            <div className="warning">
              <strong>Always seek permission.</strong> Before entering any land, you must establish that you have a lawful right to do so — whether by right of way, access land designation under the Countryside and Rights of Way Act 2000 (CRoW Act), or the express permission of the landowner. When in doubt, do not enter. We expressly disclaim all liability for any trespass, injury, damage or loss arising from your entry onto any land.
            </div>
            <h3>7.2 Compliance with Local Laws and Byelaws</h3>
            <p>As a Walker using this Service, you are solely responsible for knowing and complying with all applicable laws, regulations, byelaws, access agreements, and codes of conduct relevant to your location. This includes, without limitation:</p>
            <ul>
              <li>The <strong>Countryside and Rights of Way Act 2000</strong> (England and Wales);</li>
              <li>The <strong>Land Reform (Scotland) Act 2003</strong> (where applicable);</li>
              <li>The <strong>Countryside Act 1968</strong> and any relevant bye-laws;</li>
              <li>Landowner restrictions, seasonal access limitations, and local authority access orders;</li>
              <li>Any applicable Welsh, Scottish or Northern Irish legislation governing access to rural land.</li>
            </ul>
            <h3>7.3 The Countryside Code</h3>
            <p>All Walkers and users of the Service are expected to follow the <strong>Countryside Code</strong> (published by Natural England and applicable equivalents in Wales, Scotland and Northern Ireland) at all times. Key obligations under the Countryside Code include, but are not limited to:</p>
            <ul>
              <li>Respecting the land, leaving no litter, and causing no damage;</li>
              <li>Following any signs or instructions from landowners or local authorities;</li>
              <li>Keeping to marked public rights of way and designated access land;</li>
              <li>Leaving gates as you find them;</li>
              <li>Not picking crops, damaging fences, hedges, walls or other property.</li>
            </ul>
            <h3>7.4 Dogs and Livestock</h3>
            <p>The following rules are <strong>mandatory</strong> for all Walker users of the Service who are accompanied by dogs:</p>
            <ul>
              <li>Dogs <strong>must be kept on a lead</strong> of no more than two metres in length at all times when on or near land on which livestock are present, including sheep, cattle, pigs, goats and horses;</li>
              <li>Dogs must be kept on a lead on all public rights of way that pass through areas where livestock are or are likely to be present;</li>
              <li>Under the <strong>Dogs (Protection of Livestock) Act 1953</strong>, it is a criminal offence to allow a dog to worry livestock. &ldquo;Worrying&rdquo; includes attacking or chasing livestock in a way that is likely to cause injury, suffering, abortion or loss of production;</li>
              <li>Farmers have certain rights under the law to protect their livestock from dogs, including the right, in prescribed circumstances, to shoot a dog that is attacking livestock;</li>
              <li>You are responsible for ensuring your dog is under effective control at all times.</li>
            </ul>
            <h3>7.5 Disturbance of Livestock</h3>
            <p>Walkers must not, in the course of using this Service or otherwise:</p>
            <ul>
              <li>Approach, touch, move, drive, scatter or otherwise interfere with any livestock;</li>
              <li>Cause distress or panic in livestock by sudden noise, rapid movement or any other action;</li>
              <li>Attempt to handle or restrain any stray animal, including sheep. You should observe from a safe distance only;</li>
              <li>Obstruct livestock from accessing water, feed or shelter.</li>
            </ul>
            <div className="warning">
              <strong>Do not approach stray sheep.</strong> The purpose of this Service is to <em>report</em> observations to farmers — not to intervene with livestock. Attempting to herd, move or restrain stray animals is dangerous to you and to the animals and may constitute a criminal offence under the Animal Welfare Act 2006 or applicable agricultural legislation.
            </div>
            <h3>7.6 Farmers&apos; Acknowledgement</h3>
            <p>By registering as a Farmer on the Service, you acknowledge that we have communicated the above access, dog and livestock obligations to Walker users as part of our registration process and these Terms. We make this clear to Walkers at the point of sign-up and through these Terms. Accordingly, we are not responsible for any Walker&apos;s failure to comply with those obligations, and Farmers indemnify us against any claims arising from Walker access to or conduct on their land, except to the extent caused by our own negligence.</p>
          </section>

          <section id="t8">
            <h2 className="section-title">8. Farmer Responsibilities</h2>
            <h3>8.1 Account Information</h3>
            <p>Farmers must provide accurate information about their farm and registered land during registration. Farmers are responsible for keeping Farm Zone boundaries and contact details current.</p>
            <h3>8.2 Subscription and Payment</h3>
            <p>Farmer accounts are subject to the fee and subscription provisions set out in Section 11. By registering as a Farmer, you agree to the payment terms applicable at the time of registration, as amended from time to time in accordance with Section 11.</p>
            <h3>8.3 Farmer&apos;s Own Obligations</h3>
            <p>Farmers remain solely responsible for:</p>
            <ul>
              <li>The welfare, management and security of their own livestock at all times;</li>
              <li>Compliance with all applicable agricultural, animal welfare and land management legislation, including but not limited to the Animal Welfare Act 2006, the Animals Act 1971, and any fencing and livestock containment regulations;</li>
              <li>Responding to or acting upon any Report received via the Service, at their sole discretion;</li>
              <li>Ensuring that any land access arrangements on their property comply with applicable law.</li>
            </ul>
          </section>

          <section id="t9">
            <h2 className="section-title">9. Prohibited Use &amp; Misuse of the Service</h2>
            <p>You must not use the Service in any manner that is unlawful, abusive, fraudulent, misleading or harmful. Prohibited uses include, without limitation:</p>
            <ul>
              <li>Submitting false, fabricated or malicious Reports;</li>
              <li>Using the Service to facilitate or plan trespass, damage to property, or any criminal activity;</li>
              <li>Harassing, abusing or threatening other users;</li>
              <li>Uploading Content that infringes third-party intellectual property rights, is defamatory, obscene, or otherwise unlawful;</li>
              <li>Attempting to access, interfere with, or disrupt the Service&apos;s infrastructure, databases or security mechanisms;</li>
              <li>Creating accounts for the purpose of generating false Report volumes or manipulating Farm Zone alerts;</li>
              <li>Impersonating any person or entity or misrepresenting your affiliation with any person or entity;</li>
              <li>Using the Service to promote third-party commercial services without our prior written consent;</li>
              <li>Circumventing or attempting to circumvent any technical restrictions or access controls.</li>
            </ul>
            <div className="warning">
              <strong>Serious misuse may result in prosecution.</strong> Fraudulent, malicious or abusive use of the Service may constitute criminal offences under the Computer Misuse Act 1990, the Fraud Act 2006, the Communications Act 2003, the Protection from Harassment Act 1997, or other applicable legislation. We reserve the right to report such conduct to relevant law enforcement authorities and to cooperate fully with any investigation. We may seek civil remedies, including injunctions and damages, against users who cause harm through misuse of the Service.
            </div>
          </section>

          <section id="t10">
            <h2 className="section-title">10. Progressive Web Application (PWA) Installation</h2>
            <p>The Service may offer functionality allowing users to install it as a Progressive Web Application (&ldquo;<strong>PWA</strong>&rdquo;) on their device using standard browser-based installation features, without requiring download from a third-party application store.</p>
            <div className="callout">
              <strong>Installation is entirely at the user&apos;s own risk.</strong> We do not warrant, guarantee or support the PWA version of the Service, and the following conditions apply:
            </div>
            <ul>
              <li>The PWA is provided on an <strong>&ldquo;as is&rdquo; and &ldquo;as available&rdquo;</strong> basis. We make no representation that it will function correctly on any particular device, operating system, or browser version;</li>
              <li>We are under no obligation to maintain the PWA, issue updates, or ensure compatibility with future operating system or browser versions;</li>
              <li>PWA installation may cache data on your device. You are responsible for managing locally cached data and for ensuring any device on which the PWA is installed is adequately secured;</li>
              <li>We accept no liability for any loss, data corruption, device damage or security compromise arising from or related to your installation or use of the PWA;</li>
              <li>Push notifications delivered through the PWA are subject to device permissions and platform limitations outside our control. We do not warrant that notifications will be delivered reliably via a PWA installation;</li>
              <li>You may uninstall the PWA at any time using your device&apos;s standard application management functions.</li>
            </ul>
          </section>

          <section id="t11">
            <h2 className="section-title">11. Fees, Subscriptions &amp; Payment</h2>
            <h3>11.1 Current Pricing</h3>
            <p>Certain features of the Service — in particular, Farmer accounts — may currently be offered free of charge during a trial or introductory period. Walker access to the Service is currently provided free of charge. We reserve the right to introduce charges for any or all features of the Service at any time, subject to the provisions below.</p>
            <h3>11.2 Right to Introduce and Vary Fees</h3>
            <p>We expressly reserve the following rights, exercisable at our sole discretion:</p>
            <ul>
              <li>To introduce fees for any feature of the Service, including features currently provided free of charge;</li>
              <li>To set, vary, increase or decrease any fee or subscription amount at any time;</li>
              <li>To change billing frequency, billing structure, or any promotional or introductory pricing;</li>
              <li>To introduce tiered pricing, usage-based charges, or other pricing models.</li>
            </ul>
            <p>Where we introduce or materially change fees that affect your existing account, we will endeavour to provide reasonable notice. However, except where required by applicable consumer law, we are under no legal obligation to provide advance notice of fee changes, and your continued use of the Service following any such change constitutes your acceptance of the revised fees.</p>
            <h3>11.3 Free Trial Period</h3>
            <p>Where a free trial is offered to Farmer accounts, the trial period and its conditions will be set out at the time of registration. At the conclusion of the free trial, continued use of the Service will be subject to the fees in effect at that time. We will endeavour to notify Farmers before the end of a trial period of any upcoming charges.</p>
            <h3>11.4 Payment Processing</h3>
            <p>When payment processing is implemented:</p>
            <ul>
              <li>All payment services will be provided by regulated third-party payment processors;</li>
              <li>Payment processing will be carried out in compliance with the <strong>Payment Services Regulations 2017</strong> (implementing the EU PSD2 Directive as retained in UK law) and the applicable rules of card schemes including <strong>Visa</strong> and <strong>Mastercard</strong>;</li>
              <li>Card data will be processed in accordance with the <strong>Payment Card Industry Data Security Standard (PCI DSS)</strong>. We will not store full card numbers on our systems;</li>
              <li>We accept no liability for the acts or omissions of payment service providers, except to the extent caused by our own negligence;</li>
              <li>You are responsible for ensuring that any payment method registered to your account is valid, authorised for use, and maintained in good standing.</li>
            </ul>
            <h3>11.5 Security of Payment Information</h3>
            <div className="warning">
              <strong>This is a public-facing application.</strong> Whilst we take reasonable precautions to protect all data transmitted through the Service, no internet transmission is completely secure. You should exercise caution when submitting any payment or financial information through any web application, including the Service. If you have concerns about the security of a transaction, please contact us before proceeding.
            </div>
            <h3>11.6 Refunds</h3>
            <p>Unless required by applicable consumer law (including the Consumer Rights Act 2015), all fees paid are non-refundable. Any refund requests will be considered on a case-by-case basis at our absolute discretion.</p>
          </section>

          <section id="t12">
            <h2 className="section-title">12. Intellectual Property</h2>
            <p>The Service, including its design, code, software, text, graphics, logos, icons, and data compilations, is the exclusive intellectual property of Little Bo Peep Ltd or its licensors and is protected by UK and international copyright, trademark, database rights and other intellectual property laws.</p>
            <p>You may not copy, reproduce, distribute, modify, adapt, translate, create derivative works from, publicly display, sell or otherwise exploit any part of the Service without our prior written consent.</p>
            <p>You retain ownership of Content you submit to the Service, subject to the licence granted in Section 6.2. You warrant that you have all necessary rights to submit such Content and that it does not infringe any third party&apos;s rights.</p>
          </section>

          <section id="t13">
            <h2 className="section-title">13. Disclaimers &amp; Limitation of Liability</h2>
            <h3>13.1 Service Provided &ldquo;As Is&rdquo;</h3>
            <p>The Service is provided on an &ldquo;<strong>as is</strong>&rdquo; and &ldquo;<strong>as available</strong>&rdquo; basis without any warranty of any kind, whether express, implied or statutory. To the fullest extent permitted by applicable law, we disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and accuracy.</p>
            <h3>13.2 No Warranty on Reports</h3>
            <p>We make no representation or warranty regarding the accuracy, completeness, reliability or timeliness of any Report submitted by a Walker or any information displayed on the Service. Reports are submitted by third-party users and we do not verify their accuracy.</p>
            <h3>13.3 No Liability for Livestock Outcomes</h3>
            <p>We expressly disclaim all liability for:</p>
            <ul>
              <li>The loss, injury, death or welfare of any livestock, whether or not reported through the Service;</li>
              <li>A Farmer&apos;s failure to receive, read, or respond to any Report;</li>
              <li>Any loss, cost or damage incurred by a Farmer as a result of stray or lost livestock;</li>
              <li>Any loss, cost or damage incurred by a Walker arising from submission of a Report.</li>
            </ul>
            <h3>13.4 Maps and Location Data</h3>
            <p>Maps and location data displayed within the Service are provided by third-party mapping providers. We do not warrant their accuracy and they must not be relied upon for navigation, land boundary determination, or assessment of access rights.</p>
            <h3>13.5 Limitation of Liability</h3>
            <p>To the fullest extent permitted by applicable law, our total cumulative liability to you for any loss or damage arising out of or in connection with your use of the Service — whether in contract, tort (including negligence), breach of statutory duty, or otherwise — shall not exceed the greater of: (a) the total fees paid by you to us in the twelve months preceding the event giving rise to liability; or (b) £50 (fifty pounds sterling).</p>
            <p>We shall not be liable for any:</p>
            <ul>
              <li>Indirect, special, incidental, consequential or punitive loss or damage;</li>
              <li>Loss of profits, revenue, business, contracts or anticipated savings;</li>
              <li>Loss or corruption of data;</li>
              <li>Loss of reputation or goodwill;</li>
            </ul>
            <p>whether or not such losses were foreseeable or we had been advised of their possibility.</p>
            <h3>13.6 Consumer Rights</h3>
            <p>Nothing in these Terms limits or excludes our liability for death or personal injury caused by our negligence, fraudulent misrepresentation, or any other matter where limitation or exclusion of liability is not permitted by applicable law, including under the Consumer Rights Act 2015.</p>
          </section>

          <section id="t14">
            <h2 className="section-title">14. Indemnification</h2>
            <p>You agree to indemnify, defend and hold harmless Little Bo Peep Ltd, its officers, employees, contractors and agents from and against any and all claims, losses, damages, costs and expenses (including reasonable legal fees) arising out of or in connection with:</p>
            <ul>
              <li>Your use of the Service;</li>
              <li>Any Content you submit through the Service;</li>
              <li>Your breach of these Terms;</li>
              <li>Your violation of any applicable law or third-party right, including intellectual property rights, privacy rights, or access laws;</li>
              <li>Your conduct on or near any land accessed or visited in connection with your use of the Service.</li>
            </ul>
          </section>

          <section id="t15">
            <h2 className="section-title">15. Third-Party Services &amp; Links</h2>
            <p>The Service integrates or links to third-party services including mapping providers, authentication providers, and payment processors. These services are governed by their own terms of service and privacy policies. We are not responsible for the practices, content, or reliability of any third-party service and the inclusion of a link or integration does not constitute our endorsement.</p>
            <p>Your interactions with third-party services through the Service are solely between you and the relevant third party. We are not liable for any loss or damage arising from your use of third-party services.</p>
          </section>

          <section id="t16">
            <h2 className="section-title">16. Service Availability &amp; Modifications</h2>
            <p>We do not guarantee that the Service will be available at any particular time or for any particular duration. We may, at our sole discretion and without notice:</p>
            <ul>
              <li>Suspend, modify, restrict or discontinue the Service or any part thereof;</li>
              <li>Carry out maintenance, updates or infrastructure changes that temporarily affect availability;</li>
              <li>Restrict access to certain features, regions or user categories.</li>
            </ul>
            <p>We accept no liability for any loss or inconvenience arising from Service unavailability.</p>
          </section>

          <section id="t17">
            <h2 className="section-title">17. Changes to These Terms</h2>
            <p>We reserve the right to amend these Terms at any time, and any such amendments shall be effective upon posting to the Service. We will use reasonable efforts to notify users of material changes, which may include notification within the Service or by email to your registered address.</p>
            <p>Your continued use of the Service following the posting of revised Terms constitutes your acceptance of those Terms. If you do not agree to revised Terms, your sole remedy is to cease using the Service and close your account.</p>
            <p>It is your responsibility to check these Terms periodically for changes. The date of the most recent revision is shown at the top of this document.</p>
          </section>

          <section id="t18">
            <h2 className="section-title">18. Termination</h2>
            <h3>18.1 Termination by You</h3>
            <p>You may terminate your account at any time by contacting us at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a> or by using any account deletion functionality provided within the Service. Termination of your account does not automatically result in deletion of all personal data, which is subject to our data retention obligations as set out in our Privacy Policy.</p>
            <h3>18.2 Termination by Us</h3>
            <p>We reserve the right to suspend or terminate your account and access to the Service at any time and without notice if:</p>
            <ul>
              <li>You breach any provision of these Terms;</li>
              <li>We reasonably suspect fraudulent, abusive or unlawful use of your account;</li>
              <li>Required to do so by law or by a competent authority;</li>
              <li>We decide to discontinue the Service or any part thereof.</li>
            </ul>
            <h3>18.3 Effect of Termination</h3>
            <p>Upon termination of your account: your right to access and use the Service will immediately cease; provisions of these Terms that by their nature should survive termination (including Sections 12, 13, 14, and 19) will continue to apply.</p>
          </section>

          <section id="t19">
            <h2 className="section-title">19. Governing Law &amp; Dispute Resolution</h2>
            <p>These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) are governed by and construed in accordance with the law of <strong>England and Wales</strong>.</p>
            <p>The parties irrevocably agree that the courts of England and Wales shall have exclusive jurisdiction to settle any such dispute or claim, subject to the following:</p>
            <ul>
              <li>If you are a consumer resident in Scotland or Northern Ireland, you may also bring proceedings in the courts of Scotland or Northern Ireland respectively;</li>
              <li>Nothing in this clause prevents us from seeking interim or injunctive relief in any jurisdiction;</li>
              <li>We encourage users to contact us in the first instance to attempt informal resolution of any dispute at <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a>.</li>
            </ul>
          </section>

          <section id="t20">
            <h2 className="section-title">20. General Provisions</h2>
            <h3>20.1 Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Little Bo Peep Ltd in relation to the Service and supersede all prior agreements, representations and understandings.</p>
            <h3>20.2 Severability</h3>
            <p>If any provision of these Terms is found by a court of competent jurisdiction to be invalid, unlawful or unenforceable, that provision shall be severed from the remaining Terms, which shall continue in full force and effect.</p>
            <h3>20.3 Waiver</h3>
            <p>Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.</p>
            <h3>20.4 Assignment</h3>
            <p>You may not assign, transfer or sub-licence any of your rights or obligations under these Terms without our prior written consent. We may assign our rights and obligations under these Terms to any successor in business, including in connection with a merger, acquisition, or sale of assets.</p>
            <h3>20.5 No Partnership or Agency</h3>
            <p>Nothing in these Terms creates or implies any partnership, joint venture, agency, franchise, or employment relationship between you and us.</p>
            <h3>20.6 Force Majeure</h3>
            <p>We shall not be liable for any failure or delay in performing our obligations under these Terms where such failure or delay is caused by circumstances beyond our reasonable control, including but not limited to acts of God, pandemic, war, civil unrest, failure of third-party internet infrastructure, or governmental action.</p>
          </section>

          <section id="t21">
            <h2 className="section-title">21. Contact Us</h2>
            <p>If you have any questions about these Terms, wish to report a breach, or need to contact us for any reason relating to the Service, please reach out:</p>
            <div className="callout">
              <strong>Little Bo Peep Ltd</strong><br />
              Email: <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a><br />
              Subject: <em>Terms &amp; Conditions Enquiry</em>
            </div>
            <p>We aim to respond to all queries within 5 working days.</p>
          </section>

        </div>

        <footer>
          <p>&copy; 2025 Little Bo Peep Ltd. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>Registered in England and Wales &nbsp;·&nbsp; <a href="mailto:info@littlebopeep.app">info@littlebopeep.app</a></p>
          <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.6 }}>These Terms &amp; Conditions were last reviewed April 2025. They do not constitute legal advice.</p>
          <p style={{ marginTop: '12px' }}>
            <a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms">Terms &amp; Conditions</a> &nbsp;·&nbsp; <a href="/">Back to App</a>
          </p>
        </footer>
      </div>
    </>
  )
}
