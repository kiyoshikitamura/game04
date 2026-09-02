# M2-TEST-LAYERS-001

**TASK ID:** M2-TEST-LAYERS-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** CLOSED
**SLOT:** TOOLING  
**BASE COMMIT:** `042373b1f8ec871d18fdbfd40e3efae4b438236d`  
**BRANCH:** `codex/m2-test-layers-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G2 — Unit, integration/contract, and browser acceptance test layers and CI ownership

## Scope

Create explicit unit, repository/SQL contract, and browser acceptance layers.
Run safe deterministic layers on every change and keep dev-clean database
execution in a protected, manually dispatched workflow.

## Do not touch

- Existing Supabase migrations and SQL contract content.
- Live databases or stored CI/Vercel secrets.
- Authentication, Player, Inventory, Reward, or product behavior.
- Character and gameplay specifications.

## Dependencies

- M2-G1 accepted at `f974808`.
- Integration record `042373b`.

## Planned files

- `.github/workflows/quality.yml`
- `.github/workflows/database-contracts.yml`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `scripts/run-database-contracts.mjs`
- `scripts/run-browser-tests.mjs`
- `tests/unit/`
- `tests/browser/`
- `docs/development/TEST_STRATEGY.md`
- `docs/development/acceptance/M2-TEST-LAYERS-001.md`
- `docs/development/tasks/M2-TEST-LAYERS-001.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Unit tests run without network access or credentials.
- Repository contracts remain a required quality check.
- Browser smoke acceptance runs against a production build without Supabase credentials.
- SQL contracts run only through a protected explicit command/workflow with a non-production connection.
- CI ownership, failure meaning, and local commands are documented.

## Validation

- `npm run test:unit`
- `npm run test:browser`
- Database runner missing-configuration fail-safe
- `npm run check`

## Expected output

- Test configuration, representative tests, CI jobs, protected database runner,
  durable acceptance evidence, and an integration-owner completion report.

## Blockers

- None known.

## Completion report

- Unit tests: PASS — 4 deterministic environment tests
- Repository contracts: PASS
- Browser acceptance: PASS — disconnected production-built shell on Chromium
- Database runner fail-safe: PASS — stopped before execution without dev-clean target/configuration
- Full repository quality check: PASS
- Protected database, authority, and product areas: unchanged
- Discovered issue: package audit reports three high-severity dependency findings; no force upgrade was applied outside this gate
- Merge risk: MEDIUM — CI gains a Chromium installation and browser job
- Integrated commit: `808d0e7`
- Acceptance: `docs/development/acceptance/M2-TEST-LAYERS-001.md`
