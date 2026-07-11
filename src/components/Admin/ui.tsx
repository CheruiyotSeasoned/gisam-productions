"use client";

export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    pending_payment: "Pending payment", paid: "Paid", payment_failed: "Payment failed",
    shortlisted: "Shortlisted", rejected: "Rejected", top_20: "Top 20",
    winner_1: "Winner 1st", winner_2: "Winner 2nd", winner_3: "Winner 3rd",
    new: "New", contacted: "Contacted", confirmed: "Confirmed", declined: "Declined",
    pending: "Pending", failed: "Failed", cancelled: "Cancelled",
  };
  return map[s] || s?.replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    ["paid", "confirmed", "top_20"].includes(status) ? "bg-green-100 text-green-700" :
    ["pending_payment", "pending", "new"].includes(status) ? "bg-yellow-100 text-yellow-800" :
    ["payment_failed", "failed", "rejected", "declined", "cancelled"].includes(status) ? "bg-red-100 text-red-700" :
    ["shortlisted", "contacted"].includes(status) ? "bg-blue-100 text-blue-700" :
    ["winner_1", "winner_2", "winner_3"].includes(status) ? "bg-purple-100 text-purple-700" :
    "bg-slate-100 text-slate-600";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{statusLabel(status)}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-extrabold text-secondary mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  );
}

export function money(v: any, currency = "KSh") {
  return `${currency} ${Number(v || 0).toLocaleString()}`;
}

export function Toast({ msg, type = "success", onClose }: { msg: string; type?: "success" | "error"; onClose: () => void }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {msg}
      <button onClick={onClose} className="ml-3 opacity-80">✕</button>
    </div>
  );
}
