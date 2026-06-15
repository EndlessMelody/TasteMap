import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
// Once UI base styles + design tokens must load before app globals so app
// styles can still override where needed.
import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "./globals.css";
import { Providers } from "@/providers/Providers";

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

import DashboardLayout from "@/components/DashboardLayout";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col m-0 p-0 overflow-hidden">
        <Providers>
          <DashboardLayout>{children}</DashboardLayout>
        </Providers>
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
