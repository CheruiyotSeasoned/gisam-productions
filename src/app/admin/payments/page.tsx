"use client";

import { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, StatCard, StatusBadge, money, Toast } from "@/components/Admin/ui";
import { apiGet, apiPost, downloadWithAuth } from "@/lib/api";
import type { AdminUser } from "@/lib/adminAuth";
import Icon from "@/components/Icon";

export default function PaymentsPage() {
  return <AdminShell>{(user) => <PaymentsBody user={user} />}</AdminShell>;
}

function PaymentsBody({ user }: { user: AdminUser }) {
  const [d, setD] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState("");

  const load = useCallback(() => {
    const qs = new URLSearchParams({ status, page: String(page) }).toString();
    apiGet(`/api/admin/payments?${qs}`, true).then((r) => r.ok && setD(r.data));
  }, [status, page]);
  useEffect(() => { load(); }, [load]);

  async function confirmPayment() {
    if (confirmId == null) return;
    const res = await apiPost(`/api/admin/payments/${confirmId}/confirm`, { receipt }, true);
    setConfirmId(null); setReceipt("");
    setToast({ msg: res.ok ? "Payment confirmed." : (res.message || "Failed."), type: res.ok ? "success" : "error" });
    if (res.ok) load();
  }
  async function query(id: number) {
    const res = await apiPost(`/api/admin/payments/${id}/query`, {}, true);
    setToast({ msg: res.message || (res.ok ? "Updated." : "Query failed."), type: res.ok ? "success" : "error" });
    if (res.ok) load();
  }

  const recon = d?.reconciliation || {};
  const rows = d?.rows || [];

  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-secondary">Payments & Reconciliation</h2>
        <button onClick={() => downloadWithAuth("/api/admin/payments/export", "payments.csv")} className="text-sm border border-green-600 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 inline-flex items-center gap-1.5"><Icon name="download" size={16} /> Export CSV</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collected" value={money(recon.collected)} sub={`${recon.paid?.count ?? 0} paid`} />
        <StatCard label="Pending" value={recon.pending?.count ?? 0} sub={money(recon.pending?.total)} />
        <StatCard label="Failed" value={recon.failed?.count ?? 0} />
        <StatCard label="Cancelled" value={recon.cancelled?.count ?? 0} />
      </div>

      {/* Status filter — scrolls sideways on a phone rather than wrapping. */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        <div className="flex gap-2 w-max md:w-auto">
          {["", "paid", "pending", "failed", "cancelled"].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${status === s ? "bg-primary text-white" : "bg-white border"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <Card className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400 uppercase text-xs border-b">
              <tr><th className="px-4 py-3">Ref</th><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium">{p.reference}</td>
                  <td className="px-4 py-2.5">{p.full_name}</td>
                  <td className="px-4 py-2.5">{money(p.amount)}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.method}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-2.5 text-slate-500">{p.mpesa_receipt_number || "—"}</td>
                  <td className="px-4 py-2.5">
                    {p.status !== "paid" && (
                      <div className="flex gap-2">
                        {user.role === "admin" && <button onClick={() => setConfirmId(p.id)} className="text-green-600 text-xs font-semibold">Confirm</button>}
                        {p.checkout_request_id && <button onClick={() => query(p.id)} className="text-slate-500 text-xs">Query</button>}
                      </div>
                    )}
                    {p.status === "paid" && <Icon name="check" size={16} className="text-green-600" />}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No payments.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-2">
        {rows.map((p: any) => (
          <Card key={p.id} className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-secondary truncate">{p.full_name}</div>
                <div className="text-xs text-slate-400">{p.reference}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 text-sm">
              <span className="font-semibold text-secondary">{money(p.amount)}</span>
              <span className="text-xs text-slate-500 truncate">
                {p.method}{p.mpesa_receipt_number ? ` · ${p.mpesa_receipt_number}` : ""}
              </span>
            </div>
            {p.status !== "paid" && (
              <div className="flex gap-2 mt-3">
                {user.role === "admin" && (
                  <button onClick={() => setConfirmId(p.id)} className="flex-1 border border-green-600 text-green-700 rounded-lg py-1.5 text-xs font-semibold">
                    Confirm paid
                  </button>
                )}
                {p.checkout_request_id && (
                  <button onClick={() => query(p.id)} className="flex-1 border rounded-lg py-1.5 text-xs text-slate-600">
                    Query M-Pesa
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-8 text-center text-slate-400 text-sm">No payments.</Card>}
      </div>

      {d?.pages > 1 && (
        <div className="flex gap-2 items-center text-sm justify-between sm:justify-end">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Prev</button>
          <span>Page {page} / {d.pages}</span>
          <button disabled={page >= d.pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}

      {confirmId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmId(null)}>
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-secondary mb-2">Manually confirm payment</h3>
            <p className="text-sm text-slate-500 mb-3">Enter the M-Pesa receipt (optional) for a Paybill/manual payment.</p>
            <input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="e.g. SFE7X2Q9KL" className="w-full border rounded-lg px-3 py-2 mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={confirmPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold">Confirm paid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
