/** Explicit, QA-only observation channel. No payloads, resource URLs or user identifiers. */
export type QaMetric = {
  kind: 'request' | 'image-group' | 'action-feedback' | 'action-result'; scope: string; count?: number;
  startedAt: number; settledAt: number; durationMs: number; outcome: 'success' | 'error';
};
export type QaTimingMessage = {
  type: 'game04-qa-timing'; timeOrigin: number; metric: QaMetric;
  navigation: { type: string; responseStart: number; responseEnd: number; domContentLoaded: number } | null;
  paints: { name: string; startTime: number }[];
};
export function qaTimingEnabled() {
  return process.env.NEXT_PUBLIC_GAME04_QA_METRICS_ALLOWED === 'true'
    && process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS === 'true'
    && process.env.NEXT_PUBLIC_APP_ENV !== 'production';
}
const requestScopes = new Set(['get_state','save_deck','set_home','save_home','character_level','character_awaken','character_unlock','soul_exchange','soul_select','skill_level','equipment_level','equipment_lb','equipment_lock','equipment_dismantle','quest_battle','raid_battle','raid_claim','territory_host','claim_mission','shop_exchange','use_energy_drink','encounter_ignore','encounter_host','raid_join','raid_host','normal_gacha']);
export function emitQaTiming(metric: QaMetric) {
  if (!qaTimingEnabled() || typeof window === 'undefined' || window.parent === window || typeof performance === 'undefined') return;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const message: QaTimingMessage = {
    type: 'game04-qa-timing', timeOrigin: performance.timeOrigin,
    metric: { kind: metric.kind, scope: (metric.kind !== 'image-group' ? requestScopes : new Set(['home','growth','quest','battle'])).has(metric.scope) ? metric.scope : 'other', ...(metric.count === undefined ? {} : { count: metric.count }), startedAt: metric.startedAt, settledAt: metric.settledAt, durationMs: metric.durationMs, outcome: metric.outcome },
    navigation: navigation ? { type: navigation.type, responseStart: navigation.responseStart, responseEnd: navigation.responseEnd, domContentLoaded: navigation.domContentLoadedEventEnd } : null,
    paints: performance.getEntriesByType('paint').filter(entry => entry.name === 'first-paint' || entry.name === 'first-contentful-paint').map(({ name, startTime }) => ({ name, startTime })),
  };
  window.parent.postMessage(message, window.location.origin);
}
export function beginQaImageGroup(scope: 'home' | 'growth' | 'quest' | 'battle', count: number) {
  const startedAt = typeof performance === 'undefined' ? 0 : performance.now();
  return (outcome: 'success' | 'error') => {
    if (typeof performance === 'undefined' || count === 0) return;
    const settledAt = performance.now();
    emitQaTiming({ kind: 'image-group', scope, count, startedAt, settledAt, durationMs: settledAt - startedAt, outcome });
  };
}
/** Message channel/source is checked by the caller before this shape guard. */
export function isQaTimingMessage(value: unknown): value is QaTimingMessage {
  if (!value || typeof value !== 'object') return false;
  const v = value as QaTimingMessage, m = v.metric;
  return v.type === 'game04-qa-timing' && Number.isFinite(v.timeOrigin) && !!m
    && ['request','image-group','action-feedback','action-result'].includes(m.kind) && typeof m.scope === 'string' && /^[a-z_]{1,48}$/.test(m.scope)
    && ['success','error'].includes(m.outcome) && [m.startedAt,m.settledAt,m.durationMs].every(n => Number.isFinite(n) && n >= 0)
    && (m.count === undefined || Number.isSafeInteger(m.count) && m.count >= 0)
    && (v.navigation === null || !!v.navigation && typeof v.navigation.type === 'string' && [v.navigation.responseStart,v.navigation.responseEnd,v.navigation.domContentLoaded].every(Number.isFinite))
    && Array.isArray(v.paints) && v.paints.length <= 2 && v.paints.every(p => !!p && typeof p === 'object' && ['first-paint','first-contentful-paint'].includes(p.name) && Number.isFinite(p.startTime));
}
export function appendQaTiming(current: QaTimingMessage[], message: QaTimingMessage) {
  return [...(current.length && current[0].timeOrigin !== message.timeOrigin ? [] : current).slice(-199), message];
}

export function acceptsQaTimingEvent(event: Pick<MessageEvent, 'origin' | 'source' | 'data'>, origin: string, source: Window | null | undefined): boolean {
  return !!source && event.origin === origin && event.source === source && isQaTimingMessage(event.data);
}
