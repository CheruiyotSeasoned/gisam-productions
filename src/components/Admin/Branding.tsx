"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, apiPostForm } from "@/lib/api";

interface BrandItem {
  key: string;
  label: string;
  hint: string;
  preview: "wide" | "square";
}

const ITEMS: BrandItem[] = [
  { key: "site_logo", label: "Site logo", hint: "Shown in the header & footer. Square or wide PNG works best.", preview: "square" },
  { key: "site_favicon", label: "Favicon", hint: "Browser-tab icon. A square PNG/ICO (e.g. 64×64 or 160×160).", preview: "square" },
  { key: "site_og_image", label: "Social share image", hint: "Preview when the link is shared (WhatsApp/Facebook). ~1200×630.", preview: "wide" },
];

export default function Branding({ notify }: { notify: (t: { msg: string; type: "success" | "error" }) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/api/admin/settings", true).then((r) => {
      if (r.ok) {
        const v: Record<string, string> = {};
        (r.data.grouped.branding || []).forEach((row: any) => { v[row.key] = row.value || ""; });
        setValues(v);
      }
    });
  }, []);

  async function uploadFor(key: string, file: File | null) {
    if (!file) return;
    setBusy(key);
    const form = new FormData();
    form.append("folder", "branding");
    form.append("file", file);
    const up = await apiPostForm("/api/admin/media", form, true);
    if (!up.ok || !up.data?.url) {
      setBusy(null);
      notify({ msg: up.message || "Upload failed.", type: "error" });
      return;
    }
    const url = up.data.url as string;
    const save = await apiPost("/api/admin/settings", { [key]: url }, true);
    setBusy(null);
    if (save.ok) {
      setValues((v) => ({ ...v, [key]: url }));
      notify({ msg: "Branding updated.", type: "success" });
    } else {
      notify({ msg: save.message || "Could not save.", type: "error" });
    }
  }

  async function clear(key: string) {
    setBusy(key);
    const save = await apiPost("/api/admin/settings", { [key]: "" }, true);
    setBusy(null);
    if (save.ok) {
      setValues((v) => ({ ...v, [key]: "" }));
      notify({ msg: "Reset to default.", type: "success" });
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {ITEMS.map((it) => (
        <BrandCard
          key={it.key}
          item={it}
          value={values[it.key]}
          busy={busy === it.key}
          onUpload={(f) => uploadFor(it.key, f)}
          onClear={() => clear(it.key)}
        />
      ))}
    </div>
  );
}

function BrandCard({
  item, value, busy, onUpload, onClear,
}: {
  item: BrandItem; value?: string; busy: boolean; onUpload: (f: File | null) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-semibold text-secondary mb-1">{item.label}</div>
      <p className="text-xs text-slate-400 mb-3">{item.hint}</p>
      <div className={`bg-slate-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden ${item.preview === "wide" ? "aspect-[16/7]" : "aspect-square"}`}>
        {value ? (
          <img src={value} alt={item.label} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-xs text-slate-400">Using default</span>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0] ?? null)} />
      <div className="flex gap-2">
        <button onClick={() => ref.current?.click()} disabled={busy} className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-semibold disabled:opacity-60">
          {busy ? "Saving…" : value ? "Replace" : "Upload"}
        </button>
        {value && <button onClick={onClear} disabled={busy} className="px-3 border text-slate-600 text-sm rounded-lg">Reset</button>}
      </div>
    </div>
  );
}
