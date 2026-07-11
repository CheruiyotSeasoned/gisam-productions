"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteContent } from "@/lib/types";
import { apiGet } from "@/lib/api";
import Icon, { IconName } from "@/components/Icon";

/* ------------------------------ Prizes ------------------------------ */
export function Prizes({ site }: { site: SiteContent }) {
  const s = site.settings;
  const c = site.content?.prizes;
  const podium = c?.data?.podium || [
    { place: "1st", amount: s.prize_1 },
    { place: "2nd", amount: s.prize_2 },
    { place: "3rd", amount: s.prize_3 },
  ];
  // Order for a visual podium: 2nd, 1st, 3rd
  const order = [podium[1], podium[0], podium[2]];
  const heights = ["h-40", "h-52", "h-32"];
  const colors = ["bg-SereneSky", "bg-LightYellow", "bg-Aquamarine"];
  const icons: IconName[] = ["award", "trophy", "award"];

  return (
    <section id="prizes" className="bg-IcyBreeze">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2>{c?.title || "Prizes & Recruitment"}</h2>
          <p className="text-SlateBlueText mt-3">{c?.body || "The top three vocalists win cash. The top twenty join the Big-Sam team."}</p>
        </div>

        <div className="flex items-end justify-center gap-4 md:gap-6 mb-10">
          {order.map((p, i) => (
            <div key={i} className="flex flex-col items-center w-28 md:w-40">
              <div className="mb-3 text-center">
                <div className="text-sm font-semibold text-SlateBlueText">{p?.place}</div>
                <div className="text-lg md:text-2xl font-extrabold text-secondary">
                  {s.fee_currency} {Number(p?.amount).toLocaleString()}
                </div>
              </div>
              <div className={`w-full ${heights[i]} ${colors[i]} rounded-t-xl flex items-start justify-center pt-4 shadow-inner`}>
                <Icon name={icons[i]} size={i === 1 ? 40 : 32} className="text-secondary" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <span className="inline-block rounded-full bg-primary/10 text-primary font-semibold px-6 py-2">
            + Top {s.top_n_recruited} vocalists are recruited into the Big-Sam team
          </span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- How to Enter --------------------------- */
export function HowToEnter({ site }: { site: SiteContent }) {
  const c = site.content?.how_to_enter;
  const steps = c?.data?.steps || [];
  const eligibility = c?.data?.eligibility || [];

  return (
    <section id="how-to-enter">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2>{c?.title || "How to Enter"}</h2>
          <p className="text-SlateBlueText mt-3">{c?.body || "Applying takes less than 3 minutes."}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {steps.map((step: any, i: number) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={150 + i * 100}
              className="relative rounded-22 bg-white shadow-round-box p-6 hover:-translate-y-1 transition-transform duration-300 dark:bg-darklight"
            >
              <div className="w-11 h-11 rounded-14 bg-primary text-white font-bold flex items-center justify-center mb-4 text-lg">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold text-secondary dark:text-white mb-2">{step.title}</h3>
              <p className="text-SlateBlueText text-sm">{step.text}</p>
            </div>
          ))}
        </div>

        {eligibility.length > 0 && (
          <div className="max-w-2xl mx-auto bg-IcyBreeze rounded-2xl p-6">
            <h3 className="text-lg font-bold text-secondary mb-3">Eligibility</h3>
            <ul className="space-y-2">
              {eligibility.map((e: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-SlateBlueText">
                  <Icon name="check-circle" size={18} className="text-primary mt-0.5" /> {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/apply" className="btn_primary">Start your application</Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ About ------------------------------- */
export function About({ site }: { site: SiteContent }) {
  const c = site.content?.about;
  if (!c) return null;
  const videos: string[] = c.data?.videos || [];
  const aboutImage: string = c.data?.image || "/images/highlight/slide-1.png";
  return (
    <section className="bg-secondary text-white">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="!text-white text-white">{c.title}</h2>
            <p className="text-white/80 mt-4 text-lg">{c.body}</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {videos.length > 0 ? (
              videos.slice(0, 1).map((v, i) => (
                <div key={i} className="aspect-video rounded-22 overflow-hidden shadow-hero-box">
                  <iframe className="w-full h-full" src={toEmbed(v)} allowFullScreen title="Big-Sam performance" />
                </div>
              ))
            ) : (
              <div className="relative aspect-video rounded-22 overflow-hidden shadow-hero-box">
                <img src={aboutImage} alt="Big-Sam performance" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center text-primary">
                    <Icon name="play" size={26} className="ml-1" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Sponsors ------------------------------ */
export function SponsorStrip() {
  const [logos, setLogos] = useState<any[]>([]);
  useEffect(() => {
    apiGet("/api/sponsors/logos").then((r) => {
      if (r.ok && Array.isArray(r.data)) setLogos(r.data);
    });
  }, []);
  if (logos.length === 0) return null;
  return (
    <section className="py-10 border-y border-PowderBlueBorder bg-white">
      <div className="container">
        <p className="text-center text-SlateBlueText text-sm font-semibold mb-6 uppercase tracking-wide">
          Proudly supported by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((l) => (
            <img key={l.id} src={l.logo_url} alt={l.name} className="h-10 md:h-12 object-contain grayscale hover:grayscale-0 transition" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- FAQ -------------------------------- */
export function Faqs({ site }: { site: SiteContent }) {
  const faqs = site.faqs || [];
  const [open, setOpen] = useState<number | null>(0);
  if (faqs.length === 0) return null;
  return (
    <section id="faq" className="bg-IcyBreeze">
      <div className="container max-w-3xl">
        <div className="text-center mb-10">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.id} className="rounded-xl bg-white border border-PowderBlueBorder overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between text-left px-5 py-4 font-semibold text-secondary"
              >
                {f.question}
                <span className="text-primary text-xl">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="px-5 pb-4 text-SlateBlueText">{f.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Gallery ------------------------------ */
const GALLERY_FALLBACK = [
  "/images/ThumbnailSlider/Slider_1.png",
  "/images/ThumbnailSlider/Slider_2.jpg",
  "/images/ThumbnailSlider/Slider_3.png",
  "/images/ThumbnailSlider/Slider_4.jpg",
];
export function Gallery({ site }: { site?: SiteContent }) {
  const block = site?.content?.gallery;
  const images: string[] = (block?.data?.images?.length ? block.data.images : GALLERY_FALLBACK);
  if (images.length === 0) return null;
  return (
    <section className="bg-white dark:bg-darkmode">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-primary font-bold uppercase tracking-wide text-sm mb-2">On the stage</p>
          <h2>{block?.title || "Moments from Big-Sam"}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, i) => (
            <div
              key={i}
              data-aos="zoom-in"
              data-aos-delay={100 + i * 100}
              className={`overflow-hidden rounded-22 shadow-round-box ${i % 2 === 0 ? "md:mt-0" : "md:mt-8"}`}
            >
              <img src={src} alt="Big-Sam performance" className="w-full h-48 md:h-56 object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- CTA -------------------------------- */
export function FinalCTA({ site }: { site: SiteContent }) {
  const open = site.app_open?.open;
  return (
    <section className="bg-primary">
      <div className="container text-center">
        <h2 className="!text-white text-white mb-4">Ready to take the stage?</h2>
        <p className="text-white/85 mb-8 max-w-xl mx-auto">
          {open ? "Applications are open. Secure your slot before the deadline." : "Applications are currently closed — follow us for the next round."}
        </p>
        {open && (
          <Link href="/apply" className="bg-white text-primary font-bold px-8 py-4 rounded-xl inline-block hover:brightness-95 transition">
            Apply Now
          </Link>
        )}
      </div>
    </section>
  );
}

function toEmbed(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
