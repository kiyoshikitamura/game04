import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Execute the actual effect body with a small browser/hook harness.
const source = readFileSync(new URL('../src/app/admin/kpi/game04/Game04KpiDashboard.tsx', import.meta.url), 'utf8');
const body = source.split('  useEffect(() => {')[1].split('  }, [period, month, fixedDate, revision]);')[0];
assert.ok(body && body.includes('lastRequestedRevision.current'));
const urls = [];
const lastRequestedRevision = { current: 0 };
const run = new Function('period', 'month', 'fixedDate', 'revision', 'lastRequestedRevision', 'fetch', 'setLoading', 'setError', 'setData', body);
const fetch = async url => { urls.push(url); return { ok: true, json: async () => ({ rows: [], stages: [] }) }; };
const noop = () => {};
const cases = [
  ['daily', '', undefined, 0, false],
  ['daily', '', undefined, 0, false], // Strict Mode mount replay
  ['daily', '', undefined, 1, true],
  ['monthly', '', undefined, 1, false],
  ['daily', '2026-09', undefined, 1, false],
  ['daily', '2026-09', undefined, 2, true],
  ['daily', '', '2026-09-28', 2, false],
  ['daily', '', '2026-09-28', 3, true],
];
for (const [period, month, date, revision, refresh] of cases) {
  const cleanup = run(period, month, date, revision, lastRequestedRevision, fetch, noop, noop, noop);
  assert.equal(new URL(urls.at(-1), 'https://example.test').searchParams.has('refresh'), refresh);
  cleanup();
}
console.log(`PASS: ${cases.length} refresh/cache transitions`);
