"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPostForm, apiPost } from "@/lib/api";
import Icon from "@/components/Icon";

export interface MediaItem {
  id: number;
  url: string;
  filename: string;
  original_name: string;
  mime: string;
  size: number;
  created_at: string;
}

/**
 * Reusable media library. `onPick` turns it into a picker (shows a "Use" button).
 */
export default function MediaLibrary({
  folder = "media",
  onPick,
  notify,
}: {
  folder?: string;
  onPick?: (url: string) => void;
  notify?: (t: { msg: string; type: "success" | "error" }) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => apiGet("/api/admin/media", true).then((r) => r.ok && setItems(r.data.media));
  useEffect(() => { load(); }, []);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("folder", folder);
      form.append("file", file);
      const res = await apiPostForm("/api/admin/media", form, true);
      if (!res.ok) notify?.({ msg: res.message || "Upload failed.", type: "error" });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
    notify?.({ msg: "Upload complete.", type: "success" });
  }

  async function del(id: number) {
    if (!confirm("Delete this image? Any page using it will lose the image.")) return;
    await apiPost(`/api/admin/media/${id}/delete`, {}, true);
    load();
  }

  function copy(item: MediaItem) {
    navigator.clipboard?.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-4 bg-slate-50"
      >
        <Icon name="download" size={28} className="mx-auto text-slate-400 mb-2" />
        <p className="text-sm text-slate-500 mb-3">Drag &amp; drop images here, or</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60">
          {uploading ? "Uploading…" : "Choose images"}
        </button>
        <p className="text-xs text-slate-400 mt-2">PNG, JPG, WEBP, GIF, SVG, ICO · up to 5 MB</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((m) => (
            <div key={m.id} className="border rounded-lg overflow-hidden group relative bg-white">
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                <img src={m.url} alt={m.original_name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-2">
                <div className="text-xs text-slate-500 truncate" title={m.original_name}>{m.original_name}</div>
                <div className="flex gap-1 mt-1">
                  {onPick ? (
                    <button onClick={() => onPick(m.url)} className="flex-1 bg-primary text-white text-xs py-1 rounded font-semibold">Use</button>
                  ) : (
                    <button onClick={() => copy(m)} className="flex-1 border text-xs py-1 rounded text-slate-600">
                      {copied === m.id ? "Copied!" : "Copy URL"}
                    </button>
                  )}
                  <button onClick={() => del(m.id)} className="px-2 border text-red-500 text-xs py-1 rounded" title="Delete">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
