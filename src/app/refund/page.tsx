"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import LegalPage from "@/components/BigSam/Legal";

export default function RefundPage() {
  const { data } = useSiteContent();
  const s = data?.settings;
  const fee = s ? `${s.fee_currency} ${s.fee_amount}` : "the application fee";

  return (
    <LegalPage
      title="Refund Policy"
      subtitle="How application fees and payments are handled."
      updated="July 2026"
      html={data?.content?.page_refund?.body}
    >
      <h2>1. Application fees are non-refundable</h2>
      <p>
        The application fee of <strong>{fee}</strong> covers the cost of processing your entry and running the audition.
        Once your payment is confirmed and a reference number is issued, the fee is <strong>non-refundable</strong>,
        including where an applicant is not shortlisted, withdraws, or fails to attend.
      </p>

      <h2>2. Failed or duplicate payments</h2>
      <ul>
        <li>
          If your M-Pesa payment fails or is cancelled, <strong>no fee is charged</strong> and you can safely retry from
          the <Link href="/status">status page</Link> without re-filling the form.
        </li>
        <li>
          If you are <strong>charged more than once</strong> for the same application due to a technical error, the
          duplicate amount will be refunded. Contact us with your M-Pesa receipt number(s) and application reference.
        </li>
      </ul>

      <h2>3. Event changes</h2>
      <p>
        If the event is cancelled outright by the organiser (and not merely postponed or moved online), we will
        communicate how confirmed applicants will be handled at that time.
      </p>

      <h2>4. How to request a duplicate-charge refund</h2>
      <p>
        Email{" "}
        {s?.contact_email ? <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a> : "our published contact address"}{" "}
        with your name, application reference, and the M-Pesa receipt numbers. Verified duplicate charges are refunded
        via M-Pesa to the paying number, typically within 7 working days.
      </p>

      <p className="!mt-8">
        See also our <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
