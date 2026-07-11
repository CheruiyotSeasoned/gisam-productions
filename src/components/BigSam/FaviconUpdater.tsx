"use client";

import { useEffect } from "react";
import { useSiteContent } from "@/lib/useSiteContent";

/**
 * Applies the admin-configured favicon at runtime (static export can't set it
 * at build time from the DB). Falls back to the bundled icon when unset.
 */
export default function FaviconUpdater() {
  const { data } = useSiteContent();
  const favicon = data?.settings?.site_favicon;

  useEffect(() => {
    if (!favicon) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);

  return null;
}
