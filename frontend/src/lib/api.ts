/**
 * TasteMap — Shared API Client
 * Centralized HTTP helpers. All API calls should go through here.
 */

import { supabase } from "@/lib/supabase";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

// ─── Custom Error ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Token Caching ─────────────────────────────────────────────────────────────
let cachedToken: string | undefined;
let initialSessionPromise: Promise<string | undefined> | null = null;

if (typeof window !== "undefined") {
  // Sync token in background with a singleton promise
  initialSessionPromise = supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      cachedToken = session?.access_token;
      return cachedToken;
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    cachedToken = session?.access_token;
  });
}

// ─── Core Helpers ─────────────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...restOptions,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message =
        typeof err.detail === "object"
          ? JSON.stringify(err.detail)
          : (err.detail ?? err.message ?? message);
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

export const apiPost = <T>(
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
) =>
  request<T>(path, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiPatch = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiPut = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

export const apiDelete = <T>(path: string) =>
  request<T>(path, { method: "DELETE" });

export type MediaUploadType = "avatar" | "cover" | "post" | "reel" | "chat";

export interface MediaUploadResponse {
  url: string;
  file_type: string;
  size_bytes: number;
}

export async function apiUploadMedia(
  file: File,
  uploadType: MediaUploadType,
): Promise<MediaUploadResponse> {
  const encodedType = encodeURIComponent(uploadType);
  const url = `${BASE_URL}/api/v1/media/upload?type=${encodedType}`;

  let token: string | undefined = cachedToken;
  if (!token && typeof window !== "undefined" && initialSessionPromise) {
    token = await initialSessionPromise;
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message =
        typeof err.detail === "object"
          ? JSON.stringify(err.detail)
          : (err.detail ?? err.message ?? message);
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<MediaUploadResponse>;
}

// ─── JWT Auth API (for custom FastAPI backend) ────────────────────────────────

const JWT_TOKEN_KEY = "tastemap_jwt_token";
const JWT_EXPIRES_KEY = "tastemap_jwt_expires";

export interface JWTTokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface JWTAuthUser {
  id: number;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  title?: string;
  location?: string;
  phone?: string;
  xp: number;
  level: number;
}

export interface JWTLoginRequest {
  email: string;
  password: string;
}

export interface JWTRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  name?: string;
  otp_verified: boolean;
}

// ─── OTP Interfaces ───

export interface SendOTPRequest {
  email: string;
  username: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expires_in: number;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface CheckEmailVerifiedResponse {
  verified: boolean;
  email: string;
}

export interface JWTAuthResponse {
  token: JWTTokenData;
  user: JWTAuthUser;
}

// JWT Token management
function getJWTToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_TOKEN_KEY);
}

function setJWTToken(token: JWTTokenData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JWT_TOKEN_KEY, token.access_token);
  const expiresAt = Date.now() + token.expires_in * 1000;
  localStorage.setItem(JWT_EXPIRES_KEY, expiresAt.toString());
}

export function clearJWTToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JWT_TOKEN_KEY);
  localStorage.removeItem(JWT_EXPIRES_KEY);
}

export function isJWTValid(): boolean {
  if (typeof window === "undefined") return false;
  const token = getJWTToken();
  const expiresAt = localStorage.getItem(JWT_EXPIRES_KEY);
  if (!token || !expiresAt) return false;
  return Date.now() < parseInt(expiresAt, 10);
}

// JWT Auth API client
export const jwtAuthApi = {
  async login(credentials: JWTLoginRequest): Promise<JWTAuthResponse> {
    const response = await apiPost<JWTAuthResponse>(
      "/api/v1/auth/login",
      credentials,
    );
    setJWTToken(response.token);
    return response;
  },

  async register(data: JWTRegisterRequest): Promise<JWTAuthResponse> {
    const response = await apiPost<JWTAuthResponse>(
      "/api/v1/auth/register",
      data,
    );
    setJWTToken(response.token);
    return response;
  },

  async getCurrentUser(): Promise<JWTAuthUser> {
    return apiGet<JWTAuthUser>("/api/v1/auth/me");
  },

  // ─── OTP Methods ───

  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    return apiPost<SendOTPResponse>("/api/v1/auth/register/send-otp", data);
  },

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return apiPost<VerifyOTPResponse>("/api/v1/auth/register/verify-otp", data);
  },

  async checkEmailVerified(email: string): Promise<CheckEmailVerifiedResponse> {
    return apiPost<CheckEmailVerifiedResponse>(
      "/api/v1/auth/register/check-verified",
      { email },
    );
  },

  logout(): void {
    clearJWTToken();
  },

  isAuthenticated(): boolean {
    return isJWTValid();
  },
};

// Re-export for AuthContext compatibility
export const authApi = jwtAuthApi;
export type UserData = JWTAuthUser;
export type LoginRequest = JWTLoginRequest;
export type RegisterRequest = JWTRegisterRequest;
