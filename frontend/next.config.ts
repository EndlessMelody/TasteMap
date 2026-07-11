import type { NextConfig } from "next";
import os from "os";
import path from "path";

// Get all network IPs
const getNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const k in interfaces) {
    for (const i of interfaces[k]!) {
      if (i.family === "IPv4" && !i.internal) {
        ips.push(i.address);
      }
    }
  }
  return ips;
};

// Auto allow all network IPs
const nextConfig: NextConfig = {
  reactCompiler: process.env.NODE_ENV === "production",
  // Pin the workspace root so Turbopack doesn't get confused by the
  // unrelated lockfile in the parent C:\Users\phanp directory.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'mapbox-gl', '@supabase/ssr'],
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "bjuikfhjrpmrpbvhduey.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Cache optimized variants for 31 days so repeat views of the same
    // Supabase/Unsplash image don't re-burn the Vercel image-optimization quota.
    minimumCacheTTL: 2678400,
  },
  allowedDevOrigins: ['localhost:3000', ...getNetworkIPs()],

  async rewrites() {
    // In production the frontend talks to the backend via its absolute URL
    // (NEXT_PUBLIC_API_URL), so no proxy rewrite is needed — and a hardcoded
    // localhost rewrite would break the Vercel deployment.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

    if (apiUrl) {
      return [
        { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
      ];
    }

    // Dev convenience: proxy to the local backend only when no API URL is set.
    if (process.env.NODE_ENV !== "production") {
      return [
        { source: '/api/:path*', destination: 'http://127.0.0.1:8000/api/:path*' },
      ];
    }

    return [];
  }
};

export default nextConfig;