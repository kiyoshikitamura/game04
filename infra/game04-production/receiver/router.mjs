import healthz from './api/healthz.mjs';
import receiver from './api/receiver.mjs';

export default function router(req, res) {
  let path;
  try { path = new URL(req.url, 'https://receiver.invalid').pathname; }
  catch { return receiver(req, res); }
  return (path === '/healthz' || path === '/api/healthz' ? healthz : receiver)(req, res);
}
