# Event promotion — 2026-09-29

User authorized Production publication and image/loading optimization.
Base f72a119 (code identical to Production f9e93fe, plus release record). Production rechecked at dpl_9gyyjf3kSkUJSyVdx5yCn8yq2cYn.

- CanonicalDialog with approved logo-free artwork. No gameplay, DB, API or reward mutations.
- Same login receipt version/date + tutorial loginEligible criteria as login bonus. Event-specific owner/date session receipt, recorded only after dialog mount. Existing login bonus receipts never suppress this notice.
- Shared HomePromotion priority waits for login bonus/guide/other dialogs; initial game load has no new required image.
- Server synchronized event clock: preview on 9/29, text-only active state at 21:00, hidden at 24:00, including while open.
- Source PNG remains on marketing branch 30ec315. Display WebP 1080x565: 176600 bytes vs 2661037 bytes (-93.36%). Content hash URL uses existing one-year immutable display-images headers.
- Deferred decode before display; cached preload and displayed URL identical. 8s failure falls back to complete text, not a broken image or indefinite spinner.
- Preview-only fixture /qa/event-promotion renders 375/390px frames; Production returns 404. No real account/DB actions in fixture.
- npm run check (typecheck + prebuild + production build with VERCEL_ENV=preview): PASS before fixture addition; final merged Preview and Production builds also succeeded.

## Verified release candidate

- Published implementation c495d78006b6af5a758782aed2fc673a6845cbef; integrated release f2b13dd4b7225766362cbe80087b08e65738469d.
- Parallel 63588a4f60e81bb8a1f13f32f21f0ccd7df152be is a merge parent. Retained starter/free promotion WebP generation, loading/error/retry UI, server lease refresh and acknowledgement-after-ready behavior.
- Combined TypeScript check PASS; isolated RPC-mocked existing promotion lifecycle PASS (slow image, error/retry, delayed decode, single acknowledgement, close suppression).
- New event files scoped ESLint PASS. 8 event boundary/disabled cases PASS.
- Browser on c495d78 Preview: 375/390x667 screenshots PASS; login dialog blocks announcement until closed; preview image decoded/rendered; 21:00 live transition removes outdated preview image and updates title; 24:00 closes dialog; closing and returning home does not reopen it.
- Browser log sample contains extension metadata errors only; no app error observed.
- Screenshot mobile-375-390.jpg shows both widths without clipping. Authenticated Preview asset cannot be checked with unauthenticated curl (302); Production delivery verified below.

## Production release confirmed

- Ready at 2026-09-29 03:21:39 UTC / 12:21:39 JST; build duration 3m16s.
- Deployment: dpl_Bsjb4kGpKQrmHjCTiBfUbo99Z2wc, Environment Production, current domain https://sengoku-hime-ennbu.com.
- Source: f2b13dd4b7225766362cbe80087b08e65738469d. Public root HTML deployment ID matches this release.
- Event WebP: HTTP 200, image/webp, 176600 bytes; byte-for-byte identical to committed asset. Cache-Control: public, max-age=31536000, immutable.
- Asset SHA-256: 57d17846225252b745ca3b203a1ec99bf3e0d12ab30ceae786cf3fe81a701584.
- Production QA fixture: HTTP 404 as intended.
- Final merged f2b13dd Preview also checked at both 375/390px; attached screenshot is from this final Preview fixture. This is fixture verification, not a real Production user's login/reward execution.
- Existing repository-wide lint findings remain non-blocking; only the new event files' scoped lint is claimed clean.
