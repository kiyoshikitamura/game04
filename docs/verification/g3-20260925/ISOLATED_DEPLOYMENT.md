# G3 isolated deployment — final candidate 2026-09-25

## Saved candidate

- Draft PR: https://github.com/kiyoshikitamura/game04/pull/33
- Final implementation SHA: `c47c1f4d92e331802ef350df940b47e3b7b6e0c3` (API CORS-only follow-up).
- Browser client SHA: `7f8956ec0fb75d743f2849714056b1396c282bb8`; client files are identical in c47c1f4.
- Final tree: `6793993867ec7e462ec2c7670261bc916a8267a6` (local `7c9b985` tree identical; remote diff 0). Client snapshot tree `5436f688d92ef8b864ce83e8c98b8e73f74f8002`.
- Vercel: `dpl_3axt1TdAHZnS48Gib9MNRkU7jpRd`, **Preview**, Ready, 58s build.
- Immutable Preview: https://game04-942ioj0ag-kiyoshi-kitamura.vercel.app/
- Deployment: https://vercel.com/kiyoshi-kitamura/game04/3axt1TdAHZnS48Gib9MNRkU7jpRd
- Supabase: `znakrkaazliexzwihxge` / `game04-g3-acceptance` / EU/Micro / approved monthly equivalent USD10.
- API v3 ACTIVE / verify_jwt=true / management ezbr `f0e4aa527baf6cf0cf0c49cb81f154486ff5d4b1170ba45f1feea388dfadc679`.
- Source SHA256: `57be17cef08185ced05e92bf9650e119ffb193b65d31d9d149d31370f2036975`.
- Tracked index SHA256: `7f8899d51de1bc0b3708c66c0eaa1fb063f0a3064721bb48f08b57a59bc304d3`.
- Minified artifact SHA256 (file with trailing LF): `f1cc9cd973108520268177a9cdfc4e0786a663c238133e2404f9772a6ea340a1`; deploy tool input removes trailing LF. Management digest above is independent service digest.
- DB assets/apply order: `supabase/isolated/g3/manifest.json`, `APPLY_ORDER.txt`.

The implementation commit contains 16 changed blobs; all uploaded SHA/readbacks match local Git. Large index 1,792,043 bytes transferred in chunks, no truncated bundle. Local build required isolated URL build configuration; its first missing-env stop is recorded, then Next16.2.10/TypeScript/28-page build passed. Vercel actual Preview build also passed.

## Actual acceptance and correction history

1. Initial a14f Preview `game04-6pzqsgof9-kiyoshi-kitamura.vercel.app`: anonymous Auth disabled; recorded FAIL, never PASS.
2. User configured isolated anonymous Auth and branch-only service key, reported done at 18:59 JST. Sentinel inheritance block replaced by actual isolated key; no key values recorded.
3. a14f redeploy `dpl_GSx8QxmmQfYE6yMrqjunACsapDJs` / https://game04-6e1a3d50y-kiyoshi-kitamura.vercel.app/ Ready. Actual anonymous identities A/B authenticated successfully.
4. Actual initial reads found missing room/territory/guild dependencies. Limited DB assets14–17 applied only to isolated project.
5. API v1 functional suite9 PASS, real browser free10/reload receipt restore PASS. Performance FAIL, not waived.
6. G3 read-path overlap/duplicate-read removal + client EU region routing saved and API v2 deployed. Fixed-ID replay regression retained exact results; function/edge logs identify cold pre-invocation delay. Warm725–1315ms, cold9444–14139ms; performance remains FAIL.
7. Final client candidate 7f8956e deployed at above immutable URL. Actual browser found missing x-region CORS permission; API-only c47c1f4/v3 fixes it. Browser read and new mutation succeeded after v3. Final UI validation is recorded in `BROWSER_ISOLATED_ACCEPTANCE.md`.
8. Fixture writers removed by `12_lock_fixture_generators.sql`. `90_verify.sql` PASS; evidence `isolated-final-90-gate.json`.

## Scope and lifecycle

This is G3 standalone acceptance. See [RESULT.md](RESULT.md) for specification mapping, actual remaining items and completion proposal; [ISOLATED_DB_RECONCILIATION.md](ISOLATED_DB_RECONCILIATION.md) for receipt/inventory/KPI proof. Refresh and anonymous reload do not replace credential-login acceptance. QA-only initializer is not G4 tutorial/starter supply.

Root's isolated write window began with project creation at 2026-09-25T09:02:26.735333Z; final implementation deployment was Ready at 10:25:20Z. API v2 deployed at 10:18:55Z; final API v3 at 10:30:08Z. Final evidence save marks the end of G3 writes and handoff. No exclusive control over old dev was assumed.

Handoff destination: G3 PR33, G2 PR30 integration owner, final decision in main progress chat. Retain the isolated project for pending G2 same-candidate integration; initial review2026-09-28 JST, monthly equivalent USD10 plus usage/tax. Do not stop before downstream use is confirmed complete. No G2 default-OFF performance candidate, existing-dev write, main merge or Production deployment by this task.

## End of write window

2026-09-25 19:34 JST: final API v3 active, C browser mutation/reload/end/ack complete, 3 QA users and one C free10 receipt reconciled; no further DB/API writes planned in this task. Final records saved to PR33 for G2 handoff. Actual preflight evidence `cors-preflight-isolated-v3.json`, final C receipt evidence `isolated-final-c.json`.
