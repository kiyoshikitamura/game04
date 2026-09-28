import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createActivityBuffer, isManualGameInput } from '../src/domain/redesign/portalActivity.ts';
import { handlePortalJob, PRODUCTION_URL } from '../supabase/functions/game04-portal-online/core.ts';

let now = 0, sends = 0, nextId = 0;
const timers = new Map();
const buffer = createActivityBuffer({ now: () => now, send: () => sends++,
  schedule: (fn, delay) => { const id = ++nextId; timers.set(id, { fn, at: now + delay }); return id; },
  cancel: id => timers.delete(id) });
function advance(ms) { now += ms; for (const [id, t] of [...timers]) if (t.at <= now) { timers.delete(id); t.fn(); } }
buffer.input(); assert.equal(sends, 1);
advance(100); buffer.input(); advance(100); buffer.input(); advance(999); assert.equal(sends, 1);
advance(1); assert.equal(sends, 2, 'last input is flushed');
advance(300_000); assert.equal(sends, 2, 'idle timers do not extend presence');
buffer.input(); advance(100); buffer.input(); buffer.flush(); assert.equal(sends, 4, 'pagehide flushes pending input');
buffer.input(); now += 30_000; buffer.flush(); assert.equal(sends, 4, 'suspended input is not replayed');
assert.equal(isManualGameInput({ isTrusted: false, type: 'click' }, true), false);
for (const type of ['visibilitychange', 'focus', 'poll', 'mousemove']) assert.equal(isManualGameInput({ isTrusted: true, type }, true), false);
assert.equal(isManualGameInput({ isTrusted: true, type: 'click' }, false), false);
assert.equal(isManualGameInput({ isTrusted: true, type: 'click' }, true), true);
assert.equal(isManualGameInput({ isTrusted: true, type: 'keydown', key: 'Enter' }, true), true);

const epoch = Date.parse('2026-09-28T00:00:00Z');
const req = (headers = { 'x-game04-job-token': 'unit-test-token-is-not-a-real-secret' }) => new Request('https://worker.invalid', {
  method: 'POST', headers, body: JSON.stringify({ scheduled_at: new Date(epoch).toISOString() }) });
let calls, audits, prepares;
const setup = (overrides = {}) => {
  calls = []; audits = []; prepares = 0;
  return {
    projectUrl: PRODUCTION_URL, enabled: true, apiKey: 'unit-test-only-key', now: () => epoch,
    claim: async () => ({ status: 'claimed', id: 'job' }),
    prepare: async () => { prepares++; return { status: 'ready', id: 'attempt', online_count: 0, counted_at: new Date(epoch).toISOString() }; },
    finish: async (...args) => audits.push(args), pause: async () => {},
    fetch: async (url, options) => { calls.push({ url, options }); return new Response(null, { status: 200 }); },
    ...overrides,
  };
};
assert.equal((await handlePortalJob(req(), setup())).status, 200);
assert.equal(calls.length, 1); assert.equal(calls[0].url.searchParams.get('online_count'), '0');
assert.equal(calls[0].options.method, 'GET'); assert.equal(calls[0].options.redirect, 'error');
assert.equal(calls[0].url.searchParams.get('game_key'), 'sengoku-hime-ennbu');
assert.equal((await handlePortalJob(req(), setup({ projectUrl: 'https://preview.supabase.co' }))).status, 403); assert.equal(calls.length, 0);
assert.equal((await handlePortalJob(req({}), setup())).status, 401); assert.equal(prepares, 0);
await handlePortalJob(req(), setup({ claim: async () => { throw new Error('unauthorized'); } })); assert.equal(calls.length, 0);
await handlePortalJob(req(), setup({ apiKey: undefined })); assert.equal(calls.length, 0); assert.equal(audits[0][2].result, 'configuration_missing');
await handlePortalJob(req(), setup({ prepare: async () => ({ status: 'aggregation_failed' }) })); assert.equal(calls.length, 0);
await handlePortalJob(req(), setup({ prepare: async () => { throw new Error('db failed'); } })); assert.equal(calls.length, 0);
for (const status of ['duplicate', 'stale']) { await handlePortalJob(req(), setup({ claim: async () => ({ status }) })); assert.equal(calls.length, 0); }
await handlePortalJob(req(), setup({ now: () => epoch + 60_000 })); assert.equal(calls.length, 0);
await handlePortalJob(req(), setup({ fetch: async () => { throw new Error('https://secret.invalid/?api_key=must-not-leak'); } }));
assert.equal(prepares, 1); assert.equal(audits[0][2].result, 'network_or_timeout'); assert.ok(!JSON.stringify(audits).includes('must-not-leak'));
let attempt = 0;
await handlePortalJob(req(), setup({ fetch: async (url) => { calls.push(url); return new Response(null, { status: ++attempt === 1 ? 503 : 200 }); } }));
assert.equal(calls.length, 2); assert.equal(prepares, 2, 'retry counts again');
attempt = 0;
await handlePortalJob(req(), setup({ fetch: async (url) => { calls.push(url); return new Response(null, { status: 503 }); } }));
assert.equal(calls.length, 2, 'limited to two attempts');
await handlePortalJob(req(), setup({ fetch: async (url) => { calls.push(url); return new Response(null, { status: 401 }); } })); assert.equal(calls.length, 1);
const page = readFileSync('src/app/page.tsx','utf8');
assert.match(page, /usePortalActivity\(.*!game.showTitleView/);
const route = readFileSync('src/app/api/portal/activity/route.ts','utf8');
assert.match(route, /VERCEL_ENV !== 'production'/);
assert.ok(!route.includes('POCHI_PORTAL_API_KEY'));
assert.ok(!readFileSync('src/utils/portalActivity.ts','utf8').includes('POCHI_PORTAL_API_KEY'));
console.log('PASS: input/trailing/idle/background/suspended; zero/failure/auth/preview/stale/duplicate/retry/redaction');
