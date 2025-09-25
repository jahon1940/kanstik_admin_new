import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://kanstik.retailer.hoomo.uz/:path*",
      },
    ];
  },
};

export default nextConfig;
