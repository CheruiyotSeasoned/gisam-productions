/**
 * Big-Sam API client — talks to the PHP backend.
 * All calls go through here so base URL, auth token and error shape stay consistent.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

const TOKEN_KEY = "bigsam_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export interface ApiResult<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  status: number;
}

interface RequestOptions {
  method?: string;
  body?: any;
  auth?: boolean;
  isForm?: boolean;
}

export async function api<T = any>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, auth = false, isForm = false } = options;
  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, message: "Network error — is the server reachable?", status: 0 };
  }

  let json: any = {};
  try {
    json = await res.json();
  } catch {
    // non-JSON (e.g. CSV/file) — caller should not use api() for those
  }

  return {
    ok: res.ok && json.ok !== false,
    message: json.message,
    data: json.data,
    errors: json.errors,
    status: res.status,
  };
}

// Convenience wrappers -------------------------------------------------------
export const apiGet = <T = any>(path: string, auth = false) => api<T>(path, { method: "GET", auth });
export const apiPost = <T = any>(path: string, body?: any, auth = false) =>
  api<T>(path, { method: "POST", body, auth });
export const apiPostForm = <T = any>(path: string, form: FormData, auth = false) =>
  api<T>(path, { method: "POST", body: form, auth, isForm: true });

/** For file downloads / streamed responses that need the auth header. */
export function authFileUrl(path: string): string {
  return `${API_BASE}${path}`;
}
export async function downloadWithAuth(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
