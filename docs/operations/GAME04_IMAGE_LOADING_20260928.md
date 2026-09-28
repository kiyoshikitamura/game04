# GAME04 image loading release — 2026-09-28

- Base: `dc8ff8bc0ffceb7205884335156d1e81f77d02ab` (starter promotion production lineage).
- Code: `dc1a8eaa8de94517725436f3bd3474e151e1225c`.
- Branch: `work/game04-image-loading-20260928`.
- Preview: `4dUGhPjBBLvexyuFytyrFohbFsqp` (READY; Next build + TypeScript + common UI + unchanged Edge bundle checks passed).
- Production deployment: `53BNFZ5Tn7niXCSVi1DQTchmU6oB` (READY 2026-09-28 22:10:34 JST; 3m33s).

## Changes

250 presentation images are generated as WebP during prebuild, with resize limits of 640px for portraits and 1080px for other artwork, without enlargement. Original artwork and domain/Edge inputs remain unchanged. Content-derived filenames allow a one-year immutable cache safely; a changed image receives a new URL. Empty development manifest falls back to original URLs.

Title, Home, Growth portraits, shared character displays and battle unit artwork use derivatives. Preload/render URLs match. Opening tutorial waits for current background/cast/formation artwork before rendering and starting timed transitions; failed loads expose retry. Shared artwork preparation now times out after 12 seconds instead of spinning forever.

Server game logic, grants, saved progress, original masters, DB and Edge deployment were not changed. Edge bundle SHA-256 remains `c17af08c5ce6cd4e521a0436f9629e540e4d0beb0846dc916ccf0c85e970a42b`. No changed files belong to the Edge bundle input manifest.

## Validation

- Build transformation: 250 images, 373,213,078 -> 39,218,780 bytes (89.49% smaller in aggregate; this is the asset collection, not initial page traffic).
- Ageha portrait: 1,940,478 -> 74,532 bytes; transparent full artwork: 1,240,374 -> 189,464 bytes; title: 4,017,026 -> 402,706 bytes. Transparent alpha preserved.
- React component tests with controlled image requests/timers: slow Osaka image does not start the 1.4s timer; decoding starts the timer; the next scene waits for its own cast; failure + retry recovers; no progress API call from loading/retry; stalled roster requests time out and recover with crop measurement.
- Preview browser: 375px and 390px cast/background layouts checked. At 375px completed world -> challenge -> Oda -> trailer battle -> need -> Osaka -> name -> recruit -> test -> formation -> ready -> practice battle -> farewell -> complete. All QA data isolated from real play.
- Production predecessor rechecked before deployment: `6EcQDLEfphSk8cYqnLpbEQurfomZ`; base branch still `dc8ff8b`. Latest parallel work retained.

## Scope

This release reduces image payload and makes tutorial loading recoverable. It does not remove every list-wide loading gate or optimize every effect/video/UI asset. Actual user-device network speed is not inferred from the build or the synthetic delayed-image tests.

## Production verification

Public root HTML identifies `dpl_53BNFZ5Tn7niXCSVi1DQTchmU6oB`. All three sampled derivatives return HTTP 200, `image/webp`, expected byte counts and filenames matching the first 24 SHA-256 hex digits of the response bytes. All return `Cache-Control: public, max-age=31536000, immutable`. `/qa/tutorial-opening` returns 404 on production. Production title renders successfully. Deployment proof: `GAME04_IMAGE_LOADING_20260928.jpg`.
