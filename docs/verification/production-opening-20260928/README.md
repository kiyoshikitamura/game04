# Production opening connection — 2026-09-28

Actual Production is Vercel `game04-production-receiver` / `prj_sFLd5kZeu7pjveQIkeL88ShfN8i8`, domain https://sengoku-hime-ennbu.com, Supabase `soiksqgtmcnspfedmanr`. Project `game04` is the earlier environment and must not be promoted for this release. Before release, canonical Production was READY `dpl_2EUmfj7bn3CdCFLDFa5j91BQrvjz`, SHA `80693affdb6f877dfb6dcc29f5a890deeb0545d4` (an ancestor of this branch). The earlier monitoring configuration pointed to the wrong project; corrected before deployment.

Release preflight found that the approved opening lived only in QA; IntegratedTutorial still showed older scenes. Connected the approved rendering to normal IntegratedTutorial. Existing server transitions, rewards, version and scene indices remain unchanged. Formation advances existing steps through 10, practice entry through 13, victory to 14, and farewell/name registration through 17. Each existing atomic transition is awaited and its returned state is used. No DB migration/API redeployment needed; read-only production checks confirmed the begin/commit tutorial RPCs exist.

Local scene/name drafts are scoped to the account. Server progress controls resumable checkpoints; grants never use the QA inventory. Names are submitted to the existing server name-registration step at completion; duplicate names return to the name input without replaying the battle. Partial network failures retry from the last successful server step; existing request idempotency is retained. The practice recording stays stable across server refreshes.

Verification: npm run check (explicit local mock environment) passes. Approved QA opening regression passes. 390px IntegratedTutorial fixture invokes the real transition function: full opening, partial save failure at step5, reload/retry, exactly three characters/skills/deck entries, practice, duplicate-name recovery, step17/home return and no browser exceptions pass. Fixture is isolated and does not create accounts or call Production writes. Browser initially selected the Next route-announcer alert in the test; assertions were scoped to the actual error text and rerun successfully. Actual authenticated fresh-user acceptance remains separate from these synthetic transition checks.

Production environment confirmed: app env production, mock false, Supabase soiksqgtmcnspfedmanr, canonical site URL. Monitoring corrected to the actual canonical project and set for 24 hours after deployment, hourly. No main/GAME03 changes.

## Deployed

- Runtime/source SHA `d2e10e5e0629353d66bbb71be2fd5194f2d7955f`.
- Production build READY: `dpl_8ttBnDcFtMWVP4gMCMwr83QpgSAe`, https://game04-production-receiver-j7opg12jg-kiyoshi-kitamura.vercel.app.
- Staged with Production configuration and domain assignment held. Protected URL required authenticated CLI bypass; protection was preserved. Mobile browser smoke then passed with a scoped bypass header.
- Promoted successfully. `vercel inspect sengoku-hime-ennbu.com` resolves to this deployment. Canonical domain smoke passed unauthenticated: title/start, all 15 SSR/combo assets, intended QA 404, no page exceptions.
- Existing baseline issue: `record_kpi_acquisition_landing_v1` returns 404 in both previous Production and this build. Recorded separately, not treated as a new gameplay regression.
- Runtime logs are unavailable via current credentials: CLI fetch failed; connector error aggregation returned 403. HTTP/assets/browser monitoring remains available. Live authenticated new-user onboarding was not executed; isolated full progression/failure/retry tests passed.
- Hourly monitor `game04` points to the correct production receiver and canonical domain. Its initial state/start/deadline are in the workspace work/production-monitor/state.json; it stops after 24 hours.
- Database, Edge API, main, GAME03, billing and authentication settings were not changed by this release. Parallel maeda-guide/pochi-online branches were detected but are not deployed to the canonical domain and were not overwritten or merged.
