import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
