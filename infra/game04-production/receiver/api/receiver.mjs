// This isolated receiver deliberately has no database, game, billing or asset imports.
// It cannot be opened by an environment flag. M must replace it with a G5 accepted artifact.
export default function receiver(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = 503;
  res.setHeader('Retry-After', '3600');
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'unavailable' }));
}
