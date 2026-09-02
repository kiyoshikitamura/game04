# CORE-REWARD-001

**TASK ID:** CORE-REWARD-001  
**OWNER:** CODEX AUTHORITY WORKER
**PRIORITY:** P1  
**STATUS:** ACCEPTED
**SLOT:** AUTHORITY  
**BASE COMMIT:** `0a5440b15e06bcaf5ee9c0b3e3142c7d9b35880c`
**BRANCH:** `codex/core-reward-001`  
**MIGRATION VERSION:** `20260902000004`

## Scope

Implement a product-neutral reward transaction, immutable receipt, inbox claim lifecycle, and request idempotency on top of `player_inventory`.

## Do not touch

- Character, item, equipment, currency, gacha, duplicate, mission, login bonus, or economy definitions and values.
- Authentication, Player profile, presentation, and Vercel/Supabase environment settings.
- Existing applied migrations.

## Dependencies

- Player authority commit `9ee9230`.
- Inventory ownership commit `73ec940`.
- Common Core dependency map.

## Planned files

- `supabase/migrations/20260902000004_reward_transaction_core.sql`
- `supabase/tests/20260902000004_reward_transaction_core_contract.sql`
- `src/domain/rewards/`
- `docs/architecture/INITIAL_BACKLOG.md`
- `docs/architecture/COMMON_CORE_DEPENDENCY_MAP.md`

## Acceptance criteria

- The caller cannot choose another player.
- Repeating one request ID cannot grant twice.
- Claim, inventory delta, and receipt commit atomically.
- Receipts are immutable and owner-readable.
- Client roles cannot directly insert, update, or delete inventory, inbox, request, or receipt rows.
- No GAME03 asset kind, value, copy, or master data is introduced.

## Validation

- `npm run check`
- Catalog privilege and RLS contract test.
- dev-clean replay of one request ID with proof of a single grant.

## Expected output

- One forward-only migration, its contract test, a small typed client adapter, and the fixed completion report.

## Blockers

- Reward payload authority must remain server-owned; stop if implementation would expose arbitrary client grants.

## Completion evidence

- Integrated commit: `b16838dc911e96e7a004ec21135cb932b721db5f`.
- Offline `npm run check`: PASS.
- Migration and paired SQL contract executed on `game04-dev-clean`: PASS.
- Behavioral replay proved a single grant on exact retry, cross-player rejection and isolation, transaction rollback on forced failure, and receipt immutability.
- Vercel deployment for the accepted tree at `f5d2ac5`: Ready.
