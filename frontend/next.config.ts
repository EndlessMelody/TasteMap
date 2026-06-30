import type { NextConfig } from "next";
import os from "os";

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
  },
  allowedDevOrigins: ['localhost:3000', ...getNetworkIPs()],

  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      process.env.BACKEND_URL?.replace(/\/$/, "") ||
      "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;