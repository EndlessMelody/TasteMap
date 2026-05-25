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

  allowedDevOrigins: ['localhost:3000', ...getNetworkIPs()],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*'
      }
    ];
  }
};

export default nextConfig;