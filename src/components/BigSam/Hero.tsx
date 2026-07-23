"use client";

import { useState } from "react";
import Link from "next/link";
import Countdown from "./Countdown";
import EventImage from "./EventImage";
import Icon from "@/components/Icon";
import type { SiteContent } from "@/lib/types";

// Placeholder event imagery — override from Admin → CMS Content → "hero" block
// with data.image (stage/crowd) and data.portrait (a vocalist) when real
// Big-Sam photos are available.
const DEFAULT_EVENT_IMG = "/images/highlight/slide-1.png";
const DEFAULT_PORTRAIT_IMG = "/images/ThumbnailSlider/Slider_1.jpg";

export default function Hero({ site }: { site: SiteContent }) {
  const s = site.settings;
  const hero = site.content?.hero;
  const eyebrow = hero?.data?.badge || `Auditions · ${formatDate(s.event_date)}`;
  const title = hero?.title || s.event_name;
  const subtitle = hero?.body || s.event_tagline;
  const eventImg = hero?.data?.image || DEFAULT_EVENT_IMG;
  const portraitImg = hero?.data?.portrait || DEFAULT_PORTRAIT_IMG;
  const gateOpen = site.app_open?.open;
  const isFree = s.payment_mode === "free";

  // A portrait upload is treated as a finished poster: the frame goes tall so it
  // shows big and uncropped on a branded backdrop. The cards stay, but the heavy
  // scrim/caption that would cover the flyer are dropped.
  const [posterMode, setPosterMode] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-IcyBreeze to-white dark:from-darkmode dark:to-darkmode pt-32 pb-16 lg:pt-40 lg:pb-24">
      <div className="container">
        <div className="grid lg:grid-cols-12 grid-cols-1 items-center gap-30">
          {/* Left — copy */}
          <div className="lg:col-span-6">
            <p
              data-aos="fade-up"
              data-aos-delay="150"
              data-aos-duration="1000"
              className="relative z-0 inline-flex items-center gap-2 text-primary text-lg font-bold before:absolute before:content-[''] before:bg-primary/20 before:w-full before:h-2 before:-z-1 before:bottom-1"
            >
              <Icon name="mic" size={20} /> {eyebrow}
            </p>

            <h1 data-aos="fade-up" data-aos-delay="250" data-aos-duration="1000" className="py-4">
              {title}
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="350"
              data-aos-duration="1000"
              className="text-xl text-SlateBlueText dark:text-white/70 font-normal max-w-506 md:pb-10 pb-6"
            >
              {subtitle}
            </p>

            <div
              data-aos="fade-up"
              data-aos-delay="450"
              data-aos-duration="1000"
              className="flex items-center flex-wrap gap-4 mb-10"
            >
              {gateOpen ? (
                <Link href="/apply" className="btn btn-1 hover-filled-slide-down rounded-lg overflow-hidden">
                  <span className="!flex !items-center gap-2">
                    <Icon name="music" size={20} /> {isFree ? "Apply Now — Free" : `Apply Now — ${s.fee_currency} ${s.fee_amount}`}
                  </span>
                </Link>
              ) : (
                <span className="btn_primary opacity-60 cursor-not-allowed">Applications Closed</span>
              )}
              <Link href="/how-to-enter" className="btn_outline btn-2 hover-outline-slide-down group rounded-lg">
                <span className="!flex !items-center gap-2">How it works</span>
              </Link>
            </div>

            <div data-aos="fade-up" data-aos-delay="550" data-aos-duration="1000">
              <p className="text-sm font-semibold text-MistyTealText mb-3 uppercase tracking-wide">
                Auditions begin in
              </p>
              <Countdown date={s.event_date} theme="light" />
            </div>
          </div>

          {/* Right — event imagery composition */}
          <div
            data-aos="fade-left"
            data-aos-delay="200"
            data-aos-duration="1000"
            className="lg:col-span-6 relative lg:block hidden"
          >
            {/* Main image. A portrait poster gets a tall, clean frame and takes
                over as the hero; a landscape photo keeps the rich composition. */}
            <div
              className={`relative overflow-hidden shadow-hero-box transition-all duration-500 ${
                posterMode
                  ? "rounded-22 aspect-[4/5] ring-1 ring-black/5"
                  : "rounded-tl-166 rounded-br-166 aspect-[5/4]"
              }`}
            >
              <EventImage src={eventImg} alt="Live Big-Sam audition event" onPortrait={setPosterMode} />

              {/* Scrim + caption help legibility on photos; a poster carries its
                  own date/venue, so we skip the heavy scrim that would cover it. */}
              {!posterMode && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-transparent" />
                  <div className="absolute bottom-5 left-6 right-6 text-white">
                    <p className="text-lg font-extrabold drop-shadow">{s.event_city}</p>
                    <p className="text-sm text-white/80">{formatDate(s.event_date)}</p>
                  </div>
                </>
              )}

              {/* Live badge — kept in both modes. */}
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/90 backdrop-blur rounded-full py-1.5 px-3 shadow-round-box">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-secondary">Live Auditions</span>
              </div>
            </div>

            {/* Floating decorations — kept in both modes. */}
            {/* Overlapping vocalist portrait */}
            <div className="absolute -bottom-8 -left-8 w-40 xl:w-44 rounded-22 overflow-hidden border-4 border-white dark:border-darkmode shadow-hero-box hidden xl:block">
              <img src={portraitImg} alt="Big-Sam vocalist" className="w-full h-56 object-cover" />
            </div>

            {/* Floating prize card */}
            <div className="absolute top-14 -right-5 bg-primary rounded-22 shadow-hero-box py-3 px-5">
              <p className="text-lg font-extrabold text-white flex items-center gap-2">
                <Icon name="trophy" size={20} /> 1st Prize
              </p>
              <p className="text-base font-semibold text-white text-center">
                {s.fee_currency} {Number(s.prize_1).toLocaleString()}
              </p>
            </div>

            {/* Floating top-N card */}
            <div className="absolute bottom-16 -right-4 bg-secondary rounded-22 shadow-hero-box py-2.5 px-4 hidden xl:block">
              <p className="text-base font-extrabold text-white flex items-center gap-2">
                <Icon name="star" size={18} className="text-primary" /> Top {s.top_n_recruited}
              </p>
              <p className="text-xs font-semibold text-white/70 text-center">Join the team</p>
            </div>
          </div>

          {/* Mobile event image — poster: tall & clean; photo: rich with info. */}
          <div
            className={`lg:hidden relative w-full rounded-22 overflow-hidden shadow-hero-box transition-all duration-500 ${
              posterMode ? "aspect-[4/5] max-w-sm mx-auto ring-1 ring-black/5" : "aspect-[4/3] sm:aspect-[16/10]"
            }`}
            data-aos="fade-up"
          >
            <EventImage src={eventImg} alt="Live Big-Sam audition event" onPortrait={setPosterMode} />

            {/* Scrim + city/date only for photos — a poster carries its own. */}
            {!posterMode && (
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
            )}

            {/* Live badge — both modes. */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur rounded-full py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-secondary">Live Auditions</span>
            </div>

            {/* Prize chip — both modes; caption only for photos. */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
              {!posterMode ? (
                <div>
                  <p className="text-base font-extrabold drop-shadow">{s.event_city}</p>
                  <p className="text-xs text-white/80">{formatDate(s.event_date)}</p>
                </div>
              ) : (
                <span />
              )}
              <div className="bg-primary/95 rounded-xl py-1.5 px-3 shadow-hero-box text-center shrink-0">
                <p className="text-[11px] font-bold text-white/80 leading-none uppercase tracking-wide">1st Prize</p>
                <p className="text-sm font-extrabold text-white leading-tight">{s.fee_currency} {Number(s.prize_1).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event meta strip */}
        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="mt-16 lg:mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-SlateBlueText dark:text-white/70"
        >
          <span className="flex items-center gap-2"><Icon name="map-pin" size={18} className="text-primary" /> {s.event_venue}</span>
          <span className="flex items-center gap-2"><Icon name="calendar" size={18} className="text-primary" /> {formatDate(s.event_date)}</span>
          <span className="flex items-center gap-2"><Icon name="ticket" size={18} className="text-primary" /> {isFree ? "Free entry — no payment" : `Entry fee ${s.fee_currency} ${s.fee_amount} via M-Pesa`}</span>
        </div>
      </div>
    </section>
  );
}

function formatDate(d: string) {
  const date = new Date(d.replace(" ", "T"));
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}
