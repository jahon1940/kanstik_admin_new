import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://kanstik.retailer.hoomo.uz',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kanstik.retailer.hoomo.uz',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
