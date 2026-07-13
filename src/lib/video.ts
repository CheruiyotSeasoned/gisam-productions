/**
 * Resolves a pasted video URL into something we can embed.
 *
 * Big-Sam post to both YouTube (long form: weddings, documentaries) and TikTok
 * (short form), so the About video accepts either and we work out the player.
 * Aspect ratio differs — YouTube is landscape, TikTok is portrait — and callers
 * need to know which so the frame isn't letterboxed.
 */

import { tiktokId, tiktokEmbedUrl, isShortTiktokLink } from "./tiktok";

export type VideoKind = "youtube" | "tiktok";

export interface ResolvedVideo {
  kind: VideoKind;
  embedUrl: string;
  /** Portrait players (TikTok) need a 9:16 frame; YouTube needs 16:9. */
  portrait: boolean;
}

/** Pull the video id out of the various YouTube URL shapes. */
export function youtubeId(input: string): string | null {
  const url = (input || "").trim();
  if (!url) return null;

  // youtu.be/ID · youtube.com/watch?v=ID · /embed/ID · /shorts/ID · /live/ID
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{6,})/i
  );
  return m ? m[1] : null;
}

/** Resolve a URL to an embeddable player, or null if we can't embed it. */
export function resolveVideo(input: string): ResolvedVideo | null {
  const url = (input || "").trim();
  if (!url) return null;

  const yt = youtubeId(url);
  if (yt) {
    // A YouTube *Short* is vertical like TikTok — framing it 16:9 would pillarbox it.
    const isShort = /youtube\.com\/shorts\//i.test(url);
    return { kind: "youtube", embedUrl: `https://www.youtube.com/embed/${yt}`, portrait: isShort };
  }

  const tt = tiktokId(url);
  if (tt) {
    return { kind: "tiktok", embedUrl: tiktokEmbedUrl(tt), portrait: true };
  }

  return null;
}

/** Explain to an admin why a URL was rejected, so the error is actionable. */
export function videoHint(input: string): string | null {
  const url = (input || "").trim();
  if (!url || resolveVideo(url)) return null;
  if (isShortTiktokLink(url)) {
    return "Short TikTok links can't be embedded — open the video on tiktok.com and copy the URL from the address bar.";
  }
  return "Paste a YouTube or TikTok video link.";
}
