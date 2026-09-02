# DEV-DB-DELIVERY-001

**TASK ID:** DEV-DB-DELIVERY-001  
**OWNER:** UNASSIGNED  
**PRIORITY:** P1  
**STATUS:** READY  
**SLOT:** TOOLING  
**BASE COMMIT:** Resolve accepted `main` to an exact SHA at dispatch  
**BRANCH:** `codex/dev-db-delivery-001`  
**MIGRATION VERSION:** NONE

## Scope

Make forward-only database delivery repeatable by documenting the dev-clean apply/verify/record sequence and extending repository checks so every new Common Core migration has a matching catalog contract test.

## Do not touch

- Supabase migrations, SQL tests, runtime application code, or live databases.
- Authentication, Player, inventory, reward, economy, or product behavior.
- Vercel and Supabase environment values.

## Dependencies

- Existing forward-only migration policy.
- Existing repository contract verifier from `0c7d226`.

## Planned files

- `scripts/verify-repository-contracts.mjs`
- `docs/development/DATABASE_DELIVERY.md`
- `docs/development/acceptance/TEMPLATE.md`
- `docs/development/tasks/DEV-DB-DELIVERY-001.md`

## Acceptance criteria

- Every migration from `20260902000003` onward requires a same-version SQL contract test.
- A missing test fails deterministically without network access.
- The runbook distinguishes migration apply, catalog validation, behavioral replay, application deployment, and final evidence.
- The acceptance template records environment, commit, migration, expected authority, results, and rollback posture without secrets.
- No live database operation is performed by this task.

## Validation

- Positive repository-contract run.
- Negative isolated-fixture proof for a missing migration test.
- `npm run check`.

## Expected output

- Stronger offline contract checking, one database delivery runbook, one evidence template, and the fixed completion report.

## Blockers

- Stop if the checker would require credentials or network access.
