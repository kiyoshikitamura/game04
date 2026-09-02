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
| Tooling | `DEV-DB-DELIVERY-001` | READY | `codex/dev-db-delivery-001` | Repository contract checker and DB delivery documentation |
| Product/client | `PRODUCT-DECISION-REGISTER-001` | READY | `codex/product-decision-register-001` | New product decision documents only |

These three tasks have no planned-file overlap. `CORE-REWARD-001` exclusively reserves migration `20260902000004`; the other tasks must not add or edit migrations, tests, runtime authority, or live environments.

## Dependency queue

| Task/capability | State | Opens when | Reason |
| --- | --- | --- | --- |
| Generic wallet decision | WAITING | Reward transaction is accepted | Ledger boundaries depend on the reward receipt and idempotency contract. |
| Character/Gacha vertical slice | WAITING | Reward accepted and product decisions approved | Pools, rates, duplicates, prices, growth, and Character details remain unfixed. |
| Community implementation | WAITING | Product decision register items for identity, membership, and shared goals are approved | Guild size, Support/Fandom calculation, and shared goals remain unfixed. |
| Battle authority | WAITING | A concrete GAME04 consumer and Character contract exist | Do not import GAME03 battle modes, masters, values, or presentation speculatively. |
| Preview environment | DEFERRED | First vertical slice enters human acceptance | dev-clean is sufficient during Common Core extraction. |
| Production environment | DEFERRED | Pre-open preparation | Avoid current unnecessary infrastructure cost. |
| Authenticated journey QA | USER-DEPENDENT | A test login is intentionally used | Do not create or send login credentials merely for foundation work. |

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

1. `DEV-DB-DELIVERY-001` integrates first because it strengthens checks used to review later migrations.
2. `PRODUCT-DECISION-REGISTER-001` may integrate before or after tooling; it changes only new product documents.
3. `CORE-REWARD-001` integrates after rebasing onto accepted tooling changes and after its migration, replay, catalog, and dev-clean checks pass.
4. The board baseline and task statuses are updated after every integration.
