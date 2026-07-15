"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, StatusBadge, statusLabel, money, Toast } from "@/components/Admin/ui";
import { apiGet, apiPost, downloadWithAuth, authFileUrl, getToken } from "@/lib/api";
import Icon from "@/components/Icon";

export default function ApplicationsPage() {
  return (
    <AdminShell>
      {() => (
        <Suspense fallback={<div className="text-slate-400">Loading…</div>}>
          <ApplicationsBody />
        </Suspense>
      )}
    </AdminShell>
  );
}

function ApplicationsBody() {
  const router = useRouter();
  const params = useSearchParams();
  const detailId = params.get("id");

  const [list, setList] = useState<any>(null);
  const [filters, setFilters] = useState<any>({ statuses: [], counties: [], genres: [] });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [county, setCounty] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkMsg, setBulkMsg] = useState("");
  const [channel, setChannel] = useState<"sms" | "email" | "both">("sms");
  const [bulkSubject, setBulkSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ q, status, county, genre, page: String(page), per_page: "20" }).toString();
    apiGet(`/api/admin/applications?${qs}`, true).then((r) => r.ok && setList(r.data));
  }, [q, status, county, genre, page]);

  useEffect(() => {
    apiGet("/api/admin/applications/filters", true).then((r) => r.ok && setFilters(r.data));
  }, []);
  useEffect(() => { load(); }, [load]);

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function sendBulk() {
    if (!selected.length || !bulkMsg.trim()) { setToast({ msg: "Select rows and type a message.", type: "error" }); return; }
    setSending(true);
    const res = await apiPost("/api/admin/applications/bulk-notify", {
      ids: selected, message: bulkMsg, channel, subject: bulkSubject,
    }, true);
    setSending(false);
    if (res.ok) { setToast({ msg: res.message || "Sent.", type: "success" }); setSelected([]); setBulkMsg(""); setBulkSubject(""); }
    else setToast({ msg: res.message || "Failed.", type: "error" });
  }

  function exportCsv() {
    const qs = new URLSearchParams({ q, status, county, genre }).toString();
    downloadWithAuth(`/api/admin/applications/export?${qs}`, "applications.csv");
  }

  const rows = list?.rows || [];

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-secondary">Applications <span className="text-slate-400 text-base font-normal">({list?.total ?? 0})</span></h2>
        <button onClick={exportCsv} className="text-sm border border-green-600 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 inline-flex items-center gap-1.5"><Icon name="download" size={16} /> Export CSV</button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name/phone/ref" className="border rounded-lg px-3 py-2 text-sm" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {filters.statuses?.map((s: string) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          <select value={county} onChange={(e) => { setCounty(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All counties</option>
            {filters.counties?.map((c: string) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All genres</option>
            {filters.genres?.map((g: string) => <option key={g} value={g}>{g}</option>)}
          </select>
          <button onClick={() => { setPage(1); load(); }} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold">Filter</button>
        </div>
      </Card>

      {/* Table — desktop */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? rows.map((r: any) => r.id) : [])} /></th>
                <th className="px-4 py-3">Ref</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">County</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2.5"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td className="px-4 py-2.5 font-medium text-primary cursor-pointer" onClick={() => router.push(`/admin/applications?id=${r.id}`)}>{r.reference}</td>
                  <td className="px-4 py-2.5">{r.full_name}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.phone}</td>
                  <td className="px-4 py-2.5 text-slate-500">{r.county || "—"}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5"><button onClick={() => router.push(`/admin/applications?id=${r.id}`)} className="text-primary text-xs">View</button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No applications match.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cards — mobile. A 7-column table can't be read on a phone, so each
          applicant becomes a tappable card with the same fields stacked. */}
      <div className="md:hidden space-y-2">
        {rows.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-slate-500 px-1">
            <input
              type="checkbox"
              checked={selected.length === rows.length}
              onChange={(e) => setSelected(e.target.checked ? rows.map((r: any) => r.id) : [])}
            />
            Select all on this page
          </label>
        )}
        {rows.map((r: any) => (
          <Card key={r.id} className="p-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={() => toggle(r.id)}
                className="mt-1 shrink-0"
                aria-label={`Select ${r.full_name}`}
              />
              <button
                onClick={() => router.push(`/admin/applications?id=${r.id}`)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-secondary truncate">{r.full_name}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-xs text-primary font-medium mt-0.5">{r.reference}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {r.phone}{r.county ? ` · ${r.county}` : ""}
                </div>
              </button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="p-8 text-center text-slate-400 text-sm">No applications match.</Card>
        )}
      </div>

      {/* Bulk messaging */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="font-semibold text-secondary text-sm">
            Message {selected.length} selected {selected.length === 1 ? "applicant" : "applicants"}
          </div>
          <div className="inline-flex rounded-lg border overflow-hidden text-sm">
            {(["sms", "email", "both"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`px-3 py-1.5 capitalize ${channel === c ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {c === "sms" ? "SMS" : c === "email" ? "Email" : "SMS + Email"}
              </button>
            ))}
          </div>
        </div>
        {channel !== "sms" && (
          <input
            value={bulkSubject}
            onChange={(e) => setBulkSubject(e.target.value)}
            placeholder="Email subject (optional)"
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        )}
        <textarea
          value={bulkMsg}
          onChange={(e) => setBulkMsg(e.target.value)}
          rows={3}
          placeholder={channel === "email" ? "Email message…" : channel === "both" ? "Message (sent as SMS and email)…" : "SMS message…"}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-slate-400">
            {channel === "sms"
              ? "Sent by SMS to every selected applicant."
              : channel === "email"
                ? "Sent by email — applicants without an email on file are skipped."
                : "SMS to all; email to those with an email on file."}
          </p>
          <button
            onClick={sendBulk}
            disabled={sending || !selected.length}
            className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-semibold whitespace-nowrap disabled:opacity-50"
          >
            {sending ? "Sending…" : channel === "sms" ? "Send SMS" : channel === "email" ? "Send Email" : "Send SMS + Email"}
          </button>
        </div>
      </Card>

      {/* Pagination */}
      {list?.pages > 1 && (
        <div className="flex gap-2 items-center justify-between sm:justify-end text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Prev</button>
          <span>Page {page} / {list.pages}</span>
          <button disabled={page >= list.pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}

      {detailId && <DetailDrawer id={detailId} onClose={() => router.push("/admin/applications")} onSaved={() => { load(); setToast({ msg: "Application updated.", type: "success" }); }} />}
    </div>
  );
}

function DetailDrawer({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet(`/api/admin/applications/${id}`, true).then((r) => {
      if (r.ok) { setD(r.data); setStatus(r.data.applicant.status); setNotes(r.data.applicant.admin_notes || ""); }
    });
  }, [id]);

  async function save() {
    setSaving(true);
    await apiPost(`/api/admin/applications/${id}/status`, { status, admin_notes: notes }, true);
    setSaving(false);
    onSaved();
    onClose();
  }

  const a = d?.applicant;
  const clipToken = getToken();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-secondary">Application detail</h3>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 px-2">×</button>
        </div>
        {!a ? <div className="text-slate-400">Loading…</div> : (
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0"><div className="font-bold text-secondary text-lg truncate">{a.full_name}</div><div className="text-sm text-slate-400">{a.reference}</div></div>
              <StatusBadge status={a.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info k="Phone" v={a.phone} /><Info k="National ID" v={a.national_id || "—"} />
              <Info k="Email" v={a.email || "—"} /><Info k="County" v={a.county || "—"} />
              <Info k="Age / Gender" v={`${a.age || "—"} / ${a.gender || "—"}`} />
              <Info k="Vocal style" v={a.vocal_style || "—"} /><Info k="Fee" v={money(a.fee_amount)} />
            </div>

            {/* Clip */}
            <div>
              <div className="text-sm font-semibold text-secondary mb-1">Audition clip</div>
              {a.clip_type === "upload" && d.clip_url ? (
                a.clip_file?.endsWith(".mp4")
                  ? <video controls className="w-full rounded" src={`${d.clip_url}${clipToken ? "" : ""}`} />
                  : <audio controls className="w-full" src={d.clip_url} />
              ) : a.clip_url ? (
                <a href={a.clip_url} target="_blank" className="text-primary text-sm break-all inline-flex items-center gap-1">{a.clip_url} <Icon name="external-link" size={14} /></a>
              ) : <div className="text-slate-400 text-sm">No clip.</div>}
              {a.clip_type === "upload" && <p className="text-xs text-slate-400 mt-1">Note: streamed clips require the admin token; open the link if playback is blocked.</p>}
            </div>

            {/* Payments */}
            <div>
              <div className="text-sm font-semibold text-secondary mb-1">Payments</div>
              <div className="space-y-1">
                {(d.payments || []).map((p: any) => (
                  <div key={p.id} className="flex justify-between text-sm border-b py-1">
                    <StatusBadge status={p.status} /><span>{money(p.amount)}</span><span className="text-slate-400">{p.mpesa_receipt_number || "—"}</span>
                  </div>
                ))}
                {(!d.payments || d.payments.length === 0) && <div className="text-slate-400 text-sm">No payments.</div>}
              </div>
            </div>

            {/* Shortlist */}
            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-secondary mb-1">Set status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-3">
                {(d.statuses || []).map((s: string) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <label className="block text-sm font-semibold text-secondary mb-1">Admin notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 mb-3" />
              <button onClick={save} disabled={saving} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: any }) {
  return <div className="min-w-0"><div className="text-xs text-slate-400">{k}</div><div className="font-medium text-secondary break-words">{v}</div></div>;
}
