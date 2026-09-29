import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { validOnline } from '@/utils/titleOnline';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Reuse the portal's saved five-minute aggregation. Never query activity or send to the portal.
const readSnapshot = unstable_cache(async (_slot: number) => {
  void _slot; // Included in the persistent cache key, not in the DB query.
  const url = process.env.GAME04_KPI_SUPABASE_URL || 'https://soiksqgtmcnspfedmanr.supabase.co';
  const key = process.env.GAME04_KPI_SERVICE_ROLE_KEY
    || (process.env.VERCEL_ENV === 'production' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);
  if (url !== 'https://soiksqgtmcnspfedmanr.supabase.co' || !key) throw new Error('Online unavailable');
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.from('game04_portal_attempts').select('online_count,sent_at')
    .order('sent_at', { ascending: false }).limit(1).abortSignal(AbortSignal.timeout(4000)).maybeSingle();
  if (error || !data) throw new Error('Online unavailable');
  return { count: Number(data.online_count), countedAt: data.sent_at as string };
}, ['game04-title-portal-snapshot-v1'], { revalidate: 300 });

export async function GET(request: NextRequest) {
  const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  // Only Preview/local accepts fixtures. Production ignores the parameter entirely.
  const fixture = request.nextUrl.searchParams.get('fixture');
  if ((process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') && fixture !== null) {
    if (fixture === 'error') return reply({ count: null, countedAt: null, fixture: true }, 503);
    if (/^(29|30|39|40|99|100|127)$/.test(fixture)) return reply({ count: Number(fixture), countedAt: new Date().toISOString(), fixture: true });
  }
  try {
    // Portal cron/retry has up to 45s; align cache turnover after that window.
    const data = await readSnapshot(Math.floor((Date.now() - 45_000) / 300_000));
    if (!validOnline(data)) throw new Error('Stale snapshot');
    return reply(data);
  } catch { return reply({ count: null, countedAt: null }, 503); }
}
