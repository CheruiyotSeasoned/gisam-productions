"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "./ui";
import MediaPickerModal from "./MediaPickerModal";
import { resolveVideo, videoHint } from "@/lib/video";

/**
 * Friendly editor for the homepage "About Big-Sam" block — heading, story, the
 * feature video (YouTube or TikTok) and the fallback image. Previously this was
 * only editable through the raw JSON textarea in Page content.
 */
export default function AboutSection({ notify }: { notify: (t: { msg: string; type: "success" | "error" }) => void }) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [body, setBody] = useState("");
  const [video, setVideo] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    apiGet("/api/admin/content", true).then((r) => {
      if (!r.ok) return;
      const b = (r.data.blocks || []).find((x: any) => x.key === "about");
      if (b) {
        setTitle(b.title || "");
        setBody(b.body || "");
        setPublished(!!b.is_published);
        setTagline(b.data?.tagline || "");
        // Older content stored a videos[] array; show the first entry.
        setVideo(b.data?.video || b.data?.videos?.[0] || "");
        setImage(b.data?.image || "");
      }
      setLoaded(true);
    });
  }, []);

  async function save() {
    const hint = videoHint(video);
    if (hint) { notify({ msg: hint, type: "error" }); return; }

    setSaving(true);
    const res = await apiPost("/api/admin/content", {
      key: "about",
      title,
      body,
      // Keep `videos` in sync so anything still reading the old shape agrees.
      data: { tagline, video: video.trim(), videos: video.trim() ? [video.trim()] : [], image },
      is_published: published ? 1 : 0,
    }, true);
    setSaving(false);
    notify(res.ok
      ? { msg: "About section saved.", type: "success" }
      : { msg: res.message || "Could not save.", type: "error" });
  }

  if (!loaded) return <p className="text-slate-400">Loading…</p>;

  const resolved = resolveVideo(video);
  const hint = videoHint(video);

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-secondary">About Big-Sam</div>
            <div className="text-xs text-slate-400">The dark band on the homepage, under “How to Enter”.</div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Show on the site
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-secondary">Eyebrow / tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="The Audio Visual Company"
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">Small red line above the heading. Leave blank to hide.</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary">Heading</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About Big-Sam Production"
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-secondary">Story</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          <p className="text-xs text-slate-400 mt-1">Line breaks are preserved on the site.</p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Video */}
        <Card className="p-4 sm:p-5">
          <div className="font-semibold text-secondary mb-1">Feature video</div>
          <p className="text-xs text-slate-400 mb-3">
            Paste a <strong>YouTube</strong> or <strong>TikTok</strong> link. When set, it replaces the image below on the homepage.
          </p>
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {hint && <p className="text-xs text-red-600 mt-2">{hint}</p>}

          {resolved && (
            <div className="mt-3">
              <div className="text-xs text-slate-400 mb-1">
                Preview — {resolved.kind === "youtube" ? "YouTube (landscape)" : "TikTok (portrait)"}
              </div>
              <div className={`rounded-lg overflow-hidden bg-slate-900 ${resolved.portrait ? "max-w-[260px]" : ""}`}>
                <iframe
                  src={resolved.embedUrl}
                  title="Video preview"
                  loading="lazy"
                  allowFullScreen
                  className={`w-full border-0 block ${resolved.portrait ? "h-[460px]" : "aspect-video"}`}
                />
              </div>
            </div>
          )}
          {video && (
            <button onClick={() => setVideo("")} className="mt-3 text-xs border rounded-lg px-3 py-1.5 text-slate-600">
              Remove video
            </button>
          )}
        </Card>

        {/* Fallback image */}
        <Card className="p-4 sm:p-5">
          <div className="font-semibold text-secondary mb-1">Fallback image</div>
          <p className="text-xs text-slate-400 mb-3">Shown only when no video is set.</p>
          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mb-3">
            {image
              ? <img src={image} alt="About" className="w-full h-full object-cover" />
              : <span className="text-xs text-slate-400">Using default</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPickerOpen(true)} className="flex-1 bg-primary text-white text-sm py-2 rounded-lg font-semibold">
              {image ? "Replace" : "Choose / Upload"}
            </button>
            {image && <button onClick={() => setImage("")} className="px-3 border text-slate-600 text-sm rounded-lg">Reset</button>}
          </div>
        </Card>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save About section"}
      </button>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(url) => { setImage(url); setPickerOpen(false); }}
        notify={notify}
      />
    </div>
  );
}
