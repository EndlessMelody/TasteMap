"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SplashScreen } from "@/components/layout/SplashScreen";

// No-chrome shell for `/` and `/login`. The authenticated app shell lives in
// `app/(app)/layout.tsx`.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { isInitializing, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (isInitializing) return;
    if (isLoggedIn && pathname === "/login") {
      router.replace("/discover"); // logged-in users skip the login page
    }
  }, [isInitializing, isLoggedIn, pathname, router]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <div
      id="promo-scroll-container"
      style={{
        width: "100vw",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {children}
    </div>
  );
}
