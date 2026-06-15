"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Page, BodySm } from "@/components/ui";
import { tokens } from "@/styles/tokens";

/**
 * /auth/callback — Supabase OAuth redirect handler
 * Supabase redirects here after Google OAuth completes.
 * The URL hash (#access_token=...) is exchanged for a session,
 * then useAuth's onAuthStateChange fires → calls /sync → creates DB user.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/discover");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <Page center>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: tokens.space[4],
        }}
      >
        <Loader2
          size={32}
          strokeWidth={1.75}
          style={{
            color: tokens.color.warm,
            animation: "spin 0.8s linear infinite",
          }}
        />
        <BodySm tone="muted">Completing sign in…</BodySm>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Page>
  );
}
