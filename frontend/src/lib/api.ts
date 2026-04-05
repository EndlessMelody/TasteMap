/**
 * TasteMap — Shared API Client
 * Centralized HTTP helpers. All API calls should go through here.
 */

import { supabase } from "@/lib/supabase";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

// ─── Custom Error ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Token Caching ─────────────────────────────────────────────────────────────
let cachedToken: string | undefined;
let initialSessionPromise: Promise<any> | null = null;

if (typeof window !== "undefined") {
  // Sync token in background with a singleton promise
  initialSessionPromise = supabase.auth.getSession().then(({ data: { session } }) => {
    cachedToken = session?.access_token;
    return cachedToken;
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    cachedToken = session?.access_token;
  });
}

// ─── Core Helpers ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const { headers, ...restOptions } = options;

  let token: string | undefined = cachedToken;
  
  // Nếu chưa có cache (do request bắn ra siêu sớm), chờ chung 1 Promise duy nhất
  // thay vì mỗi request tự gọi getSession() gây lock LocalStorage 5s.
  if (!token && typeof window !== "undefined" && initialSessionPromise) {
     token = await initialSessionPromise;
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...restOptions,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = typeof err.detail === 'object' ? JSON.stringify(err.detail) : err.detail ?? err.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content — no body
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string, headers?: Record<string, string>) =>
  request<T>(path, { method: "GET", headers });

export const apiPost = <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
  request<T>(path, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });

export const apiDelete = <T>(path: string) =>
  request<T>(path, { method: "DELETE" });
