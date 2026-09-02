# M2-OPERATIONS-001

**TASK ID:** M2-OPERATIONS-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** CLOSED
**SLOT:** AUTHORITY  
**BASE COMMIT:** `d517f2b6bc057d1e1ca2e0639e25240c2361bc4a`  
**BRANCH:** `codex/m2-operations-001`  
**MIGRATION VERSION:** `20260902000005`  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G6 — Operations foundation and dev-clean acceptance

## Scope

Add a product-neutral application availability state, safe maintenance
presentation, service-role-only state mutation, immutable audit evidence, and a
bounded dev-clean administration command. Complete a fresh dev-clean migration,
catalog, behavior, application, and browser acceptance run.

## Do not touch

- Character, Gacha, economy, growth, Push/Fandom, Community, battle, or content rules.
- GAME03 operational flags, roles, schedules, admin UI, or identifiers.
- Preview or production Supabase environments.
- Browser-exposed service credentials or authenticated-client mutation rights.
- Existing applied migrations.

## Dependencies

- M2-G1 through G5 accepted through `d517f2b`.
- `game04-dev-clean` is the sole live database target.

## Planned files

- `supabase/migrations/20260902000005_operational_feature_state.sql`
- `supabase/tests/20260902000005_operational_feature_state_contract.sql`
- `src/lib/operations/contract.ts`
- `src/lib/operations/server.ts`
- `src/app/components/ApplicationAvailability.tsx`
- `src/app/engineering/operations/page.tsx`
- `src/app/layout.tsx`
- `src/app/styles.css`
- `scripts/set-operational-state.mjs`
- `.env.example`
- `tests/unit/operations.test.mjs`
- `tests/browser/operations.spec.ts`
- `docs/architecture/OPERATIONS.md`
- `docs/development/acceptance/M2-OPERATIONS-001.md`
- `docs/development/tasks/M2-OPERATIONS-001.md`
- `docs/development/MILESTONES.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Availability reads are public, narrow, fail-open, and contain no operator identity.
- Only `service_role` can change state; direct table writes remain unavailable to clients.
- State changes are request-id idempotent, conflict-safe, and append immutable audit records.
- Maintenance mode presents a safe retry path without blocking the engineering operations page.
- The administration command refuses non-dev-clean targets and never prints credentials.
- Fresh dev-clean apply, catalog test, behavior replay, application deployment, and browser checks pass.

## Validation

- Unit tests for state validation and fail-open projection.
- Paired SQL catalog and behavioral contract test.
- Browser acceptance for enabled and maintenance presentation primitives.
- `npm run check`
- `npm run test:browser`
- dev-clean apply and repeated contract execution.

## Expected output

- Product-neutral operations authority and presentation with durable, secret-free
  dev-clean acceptance evidence and a completed M2 milestone.

## Blockers

- None. The dev-clean database password was rotated, the IPv4 session-pooler
  connection is stored as a protected GitHub environment secret, and workflow
  run 3 passed.

## Completion report

- Product-neutral operations authority and immutable audit: PASS
- Unit tests: PASS — 3 new, 17 total
- Browser/API tests: PASS — 2 new, 8 total
- Full repository quality and GitHub Quality run 24: PASS
- Migration apply to `game04-dev-clean`: PASS
- Exact catalog/behavior contract in SQL Editor: PASS twice
- Live maintenance transition and restoration to `enabled`: PASS
- Vercel deployment of `3de6ef7`: READY
- Protected GitHub database contract: PASS — run 3, all 3 contracts
- Database runner correction: `9bea604`
- Gate evidence: `docs/development/acceptance/M2-OPERATIONS-001.md`
