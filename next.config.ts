import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "f4.bcbits.com" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
