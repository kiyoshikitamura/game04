# M2-DEV-BOOTSTRAP-001

**TASK ID:** M2-DEV-BOOTSTRAP-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** CLOSED  
**SLOT:** TOOLING  
**BASE COMMIT:** `c2b1b210cef3af7d402fc969a540fc434e844910`  
**BRANCH:** `codex/m2-dev-bootstrap-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G1 — Fresh-clone bootstrap, environment validation, and developer diagnostics

## Scope

Provide a cross-platform, secret-free bootstrap and diagnostic path for a fresh
checkout. Validate the supported runtime and environment shape without
requiring Supabase credentials for the disconnected application shell.

## Do not touch

- Supabase migrations, policies, functions, or live projects.
- Authentication, Player, Inventory, Reward, or product behavior.
- Character or GAME04 gameplay definitions.
- Vercel configuration and stored environment values.

## Dependencies

- Accepted M1 Common Core Foundation.
- M2 milestone structure at `c2b1b21`.

## Planned files

- `.env.example`
- `README.md`
- `package.json`
- `scripts/bootstrap.mjs`
- `scripts/doctor.mjs`
- `scripts/lib/developer-environment.mjs`
- `scripts/verify-bootstrap.mjs`
- `docs/development/ENGINEERING_BOOTSTRAP.md`
- `docs/development/acceptance/M2-DEV-BOOTSTRAP-001.md`
- `docs/development/tasks/M2-DEV-BOOTSTRAP-001.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- A fresh checkout has one documented sequence from dependency install to local validation.
- Bootstrap creates only an ignored local template and never overwrites existing values.
- Diagnostics distinguish disconnected-shell readiness from connected-service readiness.
- Invalid or partial public Supabase configuration fails with a useful, secret-free message.
- No secret values are printed or committed.

## Validation

- Run bootstrap in an isolated fresh-copy fixture.
- Run diagnostics for disconnected, connected-shape, and invalid configurations.
- `npm run check`

## Expected output

- Reproducible setup commands, environment validator, developer diagnostics,
  durable acceptance evidence, and an integration-owner completion report.

## Blockers

- None known.

## Completion report

- Fresh-copy bootstrap: PASS
- Existing `.env.local` preservation: PASS
- Disconnected and connected-shape diagnostics: PASS
- Partial public configuration rejection: PASS
- Repository quality check: PASS
- Protected database, authentication, and product areas: unchanged
- Merge risk: LOW — tooling and documentation only
- Integrated commit: `f974808`
- Acceptance: `docs/development/acceptance/M2-DEV-BOOTSTRAP-001.md`
