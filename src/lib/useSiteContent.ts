"use client";

import { useEffect, useState } from "react";
import { apiGet } from "./api";
import type { SiteContent } from "./types";

let cache: SiteContent | null = null;

/** Fetches /api/content once and caches it for the session. */
export function useSiteContent() {
  const [data, setData] = useState<SiteContent | null>(cache);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let active = true;
    apiGet<SiteContent>("/api/content").then((res) => {
      if (!active) return;
      if (res.ok && res.data) {
        cache = res.data;
        setData(res.data);
      } else {
        setError(res.message || "Could not load site content.");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
