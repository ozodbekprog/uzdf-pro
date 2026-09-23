import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin paneldan kiritiladigan tashqi rasm URL'lari uchun ruxsat.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" }
    ]
  }
};

export default nextConfig;
