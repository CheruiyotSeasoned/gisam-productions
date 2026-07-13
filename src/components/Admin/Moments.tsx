"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "./ui";
import Icon from "@/components/Icon";
import { tiktokId, tiktokEmbedUrl, isShortTiktokLink, type Moment } from "@/lib/tiktok";

/**
 * Admin manager for the homepage "Moments" section — a curated list of TikTok
 * videos. Everything is stored in the `moments` content block (title, body and
 * data.videos), so no new API endpoint is needed.
 */
export default function Moments({ notify }: { notify: (t: { msg: string; type: "success" | "error" }) => void }) {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("Moments from Big-Sam");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [videos, setVideos] = useState<Moment[]>([]);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  useEffect(() => {
    apiGet("/api/admin/content", true).then((r) => {
      if (r.ok) {
        const block = (r.data.blocks || []).find((b: any) => b.key === "moments");
        if (block) {
          setTitle(block.title || "Moments from Big-Sam");
          setBody(block.body || "");
          setPublished(!!block.is_published);
          setVideos(block.data?.videos || []);
        }
        setLoaded(true);
      }
    });
  }, []);

  async function persist(next: {
    videos?: Moment[]; title?: string; body?: string; published?: boolean;
  }) {
    const payload = {
      key: "moments",
      title: next.title ?? title,
      body: next.body ?? body,
      data: { videos: next.videos ?? videos },
      is_published: (next.published ?? published) ? 1 : 0,
    };
    setSaving(true);
    const res = await apiPost("/api/admin/content", payload, true);
    setSaving(false);
    if (res.ok) notify({ msg: "Moments updated.", type: "success" });
    else notify({ msg: res.message || "Could not save.", type: "error" });
    return res.ok;
  }

  async function add() {
    const clean = url.trim();
    if (!clean) return;
    if (isShortTiktokLink(clean)) {
      notify({
        msg: "Short links (vm.tiktok.com) can't be embedded. Open the video on tiktok.com and copy the full URL.",
        type: "error",
      });
      return;
    }
    if (!tiktokId(clean)) {
      notify({ msg: "That doesn't look like a TikTok video URL.", type: "error" });
      return;
    }
    if (videos.some((v) => tiktokId(v.url) === tiktokId(clean))) {
      notify({ msg: "That video is already in the list.", type: "error" });
      return;
    }
    const next = [...videos, { url: clean, caption: caption.trim() }];
    setVideos(next);
    setUrl(""); setCaption("");
    await persist({ videos: next });
  }

  async function remove(i: number) {
    const next = videos.filter((_, j) => j !== i);
    setVideos(next);
    await persist({ videos: next });
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= videos.length) return;
    const next = [...videos];
    [next[i], next[j]] = [next[j], next[i]];
    setVideos(next);
    await persist({ videos: next });
  }

  async function updateCaption(i: number, value: string) {
    const next = videos.map((v, j) => (j === i ? { ...v, caption: value } : v));
    setVideos(next);
  }

  if (!loaded) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-4">
      {/* Section heading + visibility */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-secondary">Moments — TikTok videos</div>
            <div className="text-xs text-slate-400">
              These play on the homepage. Paste the full share URL, e.g.{" "}
              <span className="font-mono">https://www.tiktok.com/@bigsam/video/7212345678901234567</span>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => { setPublished(e.target.checked); persist({ published: e.target.checked }); }}
            />
            Show section on the site
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-secondary">Section title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold text-secondary">Subtitle</label>
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Highlights from our stage." className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
        </div>
        <button
          onClick={() => persist({})}
          disabled={saving}
          className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save heading"}
        </button>
      </Card>

      {/* Add a video */}
      <Card className="p-4 sm:p-5">
        <div className="font-semibold text-secondary mb-3">Add a TikTok</div>
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="TikTok video URL"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Caption (optional)"
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={add}
            disabled={saving}
            className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
          >
            + Add video
          </button>
        </div>
        {url.trim() && !tiktokId(url) && (
          <p className="text-xs text-red-600 mt-2">
            {isShortTiktokLink(url)
              ? "Short links can't be embedded — open the video on tiktok.com and copy the URL from the address bar."
              : "No video id found in that URL."}
          </p>
        )}
      </Card>

      {/* Current list */}
      {videos.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 text-sm">
          No videos yet — the Moments section is hidden on the site until you add one.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v, i) => {
            const id = tiktokId(v.url);
            return (
              <Card key={`${v.url}-${i}`} className="p-3 space-y-2">
                <div className="rounded-lg overflow-hidden bg-slate-100">
                  {id ? (
                    <iframe
                      src={tiktokEmbedUrl(id)}
                      title={v.caption || "TikTok preview"}
                      loading="lazy"
                      className="w-full h-[420px] border-0 block"
                    />
                  ) : (
                    <div className="h-[420px] flex items-center justify-center text-center text-xs text-red-600 px-4">
                      Can&apos;t embed this URL — replace it with a full tiktok.com video link.
                    </div>
                  )}
                </div>

                <input
                  value={v.caption || ""}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  onBlur={() => persist({})}
                  placeholder="Caption (optional)"
                  className="w-full border rounded-lg px-2 py-1.5 text-sm"
                />

                <div className="flex items-center justify-between gap-2">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-400 hover:text-primary inline-flex items-center gap-1 truncate"
                    title={v.url}
                  >
                    <Icon name="external-link" size={12} /> Open
                  </a>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 py-1 border rounded text-xs disabled:opacity-30" title="Move up">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === videos.length - 1} className="px-2 py-1 border rounded text-xs disabled:opacity-30" title="Move down">↓</button>
                    <button onClick={() => remove(i)} className="px-2 py-1 border border-red-200 text-red-600 rounded text-xs" title="Remove">Remove</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
