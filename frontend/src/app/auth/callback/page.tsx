"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * /auth/callback — Supabase OAuth redirect handler
 * Supabase redirects here after Google OAuth completes.
 * The URL hash (#access_token=...) is exchanged for a session,
 * then useAuth's onAuthStateChange fires → calls /sync → creates DB user.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase handles the hash fragment automatically via getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Session established — redirect to app
        // useAuth hook will catch onAuthStateChange and call /sync
        router.replace("/discover");
      } else {
        // Something went wrong — go back to login
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "white", flexDirection: "column", gap: 16
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
        <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#007AFF" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: 14, color: "rgba(0,0,0,0.4)", margin: 0 }}>Completing sign in…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
