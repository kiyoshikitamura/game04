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
- npm run check (typecheck + prebuild + production build with VERCEL_ENV=preview): PASS before fixture addition; final typecheck/build follows.
