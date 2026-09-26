import assert from "node:assert/strict";
import { buildGame04CampaignUrl } from "./game04-campaign-url.mjs";
import { captureAcquisitionLandingMetadata } from "../src/utils/acquisitionAttributionMetadata.ts";
import { isValidSupabaseUrl } from "../src/utils/supabaseUrl.ts";

for (const source of ["x", "meta"]) {
  const url = buildGame04CampaignUrl({ source, campaign: "qa", creative: "character_a" });
  const metadata = captureAcquisitionLandingMetadata(url, "");
  assert.equal(metadata.utm_source, source);
  assert.equal(metadata.utm_campaign, "game04_qa");
  assert.equal(metadata.utm_medium, "paid_social");
  assert.equal(metadata.utm_content, "character_a");
}
assert.throws(() => buildGame04CampaignUrl({ source: "x", campaign: "qa", creative: "a", origin: "https://tribe-neon.com" }));
const base = "https://game04.vercel.app/";
assert.equal(captureAcquisitionLandingMetadata(`${base}?twclid=x1`, "").utm_source, "x");
assert.equal(captureAcquisitionLandingMetadata(`${base}?fbclid=m1`, "").utm_source, "meta");
assert.equal(captureAcquisitionLandingMetadata(base, "").utm_source, "direct");
assert.equal(isValidSupabaseUrl("https://znakrkaazliexzwihxge.supabase.co", "preview"), true);
assert.equal(isValidSupabaseUrl("https://ktpolnkyyfkowxdmijww.supabase.co", "preview"), false);
assert.equal(isValidSupabaseUrl("https://lrgyllgzcdcphlbmkknc.supabase.co", "preview"), false);
assert.equal(isValidSupabaseUrl("https://znakrkaazliexzwihxge.supabase.co", "production"), false);
console.log("GAME04 campaign / X+Meta attribution / DB separation: PASS");
