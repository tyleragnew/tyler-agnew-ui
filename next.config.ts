import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "f4.bcbits.com" },
      { protocol: "https", hostname: "i.discogs.com" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
