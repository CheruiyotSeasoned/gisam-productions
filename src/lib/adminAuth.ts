"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, getToken, setToken } from "./api";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "reviewer";
}

/** Guards an admin page: ensures a valid token, returns the current user. */
export function useAdminGuard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    apiGet<AdminUser>("/api/admin/me", true).then((res) => {
      if (res.ok && res.data) {
        setUser(res.data);
        setLoading(false);
      } else {
        setToken(null);
        router.replace("/admin/login");
      }
    });
  }, [router]);

  return { user, loading };
}

export async function adminLogout(router: { replace: (p: string) => void }) {
  await apiPost("/api/admin/logout", {}, true);
  setToken(null);
  router.replace("/admin/login");
}
