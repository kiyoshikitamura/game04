# GAME04 task board

## Integration baseline

- Branch: accepted `main`; resolve and record its exact SHA when a task is dispatched
- Latest completed capability baseline: `b16838dc911e96e7a004ec21135cb932b721db5f`
- Environment: dev-clean only
- Product specification work remains deferred unless the product owner explicitly opens it.

## Active slots

| Slot | Task | Status | Branch | Exclusive area |
| --- | --- | --- | --- | --- |
| Authority | `ARCH-WALLET-DECISION-001` | READY | `codex/arch-wallet-decision-001` | Wallet architecture decision document only |
| Tooling | Unassigned | OPEN | — | Repository and delivery tooling |
| Product/client | `PRODUCT-BATCH-A-BRIEF-001` | READY | `codex/product-batch-a-brief-001` | Batch A product decision brief only |

The second parallel wave reserves two non-overlapping documentation areas. It makes no product decision and performs no live-environment mutation.

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
| Database delivery discipline | `1873afe` | migration/test pairing, forward-only runbook, and evidence template |
| Product decision register | `9dd2483` | fixed direction separated from dependency-ordered open decisions |
| Reward transaction core | `b16838d` | dev-clean-validated inbox, atomic claim, immutable receipt, and idempotency |

## Integration order

The first wave integrated in the required order: delivery tooling, product register, then Reward. Future waves must define their own dependency-aware order before dispatch.
