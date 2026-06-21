import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
// Once UI base styles + design tokens must load before app globals so app
// styles can still override where needed.
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./globals.scss";
// TasteMap brand overrides — must load after Once UI tokens + app globals.
import "@/styles/theme.scss";
import { Providers } from "@/providers/Providers";
// Per-route-group shells: app/(marketing)/layout.tsx (no chrome) and
// app/(app)/layout.tsx (sidebars, status bar, global modals).

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TasteMap — Discover Food Together",
  description: "Social food discovery platform for friends and foodies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="light"
      data-brand="orange"
      data-accent="orange"
      data-neutral="sand"
      data-solid="contrast"
      data-solid-style="flat"
      data-border="rounded"
      data-surface="filled"
      data-transition="all"
      data-scaling="100"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ height: "100%", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}
    >
      <body
        suppressHydrationWarning
        style={{ minHeight: "100%", display: "flex", flexDirection: "column", margin: 0, padding: 0, overflow: "hidden" }}
      >
        <Providers>{children}</Providers>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
              fontSize: "0.85rem",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
            },
          }}
        />
      </body>
    </html>
  );
}
