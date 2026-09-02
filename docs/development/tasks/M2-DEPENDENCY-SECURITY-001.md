# M2-DEPENDENCY-SECURITY-001

**TASK ID:** M2-DEPENDENCY-SECURITY-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** ACCEPTED
**SLOT:** TOOLING  
**BASE COMMIT:** `013e75bbda4d811594b1a0109eab12c2e2cb0f67`  
**BRANCH:** `codex/m2-dependency-security-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2.1 — Dependency Security Patch  
**EXIT GATE:** G1 — Patched production dependency baseline

## Scope

Upgrade Next.js and its matched ESLint configuration from 16.2.10 to the
current patched 16.3.4 line, clear known high/critical production dependency
findings, and replay every accepted engineering validation layer.

## Do not touch

- GAME04 product behavior, presentation, database schema, or authority contracts.
- Character, Gacha, economy, growth, Push/Fandom, Community, or battle rules.
- Preview or production Supabase environments.
- GAME03 code, values, assets, or terminology.

## Dependencies

- M2 accepted at `013e75b`.
- npm advisory data identifies Next.js, PostCSS, and Sharp findings resolved by
  the supported Next.js 16.3.4 line.

## Planned files

- `package.json`
- `package-lock.json`
- `next-env.d.ts`
- `docs/development/tasks/M2-DEPENDENCY-SECURITY-001.md`
- `docs/development/acceptance/M2-DEPENDENCY-SECURITY-001.md`
- `docs/development/MILESTONES.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Next.js and `eslint-config-next` use the same patched stable version.
- Production dependency audit contains no high or critical findings.
- Full repository and browser acceptance pass without product behavior changes.
- Protected dev-clean database contracts pass unchanged.
- GitHub Quality and Vercel serve the reviewed commit successfully.

## Validation

- `npm audit --omit=dev`
- `npm run check`
- `npm run test:browser`
- Protected Dev-clean database contracts workflow
- GitHub Quality and Vercel deployment status

## Expected output

- Patched locked dependency graph and durable security acceptance evidence.

## Blockers

- None.

## Acceptance

- Implementation commit: `5156090`
- Evidence: `docs/development/acceptance/M2-DEPENDENCY-SECURITY-001.md`
- Result: PASS; M2.1-G1 accepted.
