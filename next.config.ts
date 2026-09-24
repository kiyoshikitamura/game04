import type { NextConfig } from "next";
import previewPublicConfig from "./config/game04-preview-public.json";

const nextConfig: NextConfig = {
  // Existing Git-linked Preview builds must work without dashboard env setup.
  // These are browser-public dev credentials, never server/service-role keys.
  // Production and local builds do not receive these defaults.
  env: {
    NEXT_PUBLIC_GAME04_QA_METRICS_ALLOWED: process.env.VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS === "true" && process.env.NEXT_PUBLIC_APP_ENV !== "production" ? "true" : "false",
    ...(process.env.VERCEL_ENV === "preview" ? {
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV?.trim() || "preview",
      NEXT_PUBLIC_KPI_DATA_ENV: process.env.NEXT_PUBLIC_KPI_DATA_ENV?.trim() || "preview",
      NEXT_PUBLIC_RAID_ROOM_UI_ENABLED: process.env.NEXT_PUBLIC_RAID_ROOM_UI_ENABLED?.trim() || "true",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || previewPublicConfig.supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
        || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
        || previewPublicConfig.supabaseAnonKey,
    } : {}),
  },
  // Visual acceptance screenshots must represent the release canvas rather
  // than the Next.js development toolbar badge.
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
