"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SubPageHeader from "@/components/BigSam/SubPageHeader";
import { Prizes } from "@/components/BigSam/Sections";
import Icon from "@/components/Icon";

export default function PrizesPage() {
  const { data, loading } = useSiteContent();

  return (
    <main>
      <SubPageHeader
        title="Prizes & Recruitment"
        subtitle="Cash for the top three. A place on the Big-Sam team for the top twenty."
        crumb="Prizes"
      />
      {loading || !data ? (
        <div className="container py-20 text-center text-SlateBlueText">Loading…</div>
      ) : (
        <>
          <Prizes site={data} />

          <section className="bg-white dark:bg-darkmode">
            <div className="container max-w-3xl">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "trophy", t: "Cash prizes", d: "Top 3 vocalists share the podium cash awards." },
                  { icon: "star", t: `Top ${data.settings.top_n_recruited} recruited`, d: "Join the Big-Sam team and perform with us." },
                  { icon: "mic", t: "Exposure", d: "Perform live and get featured across our channels." },
                ].map((c, i) => (
                  <div key={i} className="rounded-22 bg-IcyBreeze dark:bg-darklight p-6 text-center">
                    <span className="inline-flex w-12 h-12 items-center justify-center rounded-14 bg-primary/10 text-primary mb-3">
                      <Icon name={c.icon as any} size={24} />
                    </span>
                    <h3 className="font-bold text-secondary dark:text-white mb-1">{c.t}</h3>
                    <p className="text-sm text-SlateBlueText">{c.d}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/apply" className="btn_primary">Apply to compete</Link>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
