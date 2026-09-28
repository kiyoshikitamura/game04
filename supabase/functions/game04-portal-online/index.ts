import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { handlePortalJob } from './core.ts';

Deno.serve(async (request: Request) => {
  const projectUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const service = createClient(projectUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(5_000) }) },
  });
  const response = await handlePortalJob(request, {
    projectUrl, enabled: Deno.env.get('POCHI_PORTAL_ENABLED') === 'true', apiKey: Deno.env.get('POCHI_PORTAL_API_KEY'),
    now: Date.now, fetch, pause: ms => new Promise(resolve => setTimeout(resolve, ms)),
    claim: async (token, scheduledAt) => {
      const { data, error } = await service.rpc('game04_claim_portal_job', { p_token: token, p_scheduled_at: scheduledAt });
      if (error) throw new Error('claim_failed');
      return data;
    },
    prepare: async (job, attempt) => {
      const { data, error } = await service.rpc('game04_prepare_portal_attempt', { p_job_id: job, p_attempt: attempt });
      if (error) throw new Error('aggregation_failed');
      return data;
    },
    finish: async (job, attempt, result) => {
      const finished_at = new Date().toISOString();
      if (attempt) {
        const { error } = await service.from('game04_portal_attempts').update({
          finished_at, http_status: result.httpStatus, result: result.result,
        }).eq('id', attempt).eq('job_id', job);
        if (error) throw new Error('audit_failed');
      }
      const { error } = await service.from('game04_portal_jobs').update({
        finished_at: result.retry ? null : finished_at, http_status: result.httpStatus, result: result.result,
        status: result.retry ? 'retry' : result.result === 'success' ? 'success' : 'failed',
      }).eq('id', job);
      if (error) throw new Error('audit_failed');
    },
  });
  console.log(JSON.stringify({ event: 'game04_portal_job', http_status: response.status }));
  return response;
});
