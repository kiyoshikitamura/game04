import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import questData from '@/domain/redesign/data/quest65.json';
import { SCENES } from '@/domain/redesign/tutorial/content';
import { dashboardRange, jstDate, validDate, kpiConnection, type DashboardData, type Period } from '@/domain/redesign/kpi/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const stages = questData.stages.map(s => ({ id: s.id, design_id: s.designId, name: s.name }));
function connection() {
  return kpiConnection({ url: process.env.GAME04_KPI_SUPABASE_URL || 'https://soiksqgtmcnspfedmanr.supabase.co',
    key: process.env.GAME04_KPI_SERVICE_ROLE_KEY });
}
async function readDashboard(origin: string, period: Period, from: string, to: string): Promise<DashboardData> {
  const config = connection();
  if (origin !== config.url) throw new Error('KPI_TARGET_CHANGED');
  const db = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.rpc('game04_kpi_dashboard_v1', { p_from: from, p_to: to, p_period: period, p_stages: stages, p_tutorial_steps: SCENES.length });
  if (error) { console.error('GAME04 KPI RPC failed', { code: error.code }); throw new Error('KPI_QUERY_FAILED'); }
  if (!data || data.stages?.length !== 68 || !Array.isArray(data.rows)) throw new Error('KPI_INVALID_RESPONSE');
  const title = await db.rpc('game04_title_uu_v1', { p_from: from, p_to: to, p_period: period });
  if (title.error) throw new Error('TITLE_KPI_QUERY_FAILED');
  const titleRows = new Map<string, number | null>((title.data?.rows || []).map((row: { key: string; title_uu: number | null }) => [row.key, row.title_uu]));
  return { ...data, rows: data.rows.map((row: DashboardData['rows'][number]) => ({ ...row, title_uu: titleRows.get(row.date) ?? null })),
    title_measured_from: title.data?.measured_from ?? null, environment: config.environment };
}
const cachedRead = unstable_cache(readDashboard, ['game04-kpi-retention-progress-20260930', questData.version, String(SCENES.length)], { revalidate: 60 });
function response(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } }); }
// Public read-only KPI endpoint; proxy restricts hosting to development / Preview.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const period = q.get('period') || 'daily';
  if (period !== 'daily' && period !== 'monthly') return response({ error: '表示期間が不正です。' }, 400);
  const today = jstDate();
  let range: { from: string; to: string };
  try {
    range = dashboardRange(period, q.get('month') || '', today);
    const date = q.get('date');
    if (date) { if (!validDate(date) || date > today || period !== 'daily') throw new Error('Invalid date'); range = { from: date, to: date }; }
  } catch { return response({ error: '日付が不正です。' }, 400); }
  try {
    const config = connection();
    const read = q.get('refresh') === '1' ? readDashboard : cachedRead;
    return response(await read(config.url, period, range.from, range.to));
  } catch {
    return response({ error: 'KPIを取得できませんでした。接続設定と集計関数の適用状況を確認してください。' }, 503);
  }
}
