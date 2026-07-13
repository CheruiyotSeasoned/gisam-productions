"use client";

import { useState } from "react";
import { apiPost, apiGet } from "@/lib/api";

export default function StatusPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function check(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setNote(null);
    const form = new FormData(e.currentTarget);
    const res = await apiPost("/api/status", {
      reference: form.get("reference"),
      phone: form.get("phone"),
    });
    setLoading(false);
    if (res.ok) setResult(res.data);
    else setError(res.message || "Not found.");
  }

  async function retryPayment() {
    if (!result) return;
    setRetrying(true);
    setNote(null);
    const res = await apiPost("/api/payments/retry", { reference: result.reference });
    setRetrying(false);
    if (res.ok) {
      setNote("Payment prompt sent — check your phone. Refresh in a moment to see the update.");
      // Poll a few times.
      let n = 0;
      const id = setInterval(async () => {
        n++;
        const r = await apiGet(`/api/payments/status/${result.reference}`);
        if (r.data?.paid || n > 15) {
          clearInterval(id);
          if (r.data?.paid) setResult({ ...result, paid: true, app_status: "paid", app_status_label: "Paid — application complete", payment_status: "paid" });
        }
      }, 4000);
    } else {
      setNote(res.message || "Could not restart payment.");
    }
  }

  return (
    <main className="pt-28 pb-20 min-h-screen bg-IcyBreeze">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-secondary">Track Your Application</h1>
          <p className="text-SlateBlueText mt-2">Enter your reference number (or National ID) and phone.</p>
        </div>

        <form onSubmit={check} className="bg-white rounded-2xl border border-PowderBlueBorder p-6 md:p-8">
          {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-secondary mb-1.5">Reference number or National ID</label>
            <input name="reference" required placeholder="BSA-2026-000123 or your ID" className="w-full border border-PeriwinkleBorder rounded-lg px-4 py-3 focus:border-primary outline-none" />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-secondary mb-1.5">Phone number</label>
            <input name="phone" required placeholder="07XX XXX XXX" className="w-full border border-PeriwinkleBorder rounded-lg px-4 py-3 focus:border-primary outline-none" />
          </div>
          <button disabled={loading} className="btn_primary w-full disabled:opacity-60">
            {loading ? "Checking…" : "Check status"}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-white rounded-2xl border border-PowderBlueBorder p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-CadetBlue">Reference</div>
                <div className="font-bold text-secondary">{result.reference}</div>
              </div>
              <StatusPill status={result.app_status} label={result.app_status_label} />
            </div>
            <Timeline status={result.app_status} paid={result.paid} />

            <dl className="text-sm space-y-2 mt-5">
              <Row k="Name" v={result.full_name} />
              <Row k="Payment" v={result.paid ? "Paid" : (result.payment_status || "pending")} />
              {result.receipt && <Row k="M-Pesa receipt" v={result.receipt} />}
              <Row k="Amount" v={`KSh ${Number(result.amount).toLocaleString()}`} />
            </dl>

            {note && <div className="mt-4 rounded-lg bg-IcyBreeze text-SlateBlueText px-4 py-3 text-sm">{note}</div>}

            {result.can_retry && !result.paid && (
              <button onClick={retryPayment} disabled={retrying} className="btn_primary w-full mt-5 disabled:opacity-60">
                {retrying ? "Sending…" : "Retry M-Pesa payment"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Timeline({ status, paid }: { status: string; paid: boolean }) {
  const rejected = status === "rejected";
  const decided = ["top_20", "winner_1", "winner_2", "winner_3", "rejected"].includes(status);
  const shortlisted = ["shortlisted", "top_20", "winner_1", "winner_2", "winner_3"].includes(status);

  const resultLabel =
    status === "top_20" ? "Top 20 — recruited!" :
    status.startsWith("winner") ? "Winner!" :
    rejected ? "Not selected this time" : "Final result";

  const steps: { label: string; state: "done" | "current" | "pending" | "failed" }[] = [
    { label: "Application submitted", state: "done" },
    {
      label: "Payment confirmed",
      state: paid ? "done" : status === "payment_failed" ? "failed" : "current",
    },
    {
      label: "Under review",
      state: decided || shortlisted ? "done" : paid ? "current" : "pending",
    },
    {
      label: resultLabel,
      state: decided ? (rejected ? "failed" : "done") : shortlisted ? "current" : "pending",
    },
  ];

  const color = (s: string) =>
    s === "done" ? "bg-green-500 border-green-500" :
    s === "current" ? "bg-primary border-primary animate-pulse" :
    s === "failed" ? "bg-red-500 border-red-500" :
    "bg-white border-slate-300";

  return (
    <div className="py-2">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`w-4 h-4 rounded-full border-2 ${color(step.state)}`} />
            {i < steps.length - 1 && <span className={`w-0.5 flex-1 min-h-[22px] ${step.state === "done" ? "bg-green-400" : "bg-slate-200"}`} />}
          </div>
          <div className={`pb-3 text-sm ${step.state === "pending" ? "text-slate-400" : "text-secondary font-medium"}`}>
            {step.label}
            {step.state === "current" && <span className="ml-2 text-xs text-primary">in progress</span>}
            {step.state === "failed" && status === "payment_failed" && <span className="ml-2 text-xs text-red-500">action needed</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <dt className="text-CadetBlue">{k}</dt>
      <dd className="font-semibold text-secondary">{v}</dd>
    </div>
  );
}
function StatusPill({ status, label }: { status: string; label: string }) {
  const color = status === "paid" || status?.startsWith("winner") || status === "top_20"
    ? "bg-green-100 text-green-700"
    : status === "payment_failed" || status === "rejected"
    ? "bg-red-100 text-red-700"
    : status === "shortlisted"
    ? "bg-secondary/10 text-secondary"
    : "bg-amber-100 text-amber-800";
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>{label || status}</span>;
}
