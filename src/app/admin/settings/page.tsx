"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, Toast } from "@/components/Admin/ui";
import { apiGet, apiPost } from "@/lib/api";

const BOOLEAN_KEYS = ["application_open", "post_event_mode", "mail_enabled"];
const GROUP_LABELS: Record<string, string> = {
  event: "Event details", payment: "Payment & fees", application: "Application window",
  prizes: "Prizes", contact: "Contact & WhatsApp", general: "General", legal: "Legal",
  mpesa: "M-Pesa (Daraja)", mail: "Email (SMTP)",
};
const SELECT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  mpesa_env: [
    { value: "sandbox", label: "Sandbox (testing)" },
    { value: "production", label: "Production (live)" },
  ],
  mpesa_transaction_type: [
    { value: "CustomerPayBillOnline", label: "Paybill (CustomerPayBillOnline)" },
    { value: "CustomerBuyGoodsOnline", label: "Till / Buy Goods (CustomerBuyGoodsOnline)" },
  ],
  mail_encryption: [
    { value: "ssl", label: "SSL / TLS — port 465 (recommended)" },
    { value: "tls", label: "STARTTLS — port 587" },
  ],
  payment_mode: [
    { value: "stk", label: "M-Pesa STK push (needs Daraja API)" },
    { value: "manual", label: "Manual Paybill (applicant pastes code)" },
    { value: "free", label: "Free entry (no payment)" },
  ],
};
const FIELD_HINTS: Record<string, string> = {
  mpesa_consumer_key: "From your Daraja app.",
  mpesa_consumer_secret: "Encrypted at rest. Leave blank to keep the current value.",
  mpesa_passkey: "Lipa na M-Pesa Online passkey. Encrypted; leave blank to keep.",
  mpesa_shortcode: "Paybill → your Paybill number. Buy Goods → your STORE / Head-Office number (not the till).",
  mpesa_till_number: "Buy Goods ONLY → your Till number. Leave blank for Paybill.",
  mpesa_callback_url: "Public HTTPS URL ending in /api/payments/callback.",
  mpesa_account_ref: "Account reference shown on the STK prompt.",
  mail_enabled: "Turn on to send applicants a confirmation email when they provide one.",
  mail_host: "Outgoing (SMTP) server, e.g. rs2.hpcnoc.com.",
  mail_port: "465 for SSL/TLS (recommended), or 587 for STARTTLS.",
  mail_username: "The full mailbox address, e.g. info@bigsamproduction.co.ke.",
  mail_password: "The mailbox password. Encrypted at rest; leave blank to keep the current value.",
  mail_from_address: "Address emails are sent from (usually the same as the username).",
  mail_from_name: "Sender name applicants see, e.g. Big-Sam Production.",
  payment_mode: "STK sends a prompt to the phone (needs Daraja). Manual shows your Paybill and lets applicants paste their M-Pesa code for you to confirm. Free entry accepts applications with no payment at all.",
  paybill_number: "The Paybill number applicants pay to. For a bank, use the bank's Paybill (e.g. Equity 247247, KCB 522522).",
  paybill_account: "The account number applicants enter. For a bank Paybill, your bank account number (fixed for everyone). Leave blank to use each applicant's reference instead.",
  paybill_business_name: "Name applicants see when paying (e.g. your business or account name).",
};

export default function AdminSettings() {
  return (
    <AdminShell>
      {(user) =>
        user.role !== "admin" ? (
          <Card className="p-8 text-center text-slate-500">Settings are restricted to administrators.</Card>
        ) : (
          <SettingsBody />
        )
      }
    </AdminShell>
  );
}

function SettingsBody() {
  const [tab, setTab] = useState<"settings" | "users">("settings");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex gap-2">
        <button onClick={() => setTab("settings")} className={`px-4 py-2 rounded-lg text-sm ${tab === "settings" ? "bg-primary text-white" : "bg-white border"}`}>Site settings</button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-lg text-sm ${tab === "users" ? "bg-primary text-white" : "bg-white border"}`}>Admin users</button>
      </div>
      {tab === "settings" ? <SettingsForm notify={setToast} /> : <Users notify={setToast} />}
    </div>
  );
}

function SettingsForm({ notify }: { notify: (t: any) => void }) {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [values, setValues] = useState<Record<string, any>>({});
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    apiGet("/api/admin/settings", true).then((r) => {
      if (r.ok) {
        setGrouped(r.data.grouped);
        const v: Record<string, any> = {};
        Object.values(r.data.grouped).forEach((rows: any) => rows.forEach((row: any) => {
          v[row.key] = BOOLEAN_KEYS.includes(row.key) ? ["1", "true", "yes", "on"].includes(row.value) : row.value;
        }));
        setValues(v);
      }
    });
  }, []);

  async function save() {
    const payload: Record<string, any> = {};
    Object.entries(values).forEach(([k, v]) => { payload[k] = BOOLEAN_KEYS.includes(k) ? (v ? 1 : 0) : v; });
    const res = await apiPost("/api/admin/settings", payload, true);
    notify({ msg: res.ok ? "Settings saved." : (res.message || "Failed."), type: res.ok ? "success" : "error" });
  }

  async function sendTest() {
    if (!testTo.trim()) { notify({ msg: "Enter an address to send the test to.", type: "error" }); return; }
    setTesting(true);
    const res = await apiPost("/api/admin/settings/test-email", { to: testTo.trim() }, true);
    setTesting(false);
    notify({ msg: res.message || (res.ok ? "Test email sent." : "Failed."), type: res.ok ? "success" : "error" });
  }

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([group, rows]) => (
          <Card key={group} className="p-5">
            <div className="font-semibold text-secondary mb-3">{GROUP_LABELS[group] || group}</div>
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.key}>
                  <label className="block text-sm font-medium text-slate-600 capitalize mb-1">
                    {row.key.replace(/^(mpesa|mail)_/, "").replace(/_/g, " ")}
                    {row.secret && row.is_set && <span className="ml-2 text-xs text-green-600 font-normal">set ✓</span>}
                  </label>
                  {BOOLEAN_KEYS.includes(row.key) ? (
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!values[row.key]} onChange={(e) => setValues({ ...values, [row.key]: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-checked:bg-primary rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition peer-checked:after:translate-x-5" />
                    </label>
                  ) : SELECT_OPTIONS[row.key] ? (
                    <select value={values[row.key] ?? ""} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                      {SELECT_OPTIONS[row.key].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : row.secret ? (
                    <input type="password" autoComplete="new-password" value={values[row.key] ?? ""} placeholder={row.is_set ? "•••••••• (leave blank to keep)" : "Not set"} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  ) : row.key === "privacy_notice" ? (
                    <textarea value={values[row.key] ?? ""} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  ) : (
                    <input value={values[row.key] ?? ""} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  )}
                  {FIELD_HINTS[row.key] && <p className="text-xs text-slate-400 mt-1">{FIELD_HINTS[row.key]}</p>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="font-semibold text-secondary mb-1">Send a test email</div>
        <p className="text-xs text-slate-400 mb-3">
          Save your Email (SMTP) settings and switch them on first, then send a test to confirm delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="you@example.com"
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={sendTest}
            disabled={testing}
            className="border border-primary text-primary px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap disabled:opacity-50"
          >
            {testing ? "Sending…" : "Send test"}
          </button>
        </div>
      </Card>

      <button onClick={save} className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold">Save all settings</button>
    </div>
  );
}

function Users({ notify }: { notify: (t: any) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const load = () => apiGet("/api/admin/users", true).then((r) => r.ok && setUsers(r.data.users));
  useEffect(() => { load(); }, []);

  async function save(u: any) {
    const res = await apiPost("/api/admin/users", u, true);
    notify({ msg: res.ok ? "User saved." : (res.message || "Failed."), type: res.ok ? "success" : "error" });
    if (res.ok) load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-5 space-y-3">
        <div className="font-semibold text-secondary">Admin users</div>
        {users.map((u) => <UserRow key={u.id} user={u} onSave={save} />)}
      </Card>
      <Card className="p-5">
        <div className="font-semibold text-secondary mb-3">Add admin user</div>
        <NewUser onSave={save} />
      </Card>
    </div>
  );
}

function UserRow({ user, onSave }: { user: any; onSave: (u: any) => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(!!user.is_active);
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full sm:w-1/2 border rounded px-2 py-1.5 text-sm" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full sm:w-1/2 border rounded px-2 py-1.5 text-sm" />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded px-2 py-1.5 text-sm"><option value="reviewer">reviewer</option><option value="admin">admin</option></select>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="New password" className="flex-1 min-w-[10rem] border rounded px-2 py-1.5 text-sm" />
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        <button onClick={() => onSave({ id: user.id, name, email, role, password, is_active: active ? 1 : 0 })} className="text-primary text-sm font-semibold ml-auto">Save</button>
      </div>
    </div>
  );
}

function NewUser({ onSave }: { onSave: (u: any) => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [role, setRole] = useState("reviewer"); const [password, setPassword] = useState("");
  return (
    <div className="space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm"><option value="reviewer">reviewer</option><option value="admin">admin</option></select>
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password (min 8)" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <button onClick={() => onSave({ name, email, role, password, is_active: 1 })} className="w-full bg-primary text-white rounded-lg py-2 text-sm font-semibold">Create user</button>
    </div>
  );
}
