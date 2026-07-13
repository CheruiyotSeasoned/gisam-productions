"use client";

import { useSiteContent } from "@/lib/useSiteContent";
import Hero from "@/components/BigSam/Hero";
import { Prizes, HowToEnter, About, SponsorStrip, Faqs, FinalCTA, Moments } from "@/components/BigSam/Sections";

export default function Home() {
  const { data, loading, error } = useSiteContent();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-SlateBlueText">Loading…</div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="mb-2">We couldn&apos;t load the page</h2>
          <p className="text-SlateBlueText">{error || "Please try again shortly."}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Hero site={data} />
      <SponsorStrip />
      <Prizes site={data} />
      <HowToEnter site={data} />
      <About site={data} />
      <Moments site={data} />
      <Faqs site={data} />
      <FinalCTA site={data} />
    </main>
  );
}
