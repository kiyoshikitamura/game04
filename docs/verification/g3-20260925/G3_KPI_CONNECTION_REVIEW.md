# G3 formal gacha / G2 KPI connection review

Date: 2026-09-25  
Target: GAME04 development `lrgyllgzcdcphlbmkknc`  
Scope: receipt/KPI connection only. No DB apply or Edge deployment in this work item.

## Read-only baseline

The live definitions of `game04_commit_gacha`, `game04_commit_growth_state`,
`game04_kpi_gameplay_daily`, and `game04_kpi_receipt_detail` were read with
`pg_get_functiondef`. Aggregate-only inspection found five existing formal-gacha
requests: four `normal_gacha` and one `special_gacha_exchange`. All five had
`formalGachaReceipt`; none had `gameplayMeasurement`. The live gameplay KPI
therefore returned zero gacha actions.

Latest live `pg_get_functiondef` MD5 immediately before handoff:

- `game04_commit_gacha`: `b39f6132275f3beeed91ddb555c3bc11`
- `game04_kpi_gameplay_daily`: `d3ec9a0da3ee7f191867c506e9142a9b`
- `game04_kpi_receipt_detail`: `6240416a2789f27ceb05d52d207c2518`

## Preserved G2 contract

`game04_g3_gacha_kpi_connection.sql` is based on those live definitions and keeps:

- all existing battle/action facts and the full prior action allowlist;
- raid grant de-duplication and reward quantities;
- restore acknowledgement and acquisition-subject activity CTEs;
- event-time `kpi_is_subject_excluded` classification and `qa_v1` funnel exclusion;
- the 367-day range guard, JST grouping and development-only projection;
- unchanged function signatures, `security invoker`, `search_path`, revokes and
  service-role-only grants;
- the existing atomic gacha debit, paid-lot trigger path, ticket lock/update,
  growth-state commit, request ledger and payload mismatch rejection.

The only SQL behavior additions are validation of the versioned gacha measurement,
ephemeral `replayed` return flags, three gacha actions in the existing action
allowlist, and `gacha_actions` / `gacha_results` arrays in the existing detail JSON.
No revenue, purchase, JPY or yen fact is created. `diamond_spent` and
`game_cash_spent` are explicitly in-game resource quantities.

## Verification

- `npm run typecheck -- --pretty false`: PASS
- `node scripts/verify_game04_g3_measurement.cjs`: PASS
  - after removing only the three appended action names, the normalized gameplay
    function equals the saved G2 definition;
  - the complete receipt-detail prefix through the existing funnel CTE equals the
    saved G2 definition, and G3 CTEs are appended after it;
- `git diff --check`: PASS
- Rollback-only SQL fixture added at
  `supabase/tests/game04_g3_kpi_gacha_rollback.sql`; it creates its own temporary
  user/subject, verifies all three actions, one-row replay, event-time QA exclusion,
  quantities/results, role boundaries and absence of revenue projection, then
  rolls back. It has not been executed because DB application is parent-owned.

Evidence SHA-256 at review time:

- KPI SQL: `ac0ef0b9202b9e59aae6a62660bc1e0d9e27cf8ff4e6dfdef9625c0e1743bf9e`
- rollback fixture: `5788d9eeed0de368edbe08b6f2121e6104748e0735541a05832a005a14f90f27`
- static verifier: `0e1b66fc2a4c674338c8b0613c28431f17c997e29bd05a9385fc040a8d03a928`
