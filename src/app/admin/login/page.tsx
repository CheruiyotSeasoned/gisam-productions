"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, setToken, getToken } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) router.replace("/admin");
  }, [router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await apiPost<{ token: string }>("/api/admin/login", {
      email: form.get("email"),
      password: form.get("password"),
    });
    setLoading(false);
    if (res.ok && res.data?.token) {
      setToken(res.data.token);
      router.replace("/admin");
    } else {
      setError(res.message || "Invalid credentials.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-primary p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-black text-xl mb-2">B</div>
          <h1 className="text-xl font-extrabold text-secondary">BIG-SAM Admin</h1>
          <p className="text-sm text-slate-400">Sign in to continue</p>
        </div>
        {error && <div className="mb-4 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Email</label>
            <input name="email" type="email" required autoFocus className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
            <input name="password" type="password" required className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:border-primary outline-none" />
          </div>
          <button disabled={loading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primaryDark disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
