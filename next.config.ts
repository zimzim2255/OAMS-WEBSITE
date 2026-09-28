import type { NextConfig } from "next";

// v2: run as a Node server (required for /api, auth and the database).
// (v1 used `output: "export"` for GitHub Pages — removed for the VPS platform.)
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;