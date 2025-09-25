import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};


module.exports = {
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
