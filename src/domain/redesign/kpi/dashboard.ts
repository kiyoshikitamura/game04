export type Period = 'daily' | 'monthly';
export type Retention = { day: number; numerator: number | null; denominator: number | null; value?: number | null; immature?: number };
export type OverviewRow = { date: string; title_uu?: number | null; new_users: number; total_registered: number; active_users: number; tutorial_completed: number; tutorial_rate: number | null; payers: number; revenue: number; payer_rate: number | null; arppu: number | null; arpu: number | null; partial: boolean; retention: Retention[] };
export type StageRow = { id: string; design_id: string; name: string; executions: number; clears: number; clear_rate: number | null };
export type RaidRow = { key: string; kind: 'encounter' | 'unlock'; hosted: number; defeated: number; participants: number };
export type SourceRow = { key: string; source: string; landings: number; landing_starts: number; new_users: number; tutorial_completed: number; retention: Retention[] };
export type DashboardData = { definition_version: string; timezone: string; updated_at: string; environment: string; title_measured_from?: string | null; period: Period; from: string; to: string; rows: OverviewRow[]; stages: StageRow[]; raids: RaidRow[]; sources: SourceRow[]; coverage: { raid_defeat_without_receipt: number; raid_unknown_type: number; stage_unknown_id: number } };
export function jstDate(now = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function dashboardRange(period: Period, month = '', today = jstDate()) {
  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month) || !validDate(`${month}-01`) || month > today.slice(0, 7)) throw new Error('Invalid month');
    const end = new Date(`${month}-01T00:00:00Z`); end.setUTCMonth(end.getUTCMonth() + 1); end.setUTCDate(0);
    return { from: `${month}-01`, to: end.toISOString().slice(0, 10) < today ? end.toISOString().slice(0, 10) : today };
  }
  if (period === 'daily') return { from: addDays(today, -29), to: today };
  const d = new Date(`${today.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() - 11);
  return { from: d.toISOString().slice(0, 10), to: today };
}
export function kpiConnection(config: { url?: string; key?: string }) {
  const url = config.url?.trim();
  const key = config.key?.trim();
  // Dedicated server configuration: never inherit GAME03 or alter gameplay connection settings.
  const allowed = new Map([
    ['https://soiksqgtmcnspfedmanr.supabase.co', '本番'],
  ]);
  if (!url || !key) throw new Error('KPI_CONFIG_MISSING');
  const parsed = new URL(url);
  if (parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password || !allowed.has(parsed.origin)) throw new Error('KPI_TARGET_REJECTED');
  return { url: parsed.origin, key, environment: allowed.get(parsed.origin)! };
}
