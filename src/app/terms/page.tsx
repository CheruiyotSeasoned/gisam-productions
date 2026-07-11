"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import LegalPage from "@/components/BigSam/Legal";

export default function TermsPage() {
  const { data } = useSiteContent();
  const s = data?.settings;
  const event = s?.event_name || "Big-Sam Vocal Auditions 2026";
  const fee = s ? `${s.fee_currency} ${s.fee_amount}` : "the published application fee";
  const org = "Big-Sam Production";

  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle={`The rules that govern your participation in ${event}.`}
      updated="July 2026"
      html={data?.content?.page_terms?.body}
    >
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your application to and participation in{" "}
        <strong>{event}</strong> organised by <strong>{org}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;the organiser&quot;).
        By submitting an application you confirm that you have read, understood and agree to these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <ul>
        <li>Applicants must be <strong>16 years of age or older</strong> at the time of the audition.</li>
        <li>The competition is open to solo vocalists resident in Kenya, of any genre.</li>
        <li>Each applicant may submit <strong>one application per phone number</strong>. Duplicate entries may be disqualified.</li>
        <li>Employees of {org} and their immediate family members are not eligible to win prizes.</li>
      </ul>

      <h2>2. Application &amp; entry fee</h2>
      <ul>
        <li>A non-refundable application fee of <strong>{fee}</strong> is payable via M-Pesa to complete your entry.</li>
        <li>Your application is only confirmed once payment has been received and a reference number issued.</li>
        <li>Applications close on the published deadline or when the applicant cap is reached, whichever comes first.</li>
        <li>You are responsible for providing accurate information. False or misleading information may lead to disqualification.</li>
      </ul>

      <h2>3. Audition material</h2>
      <ul>
        <li>You must submit an original audition clip (link or upload) of your own vocal performance.</li>
        <li>You confirm you own or have the necessary rights to any material you submit.</li>
        <li>Content that is offensive, unlawful, or infringes third-party rights will be rejected.</li>
      </ul>

      <h2>4. Judging &amp; selection</h2>
      <ul>
        <li>Shortlisting and final selection are at the sole discretion of the organiser and appointed judges.</li>
        <li>Judges&apos; decisions are final and no correspondence will be entered into regarding them.</li>
        <li>Prizes are as published and are not transferable or exchangeable for cash equivalents unless stated.</li>
      </ul>

      <h2>5. Media &amp; publicity consent</h2>
      <p>
        By entering, you grant {org} the right to record, photograph, broadcast and use your name, likeness, and
        audition/performance material for promotional purposes across any media, before, during and after the event,
        without further compensation.
      </p>

      <h2>6. Conduct</h2>
      <p>
        Participants are expected to behave professionally and respectfully. The organiser reserves the right to
        disqualify any participant for misconduct, dishonesty, or breach of these Terms.
      </p>

      <h2>7. Liability</h2>
      <p>
        Participants take part at their own risk. To the extent permitted by law, {org} is not liable for any loss,
        injury, or damage arising from participation, except where caused by our negligence. The event may be
        postponed, altered or cancelled due to circumstances beyond our reasonable control.
      </p>

      <h2>8. Data protection</h2>
      <p>
        Your personal data is handled in accordance with the <strong>Kenya Data Protection Act, 2019</strong> and our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The version published on this website at the time of your
        application applies to your entry.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        {s?.contact_email ? <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a> : "our published contact address"}
        {s?.contact_phone ? <> or {s.contact_phone}</> : null}.
      </p>
    </LegalPage>
  );
}
