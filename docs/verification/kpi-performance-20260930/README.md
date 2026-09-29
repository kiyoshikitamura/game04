# GAME04 KPI performance — 2026-09-30 JST

## Scope

- User approved remediation of the slow `/admin/kpi` dashboard.
- Production data source: `soiksqgtmcnspfedmanr`.
- Hosting remains internal Preview; no main update or production website release.
- Source preservation branch: `work/game04-kpi-performance-20260930`, based on known KPI production-data source commit `900f46ae80a2835bc59cfd9df09063664d6161fb`.
- The exact source SHA of the user's immutable `game04-nm09f6x2z-kiyoshi-kitamura.vercel.app` deployment could not be verified through the Vercel connection. Do not promote this branch as the latest game Production tree.

## Applied database remediation

- Three indexes created with CREATE INDEX CONCURRENTLY, one statement per call, without blocking gameplay writes with a normal index build.
- The tutorial index uses CASE to avoid introducing numeric-cast failures for nonnumeric JSON steps.
- A temporary prototype tutorial index created during measurement was replaced by `game04_requests_kpi_tutorial17_v2`; no user data was deleted.
- `game04_kpi_dashboard_v1` replaced through migration `game04_kpi_performance_v1`. A guard compared the live function definition with the saved baseline immediately before replacement, aborting on a concurrent edit.
- The RPC signature, response schema, metric definitions, service-role restriction and current-time/cumulative semantics are unchanged.
- Exclusion classifications are read once in a MATERIALIZED CTE, preserving current admin/QA/test exclusion and event-time fraud-suspension intervals.
- Quest executions and wins are counted separately so the partial win index avoids unpacking large battle JSON for each count.
- Tutorial threshold 17 uses the partial index; other thresholds retain the original dynamic predicate through a guarded fallback branch.
- No gameplay function, trigger, balance, account, receipt or saved battle was changed. No new cron or aggregate snapshot infrastructure.

## Evidence

Existing pg_stat_statements: 9 KPI calls, mean 11126.87 ms, max 11874.43 ms. This is historical database execution, not a browser page-load measurement.

Component baseline: tutorial completion 5325.062 ms; quest win aggregation 1746.345 ms.

Temporary optimized function: 146.391 ms for September daily data.

Live post-change EXPLAIN ANALYZE with service_role:

| Request | Execution |
| --- | ---: |
| Daily, 2026-09-01 through 2026-09-29, threshold 17 | 200.044 ms |
| Monthly, 2026-01-01 through 2026-09-29, threshold 17 | 106.994 ms |
| Historical day 2026-09-28, forced generic query plan | 100.226 ms |

Each measurement is a single observation, not a latency distribution or load test.

Old versus candidate JSON equality was checked in the same statement/snapshot for September daily and monthly data, plus tutorial thresholds 16 and 18. All returned true. The final CASE-index version was checked again for daily threshold 17 and returned true.

All three indexes are valid and ready. RPC execution privileges verified: anon=false, authenticated=false, service_role=true. Security advisors were inspected; no finding mentioned this RPC. Existing unrelated project advisories were not modified.

## Frontend status

- Refresh revision is consumed once by a ref. Period/month/date navigation no longer keeps adding `refresh=1` after an explicit refresh.
- `node scripts/verify_kpi_refresh_once.mjs`: 8 actual-effect request transitions passed, including initial/replayed mount, explicit refresh, month/period/date changes, and another refresh.
- Full app build and hosted browser behavior are not yet verified in this workspace. The source subset has no installed app dependencies.
- GitHub commit statuses triggered new Preview builds. Do not claim existing immutable URL's JavaScript has changed.

## Rollback

The original live function is preserved in `baseline.sql`. CREATE OR REPLACE with that definition restores the previous RPC. The additive indexes can remain; no data restoration is needed. If removing them later, inspect their exact names and use DROP INDEX CONCURRENTLY individually.
