/**
 * TikTok helpers shared by the public "Moments" section and the admin manager.
 *
 * We embed with TikTok's iframe player (https://www.tiktok.com/embed/v2/<id>),
 * which needs the numeric video id. That id only appears in the full share URL
 * (.../@user/video/<id>) — short links (vm.tiktok.com/…, tiktok.com/t/…) redirect
 * to it, so they cannot be resolved in the browser and must be expanded first.
 */

/** A single TikTok video managed from the admin. */
export interface Moment {
  url: string;
  caption?: string;
}

/** Pull the numeric video id out of a TikTok URL, or return null if there isn't one. */
export function tiktokId(input: string): string | null {
  const url = (input || "").trim();
  if (!url) return null;

  // A bare id pasted straight from the share sheet.
  if (/^\d{6,}$/.test(url)) return url;

  // https://www.tiktok.com/@handle/video/7212345678901234567?is_from_webapp=1
  const full = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (full) return full[1];

  // https://www.tiktok.com/embed/v2/7212345678901234567
  const embed = url.match(/tiktok\.com\/embed\/(?:v2\/)?(\d+)/i);
  if (embed) return embed[1];

  return null;
}

/** True for a short link we cannot expand client-side — the admin must paste the full URL. */
export function isShortTiktokLink(input: string): boolean {
  return /(?:vm|vt)\.tiktok\.com\/|tiktok\.com\/t\//i.test((input || "").trim());
}

export function tiktokEmbedUrl(id: string): string {
  return `https://www.tiktok.com/embed/v2/${id}`;
}
