"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, StatCard, StatusBadge, money } from "@/components/Admin/ui";
import { apiGet } from "@/lib/api";

export default function AdminDashboard() {
  return <AdminShell>{() => <DashboardBody />}</AdminShell>;
}

function DashboardBody() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    apiGet("/api/admin/dashboard", true).then((r) => r.ok && setD(r.data));
  }, []);

  if (!d) return <div className="text-slate-400">Loading dashboard…</div>;

  const cur = d.fee_currency || "KSh";
  const recon = d.reconciliation || {};
  const capPct = d.capacity?.cap > 0 ? Math.min(100, Math.round((d.capacity.count / d.capacity.cap) * 100)) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total applications" value={d.totals?.applicants ?? 0} sub={`${d.totals?.paid ?? 0} paid`} />
        <StatCard label="Fees collected" value={money(recon.collected, cur)} sub={`${recon.paid?.count ?? 0} payments`} />
        <StatCard label="Pending" value={recon.pending?.count ?? 0} sub={`${recon.failed?.count ?? 0} failed`} />
        <StatCard label="New sponsor inquiries" value={d.totals?.new_inquiries ?? 0} sub={<Link href="/admin/sponsors" className="text-primary">Review →</Link>} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="px-5 py-3 border-b font-semibold text-secondary flex justify-between">
            <span>Recent applications</span>
            <Link href="/admin/applications" className="text-sm text-primary">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400 uppercase text-xs">
                <tr><th className="px-5 py-2">Ref</th><th className="px-5 py-2">Name</th><th className="px-5 py-2">County</th><th className="px-5 py-2">Status</th></tr>
              </thead>
              <tbody>
                {(d.recent || []).map((r: any) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-5 py-2">
                      <Link href={`/admin/applications?id=${r.id}`} className="text-primary font-medium">{r.reference}</Link>
                    </td>
                    <td className="px-5 py-2">{r.full_name}</td>
                    <td className="px-5 py-2 text-slate-500">{r.county || "—"}</td>
                    <td className="px-5 py-2"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {(!d.recent || d.recent.length === 0) && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No applications yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="font-semibold text-secondary mb-3">Capacity</div>
            {d.capacity?.cap > 0 ? (
              <>
                <div className="flex justify-between text-sm mb-1">
                  <span>{d.capacity.count} / {d.capacity.cap} paid</span><span>{capPct}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${capPct}%` }} />
                </div>
              </>
            ) : <div className="text-sm text-slate-400">No cap set.</div>}
            <div className="mt-4 text-sm text-slate-500">Deadline</div>
            <div className="font-semibold text-secondary">{d.capacity?.deadline || "—"}</div>
          </Card>

          <Card className="p-5">
            <div className="font-semibold text-secondary mb-3">By status</div>
            <div className="space-y-2">
              {Object.entries(d.status_counts || {}).map(([s, c]) => (
                <div key={s} className="flex justify-between items-center">
                  <StatusBadge status={s} /><span className="font-semibold">{c as number}</span>
                </div>
              ))}
              {Object.keys(d.status_counts || {}).length === 0 && <div className="text-sm text-slate-400">No data.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
