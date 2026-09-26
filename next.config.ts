import type { NextConfig } from "next";
import previewPublicConfig from "./config/game04-preview-public.json";

// Only this authorized G2 Preview receives a QA default. Explicit false wins.
const qaFlag = process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS?.trim();
const qaProduction = process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() === "production";
const qaBranchDefault = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "work/game04-g2-20260924";
const effectiveQaFlag = !qaProduction && (qaFlag === "true" || (qaFlag === undefined && qaBranchDefault)) ? "true" : "false";

const nextConfig: NextConfig = {
  // Existing Git-linked Preview builds must work without dashboard env setup.
  // These are browser-public dev credentials, never server/service-role keys.
  // Production and local builds do not receive these defaults.
  env: {
    NEXT_PUBLIC_ENABLE_QA_TOOLS: effectiveQaFlag,
    NEXT_PUBLIC_GAME04_QA_METRICS_ALLOWED: effectiveQaFlag,
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
