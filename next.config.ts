import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
