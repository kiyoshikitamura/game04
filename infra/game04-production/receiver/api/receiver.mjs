import { createHash, timingSafeEqual } from 'node:crypto';

// Isolated receiver: no database, game, billing or asset imports.
// M replaces it with a G5 accepted artifact; no environment flag opens gameplay.
export default function receiver(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  let path;
  try { path = new URL(req.url, 'https://receiver.invalid').pathname; }
  catch { res.statusCode = 400; res.end('{}'); return; }
  const health = path === '/healthz' && ['GET', 'HEAD'].includes(req.method);
  const secret = process.env.P06_HEALTH_TOKEN;
  const supplied = req.headers.authorization;
  const digest = (value) => createHash('sha256').update(value).digest();
  const authorized = health && typeof secret === 'string' && secret.length >= 32
    && typeof supplied === 'string'
    && timingSafeEqual(digest(supplied), digest(`Bearer ${secret}`));
  res.statusCode = authorized ? 200 : 503;
  if (!authorized) res.setHeader('Retry-After', '3600');
  const result = authorized
    ? { service: 'game04-production-receiver', receiver: 'ready', game: 'not-installed', database: 'not-connected', billing: 'disabled', jobs: 'absent' }
    : { status: 'unavailable' };
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(result));
}
