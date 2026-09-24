import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import receiver from '../api/receiver.mjs';

test('network requests cannot reach game, payment, assets or unauthenticated health', async () => {
  const server = createServer(receiver);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const key = 'fixture-only-health-token-01234567890123456789';
  const previous = process.env.P06_HEALTH_TOKEN;
  try {
    delete process.env.P06_HEALTH_TOKEN;
    assert.equal((await fetch(`${origin}/healthz`)).status, 503);
    process.env.P06_HEALTH_TOKEN = key;
    for (const path of ['/', '/healthz', '/api/billing/checkout', '/api/billing/webhook', '/functions/v1/game04-redesign-api', '/_next/static/a.js', '/qa/redesign', '/api/receiver']) {
      for (const method of ['GET', 'POST', 'HEAD', 'OPTIONS']) {
        const response = await fetch(origin + path, { method });
        assert.equal(response.status, 503, `${method} ${path}`);
        assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
      }
    }
    assert.equal((await fetch(`${origin}/healthz`, {headers:{authorization:'Bearer wrong'}})).status, 503);
    const good = await fetch(`${origin}/healthz`, {headers:{authorization:`Bearer ${key}`}});
    assert.equal(good.status, 200);
    assert.equal((await good.json()).database, 'not-connected');
    assert.equal((await fetch(`${origin}/api/billing/checkout`, {method:'POST', headers:{authorization:`Bearer ${key}`}})).status, 503);
    process.env.P06_HEALTH_TOKEN = 'short';
    assert.equal((await fetch(`${origin}/healthz`, {headers:{authorization:'Bearer short'}})).status, 503);
  } finally {
    if (previous === undefined) delete process.env.P06_HEALTH_TOKEN; else process.env.P06_HEALTH_TOKEN = previous;
    await new Promise(resolve => server.close(resolve));
  }
});
