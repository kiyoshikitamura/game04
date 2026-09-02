# GAME04 task board

## Integration baseline

- Branch: accepted `main`; resolve and record its exact SHA when a task is dispatched
- Latest completed capability baseline: `73ec9404febcda39799c9b07e8d07e36aeddf3c4`
- Environment: dev-clean only
- Product specification work remains deferred unless the product owner explicitly opens it.

## Active slots

| Slot | Task | Status | Branch | Exclusive area |
| --- | --- | --- | --- | --- |
| Authority | `CORE-REWARD-001` | READY | `codex/core-reward-001` | DB migrations, inventory/reward mutation authority |
| Tooling | Unassigned | — | — | — |
| Client | Unassigned | — | — | — |

`CORE-REWARD-001` reserves migration `20260902000004`; no other task may add a migration while it is active. The tooling and client slots may be assigned only to tasks with no migration, authority, or planned-file overlap.

## Completed foundation

| Capability | Commit | Result |
| --- | --- | --- |
| Base environment | `3fa6f4c` | Next.js/TypeScript/Vercel/Supabase baseline |
| Player RLS grant correction | `97c5197` | authenticated profile access |
| Auth and Player initialization | `f8dfac7` | magic-link and idempotent initialization |
| Player Home | `3a92909` | authenticated profile shell |
| Player authority | `9ee9230` | server-only profile mutation |
| Inventory ownership | `73ec940` | neutral ownership and read projection |

## Integration order

1. `CORE-REWARD-001` integrates after its migration and catalog tests pass on dev-clean.
2. Independently assigned tooling or client tasks integrate first when they do not alter the reward task's assumptions.
3. The board baseline is updated after every integration.
