import { createHash, timingSafeEqual } from 'node:crypto';
import unavailable from './receiver.mjs';

// A dedicated function avoids depending on URL preservation across Vercel rewrites.
// Both /healthz and direct /api/healthz require the same server-only token.
export default function healthz(req, res) {
  const secret = process.env.P06_HEALTH_TOKEN;
  const supplied = req.headers.authorization;
  const digest = value => createHash('sha256').update(value).digest();
  const authorized = ['GET', 'HEAD'].includes(req.method)
    && typeof secret === 'string' && secret.length >= 32
    && typeof supplied === 'string'
    && timingSafeEqual(digest(supplied), digest(`Bearer ${secret}`));
  if (!authorized) return unavailable(req, res);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = 200;
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify({
    service: 'game04-production-receiver', receiver: 'ready', game: 'not-installed',
    database: 'not-connected', billing: 'disabled', jobs: 'absent',
  }));
}
