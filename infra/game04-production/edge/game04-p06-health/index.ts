// P06 foundation only. No game imports, no database mutation, no reward or payment handlers.
const expectedOrigin = "https://soiksqgtmcnspfedmanr.supabase.co";
Deno.serve(async (req: Request) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supplied = req.headers.get("authorization");
  const origin = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
  if (!key || supplied !== `Bearer ${key}` || origin !== expectedOrigin || req.method !== "GET") {
    return new Response(JSON.stringify({ status: "unavailable" }), { status: 503, headers });
  }
  return new Response(JSON.stringify({ service: "game04-p06-health", environment: "production", foundation: "p06-v1", game: "not-installed", billing: "disabled", jobs: "absent" }), { status: 200, headers });
});
