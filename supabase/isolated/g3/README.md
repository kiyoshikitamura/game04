# GAME04 G3 isolated database assets

This directory is a **limited current-state snapshot**, not a migration-history replay. It was derived with read-only catalog queries from `game04-dev-clean` (`lrgyllgzcdcphlbmkknc`) on 2026-09-25. It contains no source user/session rows, credentials, API keys, Stripe/webhook runtime, Cron jobs, Storage objects, or GAME03 history.

## Safe scope

`00_schema.sql` creates only the G3/G2 state, inventory, request receipt, formal gacha master, paid-lot balance authority, login delivery and KPI QA-classification tables needed for isolated gacha acceptance. Every exposed table has explicit RLS and grants because new Supabase projects no longer automatically expose new `public` tables to Data/GraphQL APIs.

`01_core_seed.sql` contains fixed non-user master/config rows. Its `isolated_environment` marker is fixed to the approved isolated project `znakrkaazliexzwihxge`. `02_qa_classification.sql` accepts exactly two new Auth user UUIDs and classifies both as QA; it never creates Auth identities or sessions.

For MCP-only setup, install `11_auth_and_fixture_generator.sql`. After the two Auth users exist, call `game04_prepare_isolated_g3_qa(qa_a,qa_b)`, issue one authenticated Edge GET for each UUID so the ordinary `buildInitialState` path creates `game04_player_state`, then call `game04_finalize_isolated_g3_qa(qa_b,fixture_tag)`. Immediately apply `12_lock_fixture_generators.sql`; `90_verify.sql` rejects an environment that still exposes either seed writer. The psql-only `02`/`03` files are equivalent fallbacks and must not be combined with the generator path.

`13_g3_player_initialization.sql` supplies the exact frontend overloads `initialize_current_player(text)` and `(text,text)`, plus the onboarding projection required before SetupView. It creates only the current Auth UID's `public.users` row and QA classification. It deliberately returns `tutorial_step: COMPLETE` without creating tutorial progress, starter characters/equipment, invitation rewards or any gacha action; all of those remain G4/P02 scope.

`14_g3_room_read_projection.sql` is the two-function read-only dependency used by the G3 hub bootstrap. It lists visible room JSON and joins owner display fields only; it installs no raid writer, reward logic or performance candidate.

`15_g3_initial_read_runtime.sql` adds the only two fatal initial-read contracts missing from the limited snapshot: empty `guilds`/`guild_members` projections for the authenticated profile bootstrap, and the service-only territory context/progress contract used by Edge `responseFor`. `16_g3_current_territory_master.sql` immediately replaces the bootstrap territory row with the repository-generated `GAME04_TERRITORY_HOST_PROVISIONAL_20260923` five-castle master; `17_g3_territory_validator_reconciliation.sql` then restores the exact live validator checks. None of these files imports guild membership, territory progress, room or user rows.

The formal pool seed remains the generated repository authority at `supabase/manual/game04_g3_formal_gacha_pool.sql`. Do not dump the live pool or copy live rows back into this directory.

## Apply sequence and fail-closed stop

Apply `APPLY_ORDER.txt` in a single-purpose, newly created project only. Before any SQL:

1. Confirm the destination project ref is `game04-g3-acceptance`, not dev or Production.
2. Confirm the database has no application user rows and no imported migration history.
3. Set `statement_timeout`, `lock_timeout`, and stop on the first SQL error.
4. Apply `00_schema.sql` and `01_core_seed.sql`.
5. Assemble the G2 R8 runtime function snapshot and compare `md5(pg_get_functiondef(...))` with `manifest.json`.

Step 5 is intentionally not bypassable. Live-only R8 functions (`game04_get_session_state`, `game04_process_login_bonus`, paid-lot triggers) are captured in `10_live_runtime_additions.sql`; the two referenced repository files are limited GAME04 runtime source slices, not a migration-history replay. No other migration file may be applied. Replaying old migrations would silently produce a different function body and is prohibited.

After the runtime hashes match, apply the formal pool, atomic commit and G2/G3 KPI definitions listed in `APPLY_ORDER.txt`. Create exactly two login-capable identities through Auth Admin API, bind/initialize their public state through the approved API path, then run:

```sh
psql "$ISOLATED_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -v qa_a_id="$QA_A_USER_ID" -v qa_b_id="$QA_B_USER_ID" \
  -f supabase/isolated/g3/02_qa_classification.sql

psql "$ISOLATED_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -v qa_b_id="$QA_B_USER_ID" -v fixture_tag="$G3_FIXTURE_TAG" \
  -f supabase/isolated/g3/03_qa_paid_lot_fixture.sql
```

No password, token or database URL is committed. Disable all Cron jobs and do not configure Stripe secrets or webhook URLs.

The approved destination was checked read-only before application: PostgreSQL 17.6, zero `public` base tables, zero `public` routines, zero Auth users and no `cron` schema. `90_verify.sql` rejects the wrong project marker, unclassified application users, missing QA periods, pool count drift, missing initial-read contracts, a non-current territory master, browser execution grants and any enabled `pg_cron` extension.

## Remaining blockers before unattended empty-DB construction

- Normalize and compare each installed function contract against `manifest.json`. `pg_get_functiondef` hashes from live are recorded for provenance; snapshot formatting may differ, so acceptance must additionally compare signatures, security mode, search path and behavior rather than treating whitespace-only MD5 drift as failure.
- The G2 KPI receipt-detail support tables are created empty. Their historical rows and landing metadata validator are intentionally absent; this is sufficient for G3 receipt aggregation but not a replacement for full acquisition-funnel acceptance.
- Auth identities cannot be made login-capable by portable schema SQL. The approved setup path must create two new users with Auth Admin API, then pass only their UUIDs to the fixture/classification step.
- `03_qa_paid_lot_fixture.sql` creates only a sandbox `GAME04_QA` fixture with `revenue:false`: skill ticket quantity/lot 1 with future expiry, and equipment ticket quantity/lot 1 with past expiry. The equipment 1→0 draw must fail with `EXPIRED_ASSET_BALANCE`; rollback must leave both physical values at 1. It is not checkout or cash revenue.
- Deploy the Edge Function with `verify_jwt=true` and bind only the dedicated Vercel branch environment to project `znakrkaazliexzwihxge`.

These blockers are explicit so an operator cannot mistake a partial schema for an accepted environment. No existing dev/Production row needs to be read during application or acceptance.
