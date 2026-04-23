import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: process.env.NODE_ENV === "production",
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'mapbox-gl', '@supabase/ssr'],
  },
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
