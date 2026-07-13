"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSiteContent } from "@/lib/useSiteContent";
import { apiPostForm, apiGet, apiPost } from "@/lib/api";
import Icon from "@/components/Icon";

type Phase = "form" | "paying" | "success" | "failed";

const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Uasin Gishu","Kiambu","Machakos","Kakamega",
  "Nyeri","Meru","Kilifi","Bungoma","Kajiado","Kericho","Other",
];

export default function ApplyPage() {
  const { data, loading } = useSiteContent();
  const [phase, setPhase] = useState<Phase>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState("Sending payment request…");
  const [clipMode, setClipMode] = useState<"link" | "upload">("link");

  // Money is involved, so don't rely on a disabled button alone: React state is
  // async, and a fast double-tap (or Enter held down) can fire submit twice before
  // the re-render lands. A ref flips synchronously, so the second call is dropped.
  const inFlight = useRef(false);
  // Identifies the current poll loop; a retry bumps it so the previous loop exits
  // instead of two loops racing to set the phase.
  const pollRun = useRef(0);

  // Never leave a timer running after the user navigates away.
  useEffect(() => () => { pollRun.current += 1; }, []);

  const s = data?.settings;
  const gate = data?.app_open;

  if (loading) return <PageShell><div className="text-center py-20 text-SlateBlueText">Loading…</div></PageShell>;

  if (gate && !gate.open) {
    return (
      <PageShell title="Applications Closed">
        <div className="max-w-lg mx-auto text-center bg-white rounded-2xl border border-PowderBlueBorder p-8">
          <Icon name="lock" size={48} className="mx-auto mb-4 text-SlateBlueText" />
          <p className="text-SlateBlueText">
            {gate.reasons?.includes("cap_reached") && "We've reached the maximum number of applications."}
            {gate.reasons?.includes("deadline_passed") && "The application deadline has passed."}
            {!gate.reasons?.length && "Applications are currently closed."}
          </p>
          <Link href="/" className="btn_primary mt-6">Back to home</Link>
        </div>
      </PageShell>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return; // a submit is already on its way — never send a second
    inFlight.current = true;
    setSubmitting(true);
    setErrors({});
    setTopError(null);

    const form = new FormData(e.currentTarget);
    if (clipMode === "link") form.delete("clip_file");
    else form.delete("clip_url");

    let res;
    try {
      res = await apiPostForm("/api/applications", form);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }

    if (!res.ok) {
      setErrors(res.errors || {});
      setTopError(res.message || "Something went wrong. Please check the form.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const ref = res.data?.reference;
    setReference(ref);

    if (res.data?.payment?.success) {
      setPhase("paying");
      setStatusMsg(res.data.payment.message || "Check your phone and enter your M-Pesa PIN.");
      startPolling(ref);
    } else {
      // Application saved but STK didn't start (e.g. gateway not live yet).
      setPhase("failed");
      setStatusMsg(res.data?.payment?.message || "We couldn't start the payment. You can retry below.");
    }
  }

  /** Begin a fresh poll loop, retiring any loop still running. */
  function startPolling(ref: string) {
    pollRun.current += 1;
    pollStatus(ref, pollRun.current, 0);
  }

  function pollStatus(ref: string, run: number, attempts: number) {
    // A newer loop (or an unmount) superseded this one.
    if (run !== pollRun.current) return;

    if (attempts > 40) {
      setPhase("failed");
      setStatusMsg("We didn't get a payment confirmation in time. If you were charged, do NOT pay again — check your status page in a minute.");
      return;
    }

    setTimeout(async () => {
      if (run !== pollRun.current) return;
      const res = await apiGet(`/api/payments/status/${ref}`);
      if (run !== pollRun.current) return;

      const ps = res.data?.payment_status;
      if (res.data?.paid) {
        setPhase("success");
      } else if (ps === "failed" || ps === "cancelled") {
        setPhase("failed");
        setStatusMsg(ps === "cancelled" ? "The payment prompt was cancelled." : "The payment failed. Please retry.");
      } else {
        pollStatus(ref, run, attempts + 1);
      }
    }, 4000);
  }

  async function retry() {
    if (inFlight.current) return; // one retry at a time — two would mean two prompts
    inFlight.current = true;
    setPhase("paying");
    setStatusMsg("Re-sending payment request…");
    try {
      const res = await apiPost("/api/payments/retry", { reference });
      if (res.ok) {
        // The backend hands back the prompt already on the phone rather than sending
        // a second one, and says so — surface its message rather than assuming.
        setStatusMsg(res.message || "Check your phone and enter your M-Pesa PIN.");
        startPolling(reference);
      } else {
        setPhase("failed");
        setStatusMsg(res.message || "Could not restart the payment.");
      }
    } finally {
      inFlight.current = false;
    }
  }

  // ---- Paying / success / failed screens ----
  if (phase !== "form") {
    return (
      <PageShell title="Your Application">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-PowderBlueBorder p-8 text-center">
          {phase === "paying" && (
            <>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <h3 className="text-xl font-bold text-secondary mb-2">Awaiting payment</h3>
              <p className="text-SlateBlueText">{statusMsg}</p>
              <p className="text-sm text-CadetBlue mt-4">Reference: <strong>{reference}</strong></p>
              <p className="mt-4 text-xs text-MistyTealText">
                Keep this page open. Don&apos;t pay twice — if the prompt doesn&apos;t appear, wait for it to time out and retry.
              </p>
            </>
          )}
          {phase === "success" && (
            <>
              <Icon name="check-circle" size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-2xl font-bold text-secondary mb-2">You&apos;re in!</h3>
              <p className="text-SlateBlueText">Your application and payment are confirmed. We&apos;ve sent an SMS with your reference.</p>
              <div className="mt-5 rounded-xl bg-IcyBreeze p-4">
                <div className="text-sm text-SlateBlueText">Your reference number</div>
                <div className="text-2xl font-extrabold text-primary">{reference}</div>
              </div>
              <Link href="/status" className="btn_primary mt-6">Check my status anytime</Link>
            </>
          )}
          {phase === "failed" && (
            <>
              <Icon name="x-circle" size={64} className="mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold text-secondary mb-2">Payment not completed</h3>
              <p className="text-SlateBlueText">{statusMsg}</p>
              {reference && <p className="text-sm text-CadetBlue mt-3">Reference: <strong>{reference}</strong></p>}
              <div className="flex gap-3 justify-center mt-6">
                <button onClick={retry} disabled={submitting} className="btn_primary disabled:opacity-60">Retry payment</button>
                <Link href="/status" className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold">Check status</Link>
              </div>
              <p className="mt-4 text-xs text-MistyTealText">
                If money already left your account, do not retry — use <strong>Check status</strong>.
              </p>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  // ---- Application form ----
  return (
    <PageShell title="Apply to Audition" subtitle={`Application fee: ${s?.fee_currency} ${s?.fee_amount} • Paid via M-Pesa`}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl border border-PowderBlueBorder p-6 md:p-8">
        {topError && <div className="mb-5 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{topError}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Full name" name="full_name" required errors={errors} />
          <Field label="Phone (M-Pesa)" name="phone" required placeholder="07XX XXX XXX" errors={errors} />
          <Field label="National ID / Passport" name="national_id" required placeholder="e.g. 12345678" errors={errors} />
          <Field label="Email (optional)" name="email" type="email" errors={errors} />
          <Field label="Age" name="age" type="number" min={16} max={100} errors={errors} />
          <div>
            <Label>Gender</Label>
            <select name="gender" className="input">
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>County</Label>
            <select name="county" className="input">
              <option value="">Select county</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Town" name="town" errors={errors} />
          <Field label="Vocal style / genre" name="vocal_style" placeholder="Afro-pop, Gospel, R&B…" errors={errors} />
        </div>

        {/* Clip */}
        <div className="mt-6">
          <Label>Audition clip</Label>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setClipMode("link")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${clipMode === "link" ? "bg-primary text-white" : "bg-IcyBreeze text-SlateBlueText"}`}>
              Paste a link
            </button>
            <button type="button" onClick={() => setClipMode("upload")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${clipMode === "upload" ? "bg-primary text-white" : "bg-IcyBreeze text-SlateBlueText"}`}>
              Upload a file
            </button>
          </div>
          {clipMode === "link" ? (
            <input name="clip_url" className="input" placeholder="YouTube / TikTok / Google Drive link" />
          ) : (
            <input name="clip_file" type="file" accept=".mp3,.mp4,.m4a,audio/*,video/mp4" className="input" />
          )}
          <FieldError name="clip_url" errors={errors} />
          <FieldError name="clip_file" errors={errors} />
          <p className="text-xs text-CadetBlue mt-1">A short clip (1–2 min). Max {s ? Math.round((s as any).upload_max_mb || 50) : 50} MB for uploads.</p>
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 mt-6 text-sm text-SlateBlueText">
          <input type="checkbox" name="consent" value="1" required className="mt-1" />
          <span>
            I agree to the event rules and consent to Big-Sam Production using my audition media for promotion.
            {s?.privacy_notice && <span className="block text-xs text-CadetBlue mt-1">{s.privacy_notice}</span>}
          </span>
        </label>

        <button disabled={submitting} className="btn_primary w-full mt-6 disabled:opacity-60">
          {submitting ? "Submitting…" : `Pay ${s?.fee_currency} ${s?.fee_amount} & Apply`}
        </button>
        <p className="text-center text-xs text-CadetBlue mt-3">
          You&apos;ll receive an M-Pesa prompt on your phone to complete payment.
        </p>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #E6E6E9;
          border-radius: 0.6rem;
          padding: 0.7rem 0.9rem;
          outline: none;
          background: #fff;
        }
        .input:focus { border-color: #E11D2E; box-shadow: 0 0 0 3px rgba(225,29,46,.15); }
      `}</style>
    </PageShell>
  );
}

/* ------------------------------ helpers ----------------------------- */
function PageShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <main className="pt-28 pb-20 min-h-screen bg-IcyBreeze">
      {title && (
        <div className="container text-center mb-8">
          <h1 className="text-secondary">{title}</h1>
          {subtitle && <p className="text-SlateBlueText mt-2">{subtitle}</p>}
        </div>
      )}
      <div className="container">{children}</div>
    </main>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-secondary mb-1.5">{children}</label>;
}
function Field({ label, name, type = "text", required = false, placeholder, min, max, errors }:
  { label: string; name: string; type?: string; required?: boolean; placeholder?: string; min?: number; max?: number; errors: Record<string, string[]> }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-red-500"> *</span>}</Label>
      <input name={name} type={type} required={required} placeholder={placeholder} min={min} max={max} className="input" />
      <FieldError name={name} errors={errors} />
    </div>
  );
}
function FieldError({ name, errors }: { name: string; errors: Record<string, string[]> }) {
  if (!errors?.[name]?.length) return null;
  return <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>;
}
