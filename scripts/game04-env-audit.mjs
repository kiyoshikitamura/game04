import { readFile } from "node:fs/promises";

// Read-only presence audit: never prints environment values or contacts a service.
const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/game04-env-audit.mjs <local-env-file>");
  process.exit(1);
}
const values = Object.fromEntries((await readFile(filename, "utf8")).split(/\r?\n/).flatMap(line => {
  const match = /^(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line.trim());
  return match ? [[match[1], match[2].replace(/^(['"])(.*)\1$/, "$2").trim()]] : [];
}));
const has = name => Boolean(values[name]);
const allowedApp = ["development", "preview"].includes(values.NEXT_PUBLIC_APP_ENV);
const targetOk = values.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") === "https://lrgyllgzcdcphlbmkknc.supabase.co";
const publicKey = has("NEXT_PUBLIC_SUPABASE_ANON_KEY") || has("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
console.log(JSON.stringify({
  environmentAllowed: allowedApp,
  game04DevTarget: targetOk,
  publicKeyPresent: publicKey,
  mockDisabled: values.NEXT_PUBLIC_USE_MOCK_DB !== "true",
  optional: Object.fromEntries([
    "SUPABASE_SERVICE_ROLE_KEY", "KPI_BASIC_AUTH_USER", "KPI_BASIC_AUTH_PASSWORD",
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_KPI_DATA_ENV",
    "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "BILLING_RETURN_ORIGIN",
  ].map(name => [name, has(name) ? "configured" : "missing"])),
  production: "not configured; deployment and DB writes are not part of this audit",
}, null, 2));
if (!allowedApp || !targetOk || !publicKey || values.NEXT_PUBLIC_USE_MOCK_DB === "true") process.exitCode = 1;
