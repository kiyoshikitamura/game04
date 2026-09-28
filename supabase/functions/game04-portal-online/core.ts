export const PRODUCTION_URL = 'https://soiksqgtmcnspfedmanr.supabase.co';
export const PORTAL_URL = 'https://games-alchemist.com/api/portal/online-count/';
type Attempt = { status: string; id?: string; online_count?: number; counted_at?: string };
type Result = { httpStatus: number | null; result: string; retry: boolean };
export type Dependencies = {
  projectUrl: string; enabled: boolean; apiKey?: string;
  now: () => number;
  claim: (token: string, scheduledAt: string) => Promise<{status: string; id?: string}>;
  prepare: (job: string, attempt: number) => Promise<Attempt>;
  finish: (job: string, attempt: string | null, result: Result) => Promise<void>;
  fetch: typeof fetch; pause: (ms: number) => Promise<void>;
};
export async function handlePortalJob(request: Request, deps: Dependencies): Promise<Response> {
  const reply = (status: number, result: string) => Response.json({ result }, { status });
  if (request.method !== 'POST') return reply(405, 'method_not_allowed');
  if (deps.projectUrl !== PRODUCTION_URL) return reply(403, 'non_production');
  const token = request.headers.get('x-game04-job-token');
  if (!token || token.length < 32) return reply(401, 'unauthorized');
  const body = await request.json().catch(() => null);
  if (typeof body?.scheduled_at !== 'string' || !Number.isFinite(Date.parse(body.scheduled_at))) return reply(400, 'invalid_schedule');
  let job;
  try { job = await deps.claim(token, body.scheduled_at); }
  catch { return reply(401, 'job_not_authorized'); }
  if (job.status !== 'claimed' || !job.id) return reply(200, job.status);
  const jobId = job.id;
  try {
    if (!deps.enabled || !deps.apiKey) {
      await deps.finish(jobId, null, { httpStatus: null, result: 'configuration_missing', retry: false });
      return reply(503, 'configuration_missing');
    }
    for (let attempt = 1; attempt <= 2; attempt++) {
      const snapshot = await deps.prepare(jobId, attempt);
      if (snapshot.status !== 'ready') return reply(503, snapshot.status);
      if (!snapshot.id || !Number.isSafeInteger(snapshot.online_count) || snapshot.online_count! < 0
        || !snapshot.counted_at || deps.now() - Date.parse(snapshot.counted_at) > 5_000
        || deps.now() - Date.parse(body.scheduled_at) > 45_000) {
        await deps.finish(jobId, snapshot.id ?? null, { httpStatus: null, result: 'invalid_or_stale_count', retry: false });
        return reply(503, 'invalid_or_stale_count');
      }
      const url = new URL(PORTAL_URL);
      url.searchParams.set('game_key', 'sengoku-hime-ennbu');
      url.searchParams.set('api_key', deps.apiKey);
      url.searchParams.set('online_count', String(snapshot.online_count));
      let outcome: Result;
      try {
        // Never log the URL, response body, or exception (may echo credentials).
        const response = await deps.fetch(url, { method: 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(8_000) });
        await response.body?.cancel();
        outcome = { httpStatus: response.status, result: response.ok ? 'success' : 'http_failed',
          retry: attempt === 1 && [429, 502, 503, 504].includes(response.status) };
      } catch {
        // A timeout can mean the receiver already accepted the request. Do not
        // retry ambiguous delivery without receiver-side idempotency support.
        outcome = { httpStatus: null, result: 'network_or_timeout', retry: false };
      }
      await deps.finish(jobId, snapshot.id, outcome);
      if (!outcome.retry) return reply(outcome.result === 'success' ? 200 : 502, outcome.result);
      await deps.pause(1_000);
      // Re-aggregate before retry; never queue or replay an old count.
    }
    return reply(502, 'http_failed');
  } catch {
    try { await deps.finish(jobId, null, { httpStatus: null, result: 'worker_failed', retry: false }); } catch { /* fixed safe log in entrypoint */ }
    return reply(503, 'worker_failed');
  }
}
