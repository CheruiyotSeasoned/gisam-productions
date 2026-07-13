"use client";

import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import SubPageHeader from "@/components/BigSam/SubPageHeader";
import { serviceIcon } from "@/components/BigSam/Sections";
import Icon from "@/components/Icon";
import type { ServiceItem, PackageGroup } from "@/lib/types";

/**
 * "What We Do" — the Big-Sam Production service list and package pricing.
 * Everything here is CMS-driven (Admin → CMS Content → Services), so prices can
 * change without a redeploy.
 */
export default function ServicesPage() {
  const { data, loading } = useSiteContent();

  const services = data?.content?.services;
  const packages = data?.content?.packages;
  const items: ServiceItem[] = services?.data?.items || [];
  const groups: PackageGroup[] = packages?.data?.groups || [];
  const terms: string = packages?.data?.terms || "";
  const s = data?.settings;

  const whatsapp = s?.whatsapp_sponsor || s?.whatsapp_contestant;

  return (
    <main>
      <SubPageHeader
        title={services?.title || "What We Do"}
        subtitle={services?.body || "Weddings, photography, audio and live production — creating great memories."}
        crumb="Services"
      />

      {loading || !data ? (
        <div className="container py-20 text-center text-SlateBlueText">Loading…</div>
      ) : (
        <>
          {/* Service grid */}
          {items.length > 0 && (
            <section className="bg-white dark:bg-darkmode">
              <div className="container">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((it, i) => (
                    <div
                      key={i}
                      data-aos="fade-up"
                      data-aos-delay={50 + (i % 4) * 75}
                      className="rounded-22 bg-IcyBreeze dark:bg-darklight p-5 text-center"
                    >
                      <span className="inline-flex w-11 h-11 items-center justify-center rounded-14 bg-primary/10 text-primary mb-3">
                        <Icon name={serviceIcon(it.icon)} size={22} />
                      </span>
                      <h3 className="font-bold text-secondary dark:text-white text-sm sm:text-base">{it.title}</h3>
                      {it.text && <p className="text-xs text-SlateBlueText mt-1">{it.text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Packages */}
          {groups.map((group, gi) => (
            <section key={gi} className={gi % 2 === 0 ? "bg-IcyBreeze dark:bg-darklight" : "bg-white dark:bg-darkmode"}>
              <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <h2>{group.name}</h2>
                  {group.note && <p className="text-SlateBlueText mt-3">{group.note}</p>}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {group.items.map((p, i) => (
                    <div
                      key={i}
                      data-aos="fade-up"
                      data-aos-delay={100 + (i % 4) * 75}
                      className="flex flex-col rounded-22 bg-white dark:bg-darkmode shadow-round-box overflow-hidden border border-PowderBlueBorder dark:border-dark_border"
                    >
                      <div className="bg-secondary text-white px-5 py-4">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-primary text-xl font-extrabold mt-0.5">{p.price}</div>
                      </div>
                      <ul className="p-5 space-y-2 flex-1">
                        {p.includes.map((line, li) => (
                          <li key={li} className="flex items-start gap-2 text-sm text-SlateBlueText">
                            <Icon name="check" size={16} className="text-primary mt-0.5 shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* Booking terms + contact */}
          <section className="bg-secondary text-white">
            <div className="container">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="!text-white text-white">Ready to book?</h2>
                  {terms && <p className="text-white/80 mt-4">{terms}</p>}
                </div>
                <div className="space-y-3 md:justify-self-end w-full md:w-auto">
                  {whatsapp && (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-primaryDark transition"
                    >
                      <Icon name="handshake" size={20} /> Book on WhatsApp
                    </a>
                  )}
                  {s?.contact_phone && (
                    <a
                      href={`tel:${s.contact_phone.replace(/\s/g, "")}`}
                      className="flex items-center justify-center gap-2 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/10 transition"
                    >
                      <Icon name="mic" size={20} /> {s.contact_phone}
                    </a>
                  )}
                  <Link
                    href="/apply"
                    className="flex items-center justify-center gap-2 text-white/70 hover:text-white text-sm pt-1"
                  >
                    Auditioning instead? Apply here <Icon name="arrow-right" size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
