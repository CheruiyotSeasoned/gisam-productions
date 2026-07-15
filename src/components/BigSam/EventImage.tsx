"use client";

import { useState } from "react";

/**
 * Fills a fixed-shape frame with an event photo of ANY orientation without
 * truncating the subject.
 *
 * - Landscape / square photos fill the frame edge-to-edge (object-cover), the
 *   look the hero was designed around.
 * - Portrait photos (taller than the frame) are shown in full (object-contain)
 *   floating over a blurred, dimmed copy of themselves — so the sides fill
 *   gracefully instead of cropping the singer's head or feet.
 *
 * The frame keeps its own dimensions (the parent's aspect box), so overlapping
 * decorations positioned against that frame don't shift.
 */
export default function EventImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [portrait, setPortrait] = useState(false);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Blurred backdrop — only visible in the margins of a contained photo. */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-[0.55] transition-opacity duration-500 ${
          portrait ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Foreground — the actual subject, never cropped when portrait. */}
      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          const img = e.currentTarget;
          // Treat clearly-taller-than-wide photos as portrait; leave near-square
          // and landscape on cover so the intended full-bleed look is preserved.
          setPortrait(img.naturalHeight > img.naturalWidth * 1.1);
        }}
        className={`relative w-full h-full ${portrait ? "object-contain" : "object-cover"}`}
      />
    </div>
  );
}
