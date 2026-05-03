import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  env: {
    COD_ONLY_MODE: process.env.COD_ONLY_MODE ?? "",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "xaeydyysjcyorobhlmme.supabase.co" },
    ],
  },
};
export default nextConfig;
