"use client";

import { useState } from "react";
import { useSiteContent } from "@/lib/useSiteContent";
import { apiPost } from "@/lib/api";
import Icon from "@/components/Icon";

export default function SponsorsPage() {
  const { data, loading } = useSiteContent();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const tiers = data?.content?.sponsor_tiers?.data?.tiers || [];
  const intro = data?.content?.sponsor_tiers;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setTopError(null);
    const form = new FormData(e.currentTarget);
    const res = await apiPost("/api/sponsors/inquiry", {
      company: form.get("company"),
      contact_person: form.get("contact_person"),
      phone: form.get("phone"),
      email: form.get("email"),
      tier: form.get("tier"),
      message: form.get("message"),
    });
    setSubmitting(false);
    if (res.ok) setSent(true);
    else {
      setErrors(res.errors || {});
      setTopError(res.message || "Please check the form.");
    }
  }

  if (loading) return <main className="pt-28 pb-20 min-h-screen"><div className="text-center text-SlateBlueText">Loading…</div></main>;

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <section className="container text-center">
        <h1 className="text-secondary">{intro?.title || "Partner With Us"}</h1>
        <p className="text-SlateBlueText mt-3 max-w-2xl mx-auto">{intro?.body || "Put your brand in front of a passionate live audience."}</p>
      </section>

      <section className="container mt-12">
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t: any, i: number) => (
            <div key={i} className={`rounded-2xl border p-6 ${i === 0 ? "border-LightYellow bg-LightYellow/10" : "border-PowderBlueBorder bg-white"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary">{t.name}</h3>
                {i === 0 && <span className="text-xs font-bold bg-LightYellow text-secondary px-2 py-1 rounded">POPULAR</span>}
              </div>
              <div className="text-2xl font-extrabold text-primary mb-4">{t.amount}</div>
              <ul className="space-y-2">
                {(t.perks || []).map((p: string, j: number) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-SlateBlueText">
                    <Icon name="check" size={16} className="text-primary mt-0.5" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="container mt-16 max-w-2xl">
        <div className="bg-secondary rounded-2xl p-8 text-white">
          <h2 className="!text-white text-white mb-2">Become a sponsor</h2>
          <p className="text-white/70 mb-6">Tell us a bit about you — our team will reach out within 24 hours.</p>

          {sent ? (
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <Icon name="handshake" size={40} className="mx-auto mb-2 text-LightYellow" />
              <p className="font-semibold">Thank you! We&apos;ll be in touch shortly.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
              {topError && <div className="md:col-span-2 bg-red-500/20 text-red-100 px-4 py-2 rounded text-sm">{topError}</div>}
              <SInput name="company" placeholder="Company name *" errors={errors} />
              <SInput name="contact_person" placeholder="Contact person *" errors={errors} />
              <SInput name="phone" placeholder="Phone *" errors={errors} />
              <SInput name="email" placeholder="Email" errors={errors} />
              <select name="tier" className="sinput md:col-span-2">
                <option value="">Tier of interest</option>
                {tiers.map((t: any, i: number) => <option key={i} value={t.name}>{t.name}</option>)}
              </select>
              <textarea name="message" placeholder="Message" rows={3} className="sinput md:col-span-2" />
              <button disabled={submitting} className="md:col-span-2 bg-LightYellow text-secondary font-bold py-3 rounded-lg disabled:opacity-60">
                {submitting ? "Sending…" : "Submit inquiry"}
              </button>
            </form>
          )}
        </div>
      </section>

      <style jsx global>{`
        .sinput { width:100%; border-radius:.6rem; padding:.7rem .9rem; color:#0B0B0F; outline:none; border:1px solid transparent; }
        .sinput:focus { box-shadow:0 0 0 3px rgba(225,29,46,.35); }
      `}</style>
    </main>
  );
}

function SInput({ name, placeholder, errors }: { name: string; placeholder: string; errors: Record<string, string[]> }) {
  return (
    <div>
      <input name={name} placeholder={placeholder} className="sinput w-full" />
      {errors?.[name]?.length ? <p className="text-red-200 text-xs mt-1">{errors[name][0]}</p> : null}
    </div>
  );
}
