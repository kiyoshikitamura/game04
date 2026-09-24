import { emitQaTiming } from './redesignQaTelemetry';
/** Browser-local diagnostics only. Never records payloads, balances, IDs or tokens. */
export interface RedesignRequestMetric {
  action: string;
  startedAt: number;
  settledAt: number;
  durationMs: number;
  outcome: 'success' | 'error';
}

declare global {
  interface Window {
    __GAME04_REQUEST_METRICS__?: RedesignRequestMetric[];
  }
}

export function beginRedesignRequestMetric(action: string) {
  const startedAt = typeof performance === 'undefined' ? 0 : performance.now();
  return (outcome: RedesignRequestMetric['outcome']) => {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return;
    const settledAt = performance.now();
    // Same performance time origin as Navigation/Resource Timing and image metrics.
    // Includes auth/session work + transport + response validation, not server-only time.
    window.__GAME04_REQUEST_METRICS__ = [
      ...(window.__GAME04_REQUEST_METRICS__ || []).slice(-99),
      { action, startedAt, settledAt, durationMs: settledAt - startedAt, outcome },
    ];
    emitQaTiming({ kind: 'request', scope: action, startedAt, settledAt, durationMs: settledAt - startedAt, outcome });
    // The managed QA browser exposes console records but not Performance in its
    // read-only DOM scope. Keep this output explicitly limited to QA builds.
    if (process.env.NEXT_PUBLIC_ENABLE_QA_TOOLS === 'true' && process.env.NEXT_PUBLIC_APP_ENV !== 'production') {
      const request = window.__GAME04_REQUEST_METRICS__.at(-1);
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      console.info('[GAME04 request timing]', JSON.stringify({
        request,
        navigation: navigation ? {
          type: navigation.type,
          responseStart: navigation.responseStart,
          responseEnd: navigation.responseEnd,
          domContentLoaded: navigation.domContentLoadedEventEnd,
        } : null,
        paints: performance.getEntriesByType('paint').map(({ name, startTime }) => ({ name, startTime })),
      }));
    }
  };
}
