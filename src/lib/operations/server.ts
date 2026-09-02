import "server-only";
import { enabledFallback, normalizeApplicationAvailability } from "./contract";

export async function readApplicationAvailability() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return enabledFallback;

  try {
    const response = await fetch(`${url}/rest/v1/rpc/get_public_operational_state`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return enabledFallback;
    return normalizeApplicationAvailability(await response.json());
  } catch {
    // Availability checks fail open so an operations dependency cannot create an outage.
    return enabledFallback;
  }
}
