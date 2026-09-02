# DEV-MIGRATION-GUARD-001

**TASK ID:** DEV-MIGRATION-GUARD-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P1  
**STATUS:** CLOSED  
**SLOT:** TOOLING  
**BASE COMMIT:** `73ec9404febcda39799c9b07e8d07e36aeddf3c4`  
**BRANCH:** `main`  
**MIGRATION VERSION:** NONE

## Scope

Add deterministic repository checks for migration filename/version uniqueness and required task-contract fields, and run them in the existing quality gate. Completed as part of the parallel-development foundation.

## Do not touch

- Supabase migrations or live databases.
- Runtime application code, authentication, Player, inventory, reward, or product specifications.
- Deployment environment values.

## Dependencies

- Parallel protocol and task board at baseline `73ec940`.

## Planned files

- `scripts/verify-repository-contracts.mjs`
- `package.json`
- `.github/workflows/quality.yml` only if the package `check` script is insufficient.
- `docs/development/tasks/DEV-MIGRATION-GUARD-001.md`

## Acceptance criteria

- Duplicate 14-digit migration versions fail locally and in CI.
- Malformed migration filenames fail.
- READY or IN_PROGRESS task contracts missing required fields fail.
- Existing valid repository state passes.
- The check performs no network or database mutation.

## Validation

- Positive run against the repository.
- Negative run using isolated temporary fixtures without changing tracked files.
- `npm run check`.

## Expected output

- Static verification script, quality-gate integration, tests or fixture proof, and the fixed completion report.

## Blockers

- None known.
