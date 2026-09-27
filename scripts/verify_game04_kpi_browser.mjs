// UI fixtures are display tests, not evidence of a live API connection.
// Start Next locally with NEXT_PUBLIC_USE_MOCK_DB=true and the local-only Basic auth below.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, request } from '@playwright/test';
const origin = process.env.KPI_TEST_ORIGIN || 'http://127.0.0.1:3317';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw new Error('Local-only verification');
const output = 'docs/verification/kpi-20260927';
fs.mkdirSync(output, { recursive: true });
const quests = JSON.parse(fs.readFileSync('src/domain/redesign/data/quest65.json', 'utf8'));
const credentials = { username: 'kpi-local', password: 'local-verification-only' };
const anonymous = await request.newContext();
assert.equal((await anonymous.get(`${origin}/admin/kpi`)).status(), 401);
assert.equal((await anonymous.get(`${origin}/api/admin/kpi/game04`)).status(), 401);
await anonymous.dispose();
const api = await request.newContext({ httpCredentials: credentials });
assert.equal((await api.get(`${origin}/api/admin/kpi/game04?period=invalid`)).status(), 400);
assert.equal((await api.get(`${origin}/api/admin/kpi/game04?date=2026-02-30`)).status(), 400);
assert.equal((await api.get(`${origin}/api/admin/kpi/game04`)).status(), 503, 'Unconfigured server must fail closed');
await api.dispose();
const localChromium = process.env.KPI_TEST_CHROMIUM_MODULE ? (await import(process.env.KPI_TEST_CHROMIUM_MODULE)).default : null;
const browser = await chromium.launch({ headless: true, ...(localChromium ? { executablePath: await localChromium.executablePath(), args: localChromium.args } : {}) });
const context = await browser.newContext({ httpCredentials: credentials, viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
let fail = false;
let lastQuery = '';
await page.route('**/api/admin/kpi/game04?*', async route => {
  lastQuery = route.request().url();
  if (fail) return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: '表示テスト：一時的に取得できません。' }) });
  const q = new URL(lastQuery).searchParams;
  const monthly = q.get('period') === 'monthly';
  const dates = q.get('date') ? [q.get('date')] : monthly ? ['2026-09', '2026-08'] : ['2026-09-27', '2026-09-26'];
  const retention = [1, 2, 3, 4, 5].map(day => ({ day, numerator: 2, denominator: 4, immature: 0 }));
  const data = { definition_version: 'ui-fixture', timezone: 'Asia/Tokyo', updated_at: '2026-09-27T03:00:00Z', environment: '検証（表示テスト）', period: monthly ? 'monthly' : 'daily', from: '2026-09-01', to: '2026-09-27',
    rows: dates.map(date => ({ date, new_users: 10, total_registered: 1234, active_users: 120, tutorial_completed: 8, tutorial_rate: .8, payers: 4, revenue: 12000, payer_rate: 4 / 120, arppu: 3000, arpu: 100, partial: true, retention })),
    stages: quests.stages.map((s, i) => ({ id: s.id, design_id: s.designId, name: s.name, executions: i === 0 ? 4 : 0, clears: i === 0 ? 2 : 0, clear_rate: i === 0 ? .5 : null })),
    raids: dates.flatMap(key => ['encounter', 'unlock'].map(kind => ({ key, kind, hosted: 4, defeated: 2, participants: 12 }))),
    sources: dates.flatMap(key => ['meta', 'x', 'organic', 'direct', 'unknown'].map(source => ({ key, source, landings: 20, landing_starts: 10, new_users: 10, tutorial_completed: 8, retention }))),
    coverage: { stage_unknown_id: 0, raid_unknown_type: 0, raid_defeat_without_receipt: 0 } };
  return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
});
try {
  await page.goto(`${origin}/admin/kpi`);
  await page.getByRole('heading', { name: '基本指標・継続率' }).waitFor();
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0);
  assert.equal(await page.getByText(/Guild加入率|Raid Point消化率|Social Active率/).count(), 0);
  await page.screenshot({ path: `${output}/overview-desktop.png` });
  for (const width of [375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole('button', { name: 'ステージ状況', exact: true }).click();
    assert.equal(await page.locator('tbody tr').count(), 68);
    assert.equal(await page.locator('tbody tr').first().locator('td').last().innerText(), '50.0%');
    assert.equal(await page.locator('tbody tr').last().locator('td').last().innerText(), '—');
    assert.equal(await page.evaluate(() => document.querySelector('.g4-kpi').scrollWidth <= innerWidth), true, 'No page-level horizontal overflow');
    await page.screenshot({ path: `${output}/stages-${width}.png` });
    await page.getByRole('button', { name: 'レイド', exact: true }).click();
    await page.getByRole('columnheader', { name: 'エンカウント', exact: true }).waitFor();
    await page.getByRole('columnheader', { name: 'アンロック', exact: true }).waitFor();
    await page.locator('.g4-kpi-table').evaluate(node => node.scrollLeft = node.scrollWidth);
    assert.equal(await page.locator('.g4-kpi-table').evaluate(node => node.scrollLeft > 0), true);
    await page.screenshot({ path: `${output}/raids-${width}.png` });
  }
  await page.getByRole('button', { name: '月別', exact: true }).click();
  await page.getByRole('button', { name: '2026-09', exact: true }).waitFor();
  assert.match(lastQuery, /period=monthly/);
  await page.getByRole('button', { name: '2026-09', exact: true }).click();
  await page.getByRole('link', { name: '2026-09-27', exact: true }).waitFor();
  assert.match(lastQuery, /month=2026-09/);
  await page.getByRole('button', { name: '流入元', exact: true }).click();
  assert.equal(await page.locator('tbody tr').count(), 10);
  fail = true;
  await page.getByRole('button', { name: '再集計', exact: true }).click();
  await page.getByRole('alert').waitFor();
  await page.screenshot({ path: `${output}/error-390.png` });
  fail = false;
  await page.getByRole('button', { name: '再試行', exact: true }).click();
  await page.getByRole('heading', { name: '流入元別の獲得・継続' }).waitFor();
  await page.getByRole('button', { name: '概況', exact: true }).click();
  await page.getByRole('link', { name: '2026-09-27', exact: true }).click();
  await page.getByText('2026-09-27 の集計', { exact: true }).waitFor();
  await page.getByRole('heading', { name: '基本指標・継続率' }).waitFor();
  assert.match(lastQuery, /date=2026-09-27/);
  assert.equal(await page.getByRole('button', { name: '月別', exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS Basic auth, invalid input, missing config, 68 rows, rates, raid types, monthly drilldown, sources, retry, day detail, 375/390px layout, no page errors');
} finally { await browser.close(); }
