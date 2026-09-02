# GAME04 task board

## Integration baseline

- Branch: accepted `main`; resolve and record its exact SHA when a task is dispatched
- Latest accepted baseline: `5156090`
- Environment: dev-clean only
- Current milestone: `M2.1 — Dependency Security Patch` (`1 / 1`; COMPLETE)
- External-decision milestone: `M3 — Product & Character Definition` (`1 / 6`; Circle agreement required)
- Milestone authority: `docs/development/MILESTONES.md`

## Active slots

| Slot | Task | Status | Branch | Exclusive area |
| --- | --- | --- | --- | --- |
| Authority | Unassigned | OPEN | — | DB migrations and mutation authority |
| Tooling | Unassigned | OPEN | — | Tooling and dependency work |
| Product/client | Unassigned | OPEN | — | Product documents and client-only work |

The second parallel wave is accepted. It made no product choice and performed no live-environment mutation.

## Current milestone gate

M2 is `COMPLETE`; all six engineering readiness gates are accepted. M2.1 is
also `COMPLETE`; its bounded security patch cleared the production dependency
audit and replayed every accepted engineering gate. M3 product work remains pending Circle agreement;
Character-specific M4 and gameplay M5 implementation stay outside active slots
until their product dependencies are accepted.

M2-G6 and M2 are accepted. Protected database workflow run 3 passed all three
catalog/behavior contracts. The dev-clean connection remains only in the GitHub
environment secret and must never be copied into repository files, task
documents, Issues, or chat.

M2.1-G1 is accepted at `5156090`. Quality run 29, protected database workflow
run 4, browser acceptance, and Vercel deployment all passed; the production
dependency audit reports zero vulnerabilities.

## Dependency queue

| Task/capability | State | Opens when | Reason |
| --- | --- | --- | --- |
| Generic wallet implementation | DEFERRED | D-14 classifies economy values and operations | Inventory plus narrow receipts remain sufficient unless an approved rule requires journal, classification, expiry, reservation, transfer, or external reconciliation. |
| Product and Character definition | EXTERNAL AGREEMENT | Circle discussion and Product-owner acceptance | Character, Creative Awakening, Push/Fandom, Economy, and Community rules must not be inferred by engineering. |
| Character/Gacha vertical slice | WAITING | Reward accepted and product decisions approved | Pools, rates, duplicates, prices, growth, and Character details remain unfixed. |
| Community implementation | WAITING | Product decision register items for identity, membership, and shared goals are approved | Guild size, Support/Fandom calculation, and shared goals remain unfixed. |
| Battle authority | WAITING | A concrete GAME04 consumer and Character contract exist | Do not import GAME03 battle modes, masters, values, or presentation speculatively. |
| Preview environment | DEFERRED | First vertical slice enters human acceptance | dev-clean is sufficient during Engineering Readiness. |
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
| Wallet ledger decision | `1168f75` | implementation deferred until D-14; conditional minimum capability map recorded |
| Product Batch A brief | `5e1a9c8` | source-verified identity and Character approval sequence |
| Engineering operations | `3de6ef7`, `9bea604` | feature state, maintenance, audited administration, and protected dev-clean contracts |
| Dependency security patch | `5156090` | Next.js 16.3.4 baseline, zero production audit findings, and full gate replay |

## Integration order

The first wave integrated in the required order: delivery tooling, product register, then Reward. The second wave integrated the Wallet decision and Batch A brief without file overlap. Future waves must define their own dependency-aware order before dispatch.
