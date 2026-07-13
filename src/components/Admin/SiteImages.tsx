"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "./ui";
import MediaPickerModal from "./MediaPickerModal";

/**
 * Friendly image manager for the main site visuals. Each slot writes into the
 * relevant content block's `data`, so the public site picks it up immediately.
 */
export default function SiteImages({ notify }: { notify: (t: { msg: string; type: "success" | "error" }) => void }) {
  const [blocks, setBlocks] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);
  const [picker, setPicker] = useState<{ open: boolean; onPick: (url: string) => void }>({ open: false, onPick: () => {} });

  const load = () =>
    apiGet("/api/admin/content", true).then((r) => {
      if (r.ok) {
        const map: Record<string, any> = {};
        (r.data.blocks || []).forEach((b: any) => { map[b.key] = b; });
        setBlocks(map);
        setLoaded(true);
      }
    });
  useEffect(() => { load(); }, []);

  async function saveBlockData(key: string, mutate: (data: any) => any) {
    const block = blocks[key] || { key, title: "", body: "", data: {}, is_published: 1 };
    const data = mutate({ ...(block.data || {}) });
    const res = await apiPost("/api/admin/content", {
      key,
      title: block.title || "",
      body: block.body || "",
      data,
      is_published: block.is_published ? 1 : 0,
    }, true);
    if (res.ok) {
      setBlocks((b) => ({ ...b, [key]: { ...block, data } }));
      notify({ msg: "Image updated.", type: "success" });
    } else {
      notify({ msg: res.message || "Could not save.", type: "error" });
    }
  }

  function openPicker(onPick: (url: string) => void) {
    setPicker({ open: true, onPick });
  }

  if (!loaded) return <p className="text-slate-400">Loading…</p>;

  const hero = blocks.hero?.data || {};
  const about = blocks.about?.data || {};

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Manage the images shown across the public site. Uploads go to your Media library and are used immediately.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <ImageSlot
          title="Hero — background"
          hint="The big stage/event image on the homepage hero."
          value={hero.image}
          onChoose={() => openPicker((url) => saveBlockData("hero", (d) => ({ ...d, image: url })))}
          onClear={() => saveBlockData("hero", (d) => ({ ...d, image: "" }))}
        />
        <ImageSlot
          title="Hero — vocalist portrait"
          hint="The inset portrait overlapping the hero image."
          value={hero.portrait}
          onChoose={() => openPicker((url) => saveBlockData("hero", (d) => ({ ...d, portrait: url })))}
          onClear={() => saveBlockData("hero", (d) => ({ ...d, portrait: "" }))}
        />
        <ImageSlot
          title="About — feature image"
          hint="Image shown in the About section."
          value={about.image}
          onChoose={() => openPicker((url) => saveBlockData("about", (d) => ({ ...d, image: url })))}
          onClear={() => saveBlockData("about", (d) => ({ ...d, image: "" }))}
        />
      </div>

      {/* The old photo gallery strip is now the TikTok "Moments" section. */}
      <Card className="p-4 sm:p-5">
        <div className="font-semibold text-secondary">Moments — “Moments from Big-Sam”</div>
        <p className="text-sm text-slate-500 mt-1">
          This section now shows TikTok videos instead of photos. Manage it in the{" "}
          <strong>Moments (TikTok)</strong> tab.
        </p>
      </Card>

      <MediaPickerModal
        open={picker.open}
        onClose={() => setPicker({ open: false, onPick: () => {} })}
        onPick={picker.onPick}
        notify={notify}
      />
    </div>
  );
}

function ImageSlot({
  title, hint, value, onChoose, onClear,
}: {
  title: string; hint: string; value?: string; onChoose: () => void; onClear: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="font-semibold text-secondary mb-1">{title}</div>
      <p className="text-xs text-slate-400 mb-3">{hint}</p>
      <div className="aspect-[16/9] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mb-3">
        {value ? <img src={value} alt={title} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">Using default</span>}
      </div>
      <div className="flex gap-2">
        <button onClick={onChoose} className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-semibold">{value ? "Replace" : "Choose / Upload"}</button>
        {value && <button onClick={onClear} className="px-3 border text-slate-600 text-sm rounded-lg">Reset</button>}
      </div>
    </Card>
  );
}
