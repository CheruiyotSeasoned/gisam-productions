"use client";

import { useSiteContent } from "@/lib/useSiteContent";
import SubPageHeader from "@/components/BigSam/SubPageHeader";
import { HowToEnter } from "@/components/BigSam/Sections";

export default function HowToEnterPage() {
  const { data, loading } = useSiteContent();

  return (
    <main>
      <SubPageHeader
        title="How to Enter"
        subtitle="Apply online in under 3 minutes and pay your entry fee via M-Pesa."
        crumb="How to Enter"
      />
      {loading || !data ? (
        <div className="container py-20 text-center text-SlateBlueText">Loading…</div>
      ) : (
        <HowToEnter site={data} />
      )}
    </main>
  );
}
