"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/Admin/AdminShell";
import { Card, Toast } from "@/components/Admin/ui";
import { apiGet, apiPost } from "@/lib/api";
import MediaLibrary from "@/components/Admin/MediaLibrary";
import Branding from "@/components/Admin/Branding";
import SiteImages from "@/components/Admin/SiteImages";
import Moments from "@/components/Admin/Moments";

type Tab = "blocks" | "images" | "moments" | "faqs" | "media" | "branding";

export default function AdminContent() {
  return <AdminShell>{() => <ContentBody />}</AdminShell>;
}

function ContentBody() {
  const [tab, setTab] = useState<Tab>("blocks");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const tabs: { id: Tab; label: string }[] = [
    { id: "blocks", label: "Page content" },
    { id: "images", label: "Site Images" },
    { id: "moments", label: "Moments (TikTok)" },
    { id: "faqs", label: "FAQs" },
    { id: "media", label: "Media library" },
    { id: "branding", label: "Logo & Branding" },
  ];
  return (
    <div className="space-y-4">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {/* Tabs scroll sideways on a phone instead of wrapping into a tall stack. */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.id ? "bg-primary text-white" : "bg-white border"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      {tab === "blocks" && <Blocks notify={setToast} />}
      {tab === "images" && <SiteImages notify={setToast} />}
      {tab === "moments" && <Moments notify={setToast} />}
      {tab === "faqs" && <Faqs notify={setToast} />}
      {tab === "media" && <Card className="p-5"><MediaLibrary notify={setToast} /></Card>}
      {tab === "branding" && <Branding notify={setToast} />}
    </div>
  );
}

function Blocks({ notify }: { notify: (t: any) => void }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const load = () => apiGet("/api/admin/content", true).then((r) => r.ok && setBlocks(r.data.blocks));
  useEffect(() => { load(); }, []);

  async function save(b: any, values: any) {
    const res = await apiPost("/api/admin/content", {
      key: b.key, title: values.title, body: values.body,
      data: values.data, is_published: values.is_published ? 1 : 0,
    }, true);
    notify({ msg: res.ok ? `Saved "${b.key}".` : (res.message || "Invalid JSON."), type: res.ok ? "success" : "error" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">These blocks power the public site. The <strong>data</strong> field is JSON — it drives lists (prize podium, steps, sponsor tiers). Edit carefully.</p>
      {blocks.map((b) => <BlockEditor key={b.key} block={b} onSave={save} />)}
    </div>
  );
}

function BlockEditor({ block, onSave }: { block: any; onSave: (b: any, v: any) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(block.title || "");
  const [body, setBody] = useState(block.body || "");
  const [data, setData] = useState(block.data ? JSON.stringify(block.data, null, 2) : "");
  const [published, setPublished] = useState(!!block.is_published);

  return (
    <Card className="overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-5 py-3 text-left">
        <span className="font-semibold text-secondary">{block.title || block.key} <span className="text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">{block.key}</span></span>
        <span className="text-primary">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t pt-4">
          <div><label className="text-sm font-semibold text-secondary">Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" /></div>
          <div><label className="text-sm font-semibold text-secondary">Body</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 mt-1" /></div>
          <div><label className="text-sm font-semibold text-secondary">Structured data (JSON)</label><textarea value={data} onChange={(e) => setData(e.target.value)} rows={8} className="w-full border rounded-lg px-3 py-2 mt-1 font-mono text-xs" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label>
          <button onClick={() => onSave(block, { title, body, data, is_published: published })} className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold">Save block</button>
        </div>
      )}
    </Card>
  );
}

function Faqs({ notify }: { notify: (t: any) => void }) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const load = () => apiGet("/api/admin/faqs", true).then((r) => r.ok && setFaqs(r.data.faqs));
  useEffect(() => { load(); }, []);

  async function save(f: any) {
    const res = await apiPost("/api/admin/faqs", f, true);
    notify({ msg: res.ok ? "FAQ saved." : (res.message || "Failed."), type: res.ok ? "success" : "error" });
    if (res.ok) load();
  }
  async function del(id: number) {
    if (!confirm("Delete this FAQ?")) return;
    await apiPost(`/api/admin/faqs/${id}/delete`, {}, true);
    load();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="p-5 space-y-3">
        <div className="font-semibold text-secondary">Existing FAQs</div>
        {faqs.map((f) => <FaqRow key={f.id} faq={f} onSave={save} onDelete={del} />)}
        {faqs.length === 0 && <div className="text-slate-400 text-sm">No FAQs.</div>}
      </Card>
      <Card className="p-5">
        <div className="font-semibold text-secondary mb-3">Add FAQ</div>
        <NewFaq onSave={save} />
      </Card>
    </div>
  );
}

function FaqRow({ faq, onSave, onDelete }: { faq: any; onSave: (f: any) => void; onDelete: (id: number) => void }) {
  const [q, setQ] = useState(faq.question);
  const [a, setA] = useState(faq.answer);
  const [active, setActive] = useState(!!faq.is_active);
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm font-medium" />
      <textarea value={a} onChange={(e) => setA(e.target.value)} rows={2} className="w-full border rounded px-2 py-1.5 text-sm" />
      <div className="flex justify-between items-center">
        <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active</label>
        <div className="flex gap-2">
          <button onClick={() => onSave({ id: faq.id, question: q, answer: a, sort_order: faq.sort_order, is_active: active ? 1 : 0 })} className="text-primary text-sm font-semibold">Save</button>
          <button onClick={() => onDelete(faq.id)} className="text-red-500 text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

function NewFaq({ onSave }: { onSave: (f: any) => void }) {
  const [q, setQ] = useState(""); const [a, setA] = useState("");
  return (
    <div className="space-y-2">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Question" className="w-full border rounded-lg px-3 py-2 text-sm" />
      <textarea value={a} onChange={(e) => setA(e.target.value)} placeholder="Answer" rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <button onClick={() => { onSave({ question: q, answer: a, is_active: 1 }); setQ(""); setA(""); }} className="w-full bg-primary text-white rounded-lg py-2 text-sm font-semibold">Add FAQ</button>
    </div>
  );
}
