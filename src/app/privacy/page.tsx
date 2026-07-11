"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import LegalPage from "@/components/BigSam/Legal";

export default function PrivacyPage() {
  const { data } = useSiteContent();
  const s = data?.settings;
  const event = s?.event_name || "Big-Sam Vocal Auditions 2026";
  const org = "Big-Sam Production";

  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How we collect, use and protect your personal data under the Kenya Data Protection Act, 2019."
      updated="July 2026"
      html={data?.content?.page_privacy?.body}
    >
      <p>
        {org} (&quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we
        handle personal data collected through the {event} website, in line with the{" "}
        <strong>Kenya Data Protection Act, 2019</strong>.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Application details:</strong> full name, phone number, email (optional), age, gender, town/county, vocal style.</li>
        <li><strong>Audition material:</strong> the link or file you submit.</li>
        <li><strong>Payment data:</strong> M-Pesa transaction references and receipt numbers (we do <strong>not</strong> store your M-Pesa PIN or bank details).</li>
        <li><strong>Technical data:</strong> IP address and browser information, used for security and fraud prevention.</li>
      </ul>

      <h2>2. Why we collect it</h2>
      <ul>
        <li>To process your application and entry-fee payment.</li>
        <li>To communicate with you about your application, status, and results (SMS/email).</li>
        <li>To administer judging, shortlisting and the event itself.</li>
        <li>To meet legal, accounting and security obligations.</li>
      </ul>

      <h2>3. Lawful basis</h2>
      <p>
        We process your data on the basis of your <strong>consent</strong> (given when you submit the form), the
        <strong> performance of our engagement</strong> with you as an applicant, and our <strong>legitimate interests</strong>
        in running a fair, secure competition.
      </p>

      <h2>4. Sharing your data</h2>
      <p>We only share data where necessary:</p>
      <ul>
        <li><strong>Safaricom (M-Pesa / Daraja)</strong> to process payments.</li>
        <li><strong>SMS/email providers</strong> to send you confirmations and updates.</li>
        <li>Where required by law or a lawful authority.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal data.</p>

      <h2>5. Retention</h2>
      <p>
        {s?.privacy_notice ||
          "Your personal data is collected solely to process your audition application and will be deleted or anonymized within 90 days after the event, unless a longer period is required by law."}
      </p>

      <h2>6. Your rights</h2>
      <p>Under the Kenya Data Protection Act, 2019 you have the right to:</p>
      <ul>
        <li>Be informed about how your data is used.</li>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your data (subject to legal obligations).</li>
        <li>Object to or restrict certain processing, and to withdraw consent.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        We use appropriate technical and organisational measures — including encrypted connections (HTTPS), hashed
        credentials, and restricted access — to protect your data. Payment processing occurs entirely on Safaricom&apos;s
        secure infrastructure.
      </p>

      <h2>8. Contact &amp; complaints</h2>
      <p>
        To exercise your rights or raise a concern, contact us at{" "}
        {s?.contact_email ? <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a> : "our published contact address"}
        {s?.contact_phone ? <> or {s.contact_phone}</> : null}. You also have the right to lodge a complaint with the
        Office of the Data Protection Commissioner (ODPC), Kenya.
      </p>

      <p className="!mt-8">
        See also our <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
        <Link href="/refund">Refund Policy</Link>.
      </p>
    </LegalPage>
  );
}
