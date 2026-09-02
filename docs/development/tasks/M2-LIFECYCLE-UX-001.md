# M2-LIFECYCLE-UX-001

**TASK ID:** M2-LIFECYCLE-UX-001  
**OWNER:** INTEGRATION  
**PRIORITY:** P0  
**STATUS:** VALIDATED
**SLOT:** PRODUCT/CLIENT  
**BASE COMMIT:** `957c675dc054816510a5b4f076db40e5cd0c2b2a`  
**BRANCH:** `codex/m2-lifecycle-ux-001`  
**MIGRATION VERSION:** NONE  
**MILESTONE:** M2 — Engineering Readiness  
**EXIT GATE:** G3 — Client/server boundaries and shared lifecycle UX

## Scope

Add product-neutral loading, unavailable, error, and confirmation-dialog UI;
protect authenticated routes on the server; preserve safe return paths; and
handle client session expiry consistently.

## Do not touch

- Supabase migrations, RLS, RPCs, or live environments.
- Player, Inventory, Reward authority contracts.
- Character, economy, community, battle, or other product rules.
- GAME03 UI, state container, route names, or presentation.

## Dependencies

- M2-G1 and M2-G2 accepted through `957c675`.

## Planned files

- `src/app/page.tsx`
- `src/app/home/page.tsx`
- `src/app/home/HomePanel.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/components/AuthPanel.tsx`
- `src/app/components/LifecycleState.tsx`
- `src/app/components/ConfirmDialog.tsx`
- `src/lib/auth/navigation.ts`
- `src/lib/auth/route-access.ts`
- `src/app/styles.css`
- `tests/unit/auth-navigation.test.mjs`
- `tests/browser/disconnected-shell.spec.ts`
- `package.json`
- `docs/architecture/CLIENT_SERVER_LIFECYCLE.md`
- `docs/development/tasks/M2-LIFECYCLE-UX-001.md`
- `docs/development/TASK_BOARD.md`

## Acceptance criteria

- Connected `/home` access is authorized on the server and unauthenticated users return to Title safely.
- Disconnected local shell remains usable without credentials.
- Loading, unavailable, error, and confirmation states use shared accessible components.
- Unsafe callback/return paths cannot escape the application origin.
- Session expiry returns the player to Title with a clear non-sensitive message.
- Existing product-neutral login and profile behavior remains intact.

## Validation

- Unit tests for return-path and route-access decisions.
- Browser acceptance for disconnected states and safe reason handling.
- `npm run check`
- `npm run test:browser`

## Expected output

- Shared lifecycle components, server authorization boundary, client expiry
  behavior, architecture record, tests, and acceptance evidence.

## Blockers

- None known.

## Completion report

- Safe navigation and route decision unit tests: PASS
- Shared loading, unavailable, error, notice, and confirmation components: PASS
- Disconnected Title/Home browser acceptance: PASS
- Known/unknown session-reason browser acceptance: PASS
- Full repository quality check: PASS
- Connected live-login human acceptance: not required for this product-neutral gate; server decision is unit-covered and existing auth authority is unchanged
- Protected database, authority, and product areas: unchanged
- Merge risk: MEDIUM — login return navigation and `/home` authorization behavior change intentionally
