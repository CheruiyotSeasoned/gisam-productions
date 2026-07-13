"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, StatusBadge, Toast } from "@/components/Admin/ui";
import { apiGet, apiPost, apiPostForm } from "@/lib/api";

export default function AdminSponsors() {
  return <AdminShell>{() => <SponsorsBody />}</AdminShell>;
}

function SponsorsBody() {
  const [d, setD] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const load = () => apiGet("/api/admin/sponsors", true).then((r) => r.ok && setD(r.data));
  useEffect(() => { load(); }, []);

  async function setInquiryStatus(id: number, status: string) {
    const res = await apiPost(`/api/admin/sponsors/inquiries/${id}/status`, { status }, true);
    if (res.ok) load();
    else setToast({ msg: res.message || "Failed.", type: "error" });
  }

  async function addLogo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await apiPostForm("/api/admin/sponsors/logos", form, true);
    setToast({ msg: res.ok ? "Logo added." : (res.message || "Failed."), type: res.ok ? "success" : "error" });
    if (res.ok) { (e.target as HTMLFormElement).reset(); load(); }
  }

  async function delLogo(id: number) {
    if (!confirm("Remove this logo?")) return;
    await apiPost(`/api/admin/sponsors/logos/${id}/delete`, {}, true);
    load();
  }

  const inquiries = d?.inquiries || [];
  const logos = d?.logos || [];
  const statuses = ["new", "contacted", "confirmed", "declined"];

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="text-xl font-bold text-secondary">Sponsors</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-5 py-3 border-b font-semibold text-secondary">Inquiries</div>
          <div className="divide-y">
            {inquiries.map((q: any) => (
              <div key={q.id} className="p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-secondary">{q.company}</div>
                  <div className="text-sm text-slate-500 break-words">{q.contact_person} · {q.phone}{q.email ? ` · ${q.email}` : ""}</div>
                  {q.tier && <div className="text-xs text-primary mt-0.5">Tier: {q.tier}</div>}
                  {q.message && <div className="text-sm text-slate-400 mt-1">{q.message}</div>}
                </div>
                <select value={q.status} onChange={(e) => setInquiryStatus(q.id, e.target.value)} className="border rounded-lg px-2 py-1 text-sm h-9 w-full sm:w-auto shrink-0">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            {inquiries.length === 0 && <div className="p-8 text-center text-slate-400">No inquiries yet.</div>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="font-semibold text-secondary mb-3">Add sponsor logo</div>
            <form onSubmit={addLogo} className="space-y-2">
              <input name="name" placeholder="Sponsor name" required className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input name="website" placeholder="Website (optional)" className="w-full border rounded-lg px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <input name="tier" placeholder="Tier" className="w-2/3 border rounded-lg px-3 py-2 text-sm" />
                <input name="sort_order" type="number" defaultValue={0} className="w-1/3 border rounded-lg px-3 py-2 text-sm" />
              </div>
              <input name="logo" type="file" accept="image/*" required className="w-full text-sm" />
              <button className="w-full bg-primary text-white rounded-lg py-2 text-sm font-semibold">Upload logo</button>
            </form>
          </Card>

          <Card className="p-5">
            <div className="font-semibold text-secondary mb-3">Current logos</div>
            <div className="grid grid-cols-2 gap-3">
              {logos.map((l: any) => (
                <div key={l.id} className="border rounded-lg p-2 text-center relative">
                  <img src={l.logo_url} alt={l.name} className="h-10 mx-auto object-contain" />
                  <div className="text-xs truncate mt-1">{l.name}</div>
                  <button onClick={() => delLogo(l.id)} className="absolute top-1 right-1 text-red-500 text-xs">✕</button>
                </div>
              ))}
              {logos.length === 0 && <div className="text-sm text-slate-400 col-span-2">No logos yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
