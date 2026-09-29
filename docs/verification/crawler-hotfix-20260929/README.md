# Production crawler hotfix — 2026-09-29

User authorized urgent Production repair after X ad rejection. No claim that robots caused the content-policy rejection.

Baseline Production: 7906eb36717d298e14be919065e375b404a910d7 / dpl_54ehozXSg2ZnWUCp1a1t5yHSAkRf.
Observed at public domain: Twitterbot and standard requests returned HTTP 200; robots.txt disallowed / and HTML contained noindex,nofollow,noarchive.
Root cause: src/app/crawlerMetadata.ts isVercelProduction unconditionally returned false (legacy dev-only setting). It was already present before the latest CSS work.

Fix 2a23d5a1b9781590dfb49624a7d7d9222e91db2b changes only that function. Explicit VERCEL_ENV wins; production is allowed, preview/development denied; non-Vercel builds fall back to NEXT_PUBLIC_APP_ENV. Seven environment combinations PASS. Existing robots, sitemap and layout use this shared function.
Production rebuilt using Production environment with build cache disabled. Never promote the Preview artifact: its static metadata is intentionally noindex.

Future releases must retain this commit and verify public robots.txt allows /, root HTML has index,follow and no X-Robots-Tag denial. Check Twitterbot HTTP 200 and OGP asset availability after alias assignment.

Production READY 2026-09-29 17:43:08 JST: dpl_3wUvuGx6xxfoVY2qeJDU1SDakq6A. Live Twitterbot checks: robots Allow /; root index,follow; no X-Robots-Tag denial; root/robots/sitemap/OGP all HTTP200. Root deployment ID matches this release.
