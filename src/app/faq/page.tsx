"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SubPageHeader from "@/components/BigSam/SubPageHeader";
import { Faqs } from "@/components/BigSam/Sections";

export default function FaqPage() {
  const { data, loading } = useSiteContent();

  return (
    <main>
      <SubPageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about applying, fees, and the audition."
        crumb="FAQ"
      />
      {loading || !data ? (
        <div className="container py-20 text-center text-SlateBlueText">Loading…</div>
      ) : data.faqs.length > 0 ? (
        <Faqs site={data} />
      ) : (
        <div className="container py-20 text-center text-SlateBlueText">No FAQs yet — check back soon.</div>
      )}

      <section className="bg-IcyBreeze dark:bg-darklight">
        <div className="container text-center max-w-xl">
          <h2 className="mb-3">Still have a question?</h2>
          <p className="text-SlateBlueText mb-6">Reach us on WhatsApp or send an email — we&apos;re happy to help.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/apply" className="btn_primary">Start applying</Link>
            {data?.settings?.contact_email && (
              <a href={`mailto:${data.settings.contact_email}`} className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold">
                Email us
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
