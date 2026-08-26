import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlocakyqxryhzlevbnho.supabase.co";
const supabaseHostname = (() => {
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return "nlocakyqxryhzlevbnho.supabase.co";
  }
})();

const supabaseHosts = [
  supabaseHostname,
  "kkmuvaoenmeghegsqbjp.supabase.co",
  "*.supabase.co",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
};

export default nextConfig;
