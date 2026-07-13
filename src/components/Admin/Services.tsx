"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "./ui";
import Icon from "@/components/Icon";
import { serviceIcon } from "@/components/BigSam/Sections";
import type { ServiceItem, PackageGroup, PackageItem } from "@/lib/types";

/**
 * Admin manager for the production business: the service list (homepage teaser +
 * /services) and the package pricing on /services. Writes two content blocks —
 * `services` and `packages` — so prices change without a redeploy.
 */

const ICON_CHOICES = [
  "camera", "video", "film", "drone", "radio", "headphones",
  "volume", "heart", "image", "cast", "megaphone", "baby", "mic", "music", "users", "star",
];

export default function Services({ notify }: { notify: (t: { msg: string; type: "success" | "error" }) => void }) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // `services` block
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [items, setItems] = useState<ServiceItem[]>([]);

  // `packages` block
  const [groups, setGroups] = useState<PackageGroup[]>([]);
  const [terms, setTerms] = useState("");

  useEffect(() => {
    apiGet("/api/admin/content", true).then((r) => {
      if (!r.ok) return;
      const blocks = r.data.blocks || [];
      const s = blocks.find((b: any) => b.key === "services");
      const p = blocks.find((b: any) => b.key === "packages");
      if (s) {
        setTitle(s.title || "");
        setBody(s.body || "");
        setEyebrow(s.data?.eyebrow || "");
        setItems(s.data?.items || []);
      }
      if (p) {
        setGroups(p.data?.groups || []);
        setTerms(p.data?.terms || "");
      }
      setLoaded(true);
    });
  }, []);

  async function saveServices() {
    setSaving(true);
    const res = await apiPost("/api/admin/content", {
      key: "services", title, body,
      data: { eyebrow, items },
      is_published: 1,
    }, true);
    setSaving(false);
    notify(res.ok ? { msg: "Services saved.", type: "success" } : { msg: res.message || "Failed.", type: "error" });
  }

  async function savePackages() {
    setSaving(true);
    const res = await apiPost("/api/admin/content", {
      key: "packages", title: "Packages", body: "",
      data: { groups, terms },
      is_published: 1,
    }, true);
    setSaving(false);
    notify(res.ok ? { msg: "Packages saved.", type: "success" } : { msg: res.message || "Failed.", type: "error" });
  }

  /* --- service item helpers --- */
  const setItem = (i: number, patch: Partial<ServiceItem>) =>
    setItems((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addItem = () => setItems((xs) => [...xs, { title: "", text: "", icon: "camera" }]);
  const delItem = (i: number) => setItems((xs) => xs.filter((_, j) => j !== i));
  const moveItem = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const n = [...xs]; [n[i], n[j]] = [n[j], n[i]]; return n;
    });

  /* --- package helpers --- */
  const setGroup = (gi: number, patch: Partial<PackageGroup>) =>
    setGroups((gs) => gs.map((g, j) => (j === gi ? { ...g, ...patch } : g)));
  const addGroup = () => setGroups((gs) => [...gs, { name: "New group", note: "", items: [] }]);
  const delGroup = (gi: number) => setGroups((gs) => gs.filter((_, j) => j !== gi));

  const setPkg = (gi: number, pi: number, patch: Partial<PackageItem>) =>
    setGroups((gs) => gs.map((g, j) =>
      j === gi ? { ...g, items: g.items.map((p, k) => (k === pi ? { ...p, ...patch } : p)) } : g));
  const addPkg = (gi: number) =>
    setGroups((gs) => gs.map((g, j) =>
      j === gi ? { ...g, items: [...g.items, { name: "", price: "", includes: [] }] } : g));
  const delPkg = (gi: number, pi: number) =>
    setGroups((gs) => gs.map((g, j) =>
      j === gi ? { ...g, items: g.items.filter((_, k) => k !== pi) } : g));

  if (!loaded) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      {/* ---------------- Services ---------------- */}
      <div className="space-y-3">
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="font-semibold text-secondary">Services — heading</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-secondary">Eyebrow</label>
              <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="The Audio Visual Company" className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
            </div>
            <div>
              <label className="text-sm font-semibold text-secondary">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What We Do" className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary">Subtitle</label>
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Creating great memories." className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-secondary">Services list</div>
              <div className="text-xs text-slate-400">The first 4 also appear as the homepage teaser.</div>
            </div>
            <button onClick={addItem} className="bg-primary text-white text-sm px-3 py-2 rounded-lg font-semibold">+ Add</button>
          </div>

          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="border rounded-lg p-3 grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Icon name={serviceIcon(it.icon)} size={18} />
                  </span>
                  <select
                    value={it.icon || "camera"}
                    onChange={(e) => setItem(i, { icon: e.target.value })}
                    className="border rounded px-2 py-1.5 text-xs"
                    aria-label="Icon"
                  >
                    {ICON_CHOICES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <input value={it.title} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Service name" className="border rounded px-2 py-1.5 text-sm" />
                <input value={it.text || ""} onChange={(e) => setItem(i, { text: e.target.value })} placeholder="Short description (optional)" className="border rounded px-2 py-1.5 text-sm" />
                <div className="flex gap-1 justify-end">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="px-2 py-1 border rounded text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="px-2 py-1 border rounded text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => delItem(i)} className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs">✕</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-400">No services yet — the section is hidden on the site.</p>}
          </div>

          <button onClick={saveServices} disabled={saving} className="mt-4 bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving ? "Saving…" : "Save services"}
          </button>
        </Card>
      </div>

      {/* ---------------- Packages ---------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-secondary">Packages &amp; pricing</div>
            <div className="text-xs text-slate-400">Shown on the /services page. Prices are free text — “KSh 30,000”, “KSh 200 each”, etc.</div>
          </div>
          <button onClick={addGroup} className="border border-primary text-primary text-sm px-3 py-2 rounded-lg font-semibold whitespace-nowrap">+ Add group</button>
        </div>

        {groups.map((g, gi) => (
          <Card key={gi} className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} placeholder="Group name (e.g. Wedding Coverage)" className="border rounded-lg px-3 py-2 text-sm font-semibold flex-1" />
              <input value={g.note || ""} onChange={(e) => setGroup(gi, { note: e.target.value })} placeholder="Note (optional)" className="border rounded-lg px-3 py-2 text-sm flex-1" />
              <button onClick={() => delGroup(gi)} className="border border-red-200 text-red-600 rounded-lg px-3 py-2 text-xs whitespace-nowrap">Delete group</button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {g.items.map((p, pi) => (
                <div key={pi} className="border rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={p.name} onChange={(e) => setPkg(gi, pi, { name: e.target.value })} placeholder="Package A" className="border rounded px-2 py-1.5 text-sm flex-1" />
                    <input value={p.price} onChange={(e) => setPkg(gi, pi, { price: e.target.value })} placeholder="KSh 30,000" className="border rounded px-2 py-1.5 text-sm w-32" />
                    <button onClick={() => delPkg(gi, pi)} className="px-2 border border-red-200 text-red-600 rounded text-xs">✕</button>
                  </div>
                  <textarea
                    value={(p.includes || []).join("\n")}
                    onChange={(e) => setPkg(gi, pi, { includes: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) })}
                    rows={5}
                    placeholder={"What's included — one item per line\n1 Photographer\n1 Videographer\nPhoto album"}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  />
                  <p className="text-xs text-slate-400">One inclusion per line — each becomes a ✓ bullet.</p>
                </div>
              ))}
            </div>

            <button onClick={() => addPkg(gi)} className="text-primary text-sm font-semibold">+ Add package to “{g.name || "group"}”</button>
          </Card>
        ))}

        <Card className="p-4 sm:p-5">
          <label className="text-sm font-semibold text-secondary">Booking terms</label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={2}
            placeholder="Pay 70% of the agreed amount as deposit…"
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
        </Card>

        <button onClick={savePackages} disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-60">
          {saving ? "Saving…" : "Save packages"}
        </button>
      </div>
    </div>
  );
}
