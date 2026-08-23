import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kkmuvaoenmeghegsqbjp.supabase.co",
        pathname: "/storage/v1/object/public/aerion-assets/**",
      },
    ],
  },
};

export default nextConfig;
