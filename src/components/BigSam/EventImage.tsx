"use client";

import { useState } from "react";

/**
 * Fills a frame with an event image of ANY orientation without truncating it,
 * and tells the parent which orientation loaded so the hero can adapt.
 *
 * - Landscape / square photos fill the frame edge-to-edge (object-cover) — the
 *   composition the hero was designed around, with its floating cards.
 * - Portrait posters are shown BIG and clean: centred at full height on a
 *   subtle branded backdrop, with no cards competing over them. A poster is
 *   usually a finished flyer (prize, date, venue baked in), so it becomes the
 *   hero itself.
 */
export default function EventImage({
  src,
  alt,
  onPortrait,
  className = "",
}: {
  src: string;
  alt: string;
  /** Called once the image loads, with true when it's portrait. */
  onPortrait?: (portrait: boolean) => void;
  className?: string;
}) {
  const [portrait, setPortrait] = useState(false);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Clean branded backdrop behind a portrait poster (never blur). */}
      {portrait && (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(130% 100% at 50% 0%, #2a0a0d 0%, #14060a 45%, #0B0B0F 100%)",
          }}
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          onLoad={(e) => {
            const img = e.currentTarget;
            const isPortrait = img.naturalHeight > img.naturalWidth * 1.1;
            setPortrait(isPortrait);
            onPortrait?.(isPortrait);
          }}
          className={
            portrait
              ? "relative h-full w-auto max-w-full object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
              : "w-full h-full object-cover"
          }
        />
      </div>
    </div>
  );
}
