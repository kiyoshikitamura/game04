# GAME04 KPI dashboard — 2026-09-27

## Scope and integration

- User clarification (2026-09-27 20:47 JST): this is an internal tool hosted in development / Preview, not a production-facing dashboard. The KPI proxy returns 404 for every KPI page/API on Vercel Production; Preview retains existing Basic authentication. Hosting environment and aggregate-data source are separate settings.
- Dedicated branch: `work/game04-kpi-dashboard-20260927`.
- Base: common Preview `9099e9eafcce090d6b87c064e46ba54a81e37949` on `work/game04-common-preview-20260925`.
- Entry: `/admin/kpi`; day detail: `/admin/kpi/day/YYYY-MM-DD`.
- Removes Guild join rate, Raid Point usage rate and Social Active rate from the dashboard.
- Adds cumulative 68-stage metrics and daily/monthly encounter/unlock raid metrics.
- Retains acquisition, active users, tutorial, retention and billing overview.
- Shared production migration worktree, main, production DB, GAME03 and game behavior are unchanged.
- Existing developer-only `/admin/kpi/game04` and legacy API routes are not removed. The new dashboard calls only `/api/admin/kpi/game04`.

## Measurement contract

All calendar boundaries use Asia/Tokyo. Exclusion classifications (`admin`, `qa`, `test`, `fraud_suspended`) apply at the corresponding event time. Unclassified users are included.

| Metric | Source / definition |
| --- | --- |
| 68 stage list | Current `quest65.json` master (68 despite its legacy filename), master order and design IDs |
| Cumulative executions | `game04_battles.kind=quest`, one per battle start; retries, unsettled battles and retirement included |
| Cumulative clears | Settled battle with `result.battle.outcome=win`; repeated clears included |
| Clear rate | Clears / executions; no executions produces null / `—` |
| Raid hosted | One room per `game04_raid_rooms.created_at`, classified using its saved raid/territory snapshot |
| Raid defeated | First committed `game04_requests.result.room.status=defeated` snapshot for the room; intermediate levels and later claims do not count again |
| Raid participant UU | Distinct battle-start `user_id` within period and raid type; monthly UU is recalculated, never daily-UU sum |
| DAU / MAU | Distinct users with committed requests, restore observations, battle starts or settlements in the period |
| New / cumulative users | `users.created_at`; current registered records (does not reconstruct deleted users) |
| Tutorial | Registration cohort whose committed tutorial step reached `SCENES.length` by query time |
| D1–D5 | Cohort users active N JST days after registration / cohort members whose observation day has ended; pending days excluded |
| Revenue / payers | `billing_orders`: live + GRANTED, by `granted_at`; distinct payers per period |
| Acquisition | Earliest non-QA journey binding; Meta/X/organic/direct/unknown. LP arrival and registration use their respective event dates |

For raid metrics, rooms hosted by excluded accounts are excluded entirely; participant and defeat actor exclusions also apply. A missing defeat receipt or unknown type/ID is reported in a visible coverage warning rather than assigned an invented date/type. Cumulative stages always run through query time, including on historical day pages.

GAME03's saved aggregate/Cron implementation is not installed: the initial GAME04 version uses an additive read-only RPC and a 60-second server cache, with explicit refresh. This keeps the active production migration independent. At production scale, measure query latency and plan indexes or saved aggregates separately; current low-volume verification is not a load test.

## Database and server configuration

`supabase/manual/game04_kpi_dashboard_v1.sql` adds only `game04_kpi_excluded_v1` and `game04_kpi_dashboard_v1`. It does not change tables, existing gameplay functions, triggers, Cron or historical data. Both functions are SECURITY INVOKER; only `service_role` can execute them. SQL timeout is 25 seconds and date ranges are capped at 366 days.

Applied successfully to isolated GAME04 Preview `znakrkaazliexzwihxge` through migration `game04_kpi_dashboard_v1`. Production application is intentionally left to the production migration owner.

Required hosting settings:

- Existing `KPI_BASIC_AUTH_USER` and `KPI_BASIC_AUTH_PASSWORD` protect both page and API through the existing proxy.
- Either use the project's matching `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, or set the server-only pair `GAME04_KPI_SUPABASE_URL` / `GAME04_KPI_SERVICE_ROLE_KEY`.
- For the KPI branch Preview, use `https://znakrkaazliexzwihxge.supabase.co` and its service key. Never place the service key in a `NEXT_PUBLIC_*` variable.
- The route allowlists only that GAME04 Preview and `https://soiksqgtmcnspfedmanr.supabase.co` (GAME04 production). Other targets, including GAME03, fail closed. Production still requires the additive SQL to be applied first.
- Prerequisite source tables: users, kpi_subjects, kpi_account_classification_periods, kpi_acquisition_journeys, kpi_acquisition_subject_bindings, billing_orders, game04_requests, game04_battles, game04_raid_rooms, game04_state_restore_observations.

## Verification evidence

| Check | Result |
| --- | --- |
| TypeScript | `npm run typecheck` passed |
| Build | `NEXT_PUBLIC_USE_MOCK_DB=true npm run build` passed, including existing common-UI and Edge bundle gates. Mock flag was only for local build; no hosting configuration changed |
| Changed-file ESLint / whitespace | Passed |
| Date and project guard tests | `node --experimental-strip-types scripts/verify_game04_kpi.mjs` passed |
| Real Preview RPC | Daily 27 rows / monthly 12 rows / 68 stages returned; all three coverage diagnostics were zero at verification time |
| Real DB fixture assertions | `scripts/verify_game04_kpi.sql` passed: retries, wins vs loss/retirement/pending, QA exclusion, daily/monthly dedup, JST month boundary, separate raid types, receipt timestamp vs later claims, null rate. Entire fixture transaction rolled back; absence of fixture users asserted |
| RPC access | anon=false, authenticated=false, service_role=true |
| HTTP guards | Local unauthenticated page/API return 401; invalid inputs 400; missing KPI DB configuration 503 |
| UI tests | `scripts/verify_game04_kpi_browser.mjs` passed: 68 rows, clear rates, both raid types, month/day navigation, source view, error/retry and absence of removed KPIs |
| Browser layout | 1440px overview and 375/390px stage/raid views inspected; page does not overflow horizontally, wide tables scroll internally; no page errors |
| Live hosted end-to-end | Not verified: connected Vercel tooling did not expose the GAME04 project and no hosting/service-role credentials were available in this workspace |

Screenshots in this directory use labeled synthetic **display-test data**, not live production data. The DB tests above separately exercised the actual Preview RPC. Standard Playwright browser download failed in this runtime; tests passed using a temporary `@sparticuz/chromium` installation outside the repository. No browser dependency or package lock was changed.

Reproduce UI checks by starting local Next on port 3317 with the mock-build flag and local-only Basic auth values documented in the test script, then running `node scripts/verify_game04_kpi_browser.mjs`. Install a normal Playwright Chromium first. An optional `KPI_TEST_CHROMIUM_MODULE` absolute module path supports an alternate local Chromium implementation. The script rejects non-local origins.

Before declaring deployment complete: configure the branch's GAME04 Preview target, deploy the PR head, authenticate at `/admin/kpi`, and verify the browser → API → real RPC path. The internal tool itself stays in development / Preview; production deployment is not an outstanding task.

Deployment follow-up (2026-09-27 20:47 JST): GitHub reports failed automatic Preview checks for the PR head (`Vercel – game04` and `Vercel – game04-production-receiver`). The connected Vercel project list exposes only `tribe-neon`; build-log retrieval returns `Tool get_deployment_build_logs not found`. No Vercel CLI authentication is available. Do not repeat these failed connector paths; use an approved Vercel dashboard session or hand off the exact branch deployment/settings to the user.

Internal-hosting follow-up verification: rebuilt successfully; local HTTP checks for `/admin/kpi`, day detail and the KPI API return 404 in Vercel Production even with valid Basic credentials. Preview returns 401 without Basic auth, 200 for authenticated pages, and 503 for the API without its DB credentials. These checks do not claim hosted deployment success.
