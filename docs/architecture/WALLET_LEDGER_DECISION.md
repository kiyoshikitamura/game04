# Wallet ledger architecture decision

## Decision

**Recommendation: DEFER wallet implementation.**

Do not implement a generic wallet before D-14 defines GAME04's economy
boundaries. The accepted Inventory and Reward contracts are sufficient for
owned, positive-quantity assets received through a server-authoritative reward
flow. They are not a complete spending, accounting, or payment contract.

This decision does not mean that a wallet is required later. After D-14:

- choose **NOT NEEDED** when every relevant value can remain an owned inventory
  quantity and no ledger-only condition below applies;
- choose **IMPLEMENT** only when an approved product rule requires accounting
  behavior that Inventory plus narrow immutable transaction receipts cannot
  represent safely.

Character identity and presentation work do not depend on this decision.
Character Gacha pricing/spending and economy-shaped growth mutations remain
blocked until the relevant D-12 through D-15 answers are approved.

## Evidence reviewed

- `20260902000003_inventory_core.sql` stores a player's positive quantity for a
  product-neutral `(asset_kind, asset_key)` and exposes an owner-only read
  projection. Clients cannot mutate it directly.
- `20260902000004_reward_transaction_core.sql` provides a server-owned reward
  payload, an atomic inbox claim, an immutable receipt, and request
  idempotency. It credits Inventory but does not debit, reserve, expire,
  reconcile, refund, or classify a balance.
- `COMMON_GAME_CORE_BOUNDARY.md` requires server authority, transactional and
  idempotent mutations, and forbids inventing product values.
- `COMMON_CORE_DEPENDENCY_MAP.md` identifies Wallet as a design candidate whose
  kinds, prices, distinctions, conversions, and sinks remain product decisions.
- The read-only `GAME04 Development Start Handoff` confirms Character Gacha as
  a central direction and **Pay to Win < Pay to Collect / Complete / Express**
  as the monetization direction, while explicitly leaving Economy, Gacha
  price/rate, and duplicate requirements unfixed.
- The read-only `TRIBE NEON Engineering Technical Overview` confirms server
  revalidation of ownership, price, quantity, and time; transactional mutation;
  request idempotency; and reconciliation/refund preparation before payment.
- The accepted-source economy migration
  `20260822000174_economy_foundation_canonical.sql` was reviewed as pattern
  evidence only. Its direct balance changes are tightly coupled to product
  masters and gameplay rules, so neither its schema nor values are portable.
- D-12, D-13, D-14, D-15, and D-18 are all open. This memo does not resolve any
  detailed rule owned by them; the handoff's monetization direction constrains
  D-18 without supplying its implementation rules.

## What the accepted foundation already covers

| Need | Current coverage | Boundary |
| --- | --- | --- |
| Own a positive quantity of a generic asset | Inventory is sufficient | No client write path; authoritative mutations must be added per use case. |
| Deliver one or more generic assets | Reward is sufficient | The trusted server chooses the payload. |
| Retry a reward claim safely | Reward is sufficient | One player/request pair returns one immutable receipt and cannot grant twice. |
| Prove what one reward claim granted | Reward is sufficient | The receipt is immutable and owner-readable. |
| Spend or consume an owned quantity | Not implemented | This may be an Inventory transaction; it does not by itself justify a Wallet. |
| Explain every balance change across sources and sinks | Not implemented | Requires a journal when approved operations need this audit property. |
| Hold, expire, refund, or externally reconcile value | Not implemented | These are conditional Wallet/accounting capabilities. |

Inventory is a current-state ownership projection. A Reward receipt proves one
credit path. Neither one is a general journal of all credits and debits, and a
Reward receipt must not be reused to disguise spending or payment behavior.

## Product condition to minimum capability map

Select only the row justified by approved product rules. Higher rows include
the authority, transaction, idempotency, owner isolation, and server-clock
requirements of the lower rows.

| Approved product condition | Minimum accounting capability | Wallet decision |
| --- | --- | --- |
| Values are only owned quantities; operations are grants and simple consumption; no special balance classification, expiry, holds, transfers, or external reconciliation | Inventory projection plus an atomic, idempotent consumption mutation and immutable consumption receipt | **NOT NEEDED** |
| A spendable value needs a complete explanation of credits and debits across multiple sources or sinks | Immutable double-entry or equivalently balanced journal, account identity, transaction/request identity, and a derived balance projection | **IMPLEMENT minimal ledger** |
| The same value has separately governed classifications | Separate accounts or lots and a product-approved allocation rule; never infer the classification from `asset_kind` naming | **IMPLEMENT classified ledger** |
| Value expires | Dated lots, authoritative server time, deterministic product-approved consumption order, expiry entries, and reconciliation | **IMPLEMENT lot-aware ledger** |
| A flow authorizes now and settles or releases later | Holds/reservations with explicit pending, captured, released, and expired lifecycle; available and booked balance projections | **IMPLEMENT reservation capability** |
| Value is purchased, refunded, reversed, or checked against an external provider | External operation reference, immutable settlement/compensating entries, retry safety, and reconciliation state | **IMPLEMENT reconciliation capability** |
| Players can transfer value | Paired atomic entries, counterparty authority, limits/abuse controls, and reversal policy | **IMPLEMENT transfer capability only after a separate product and safety decision** |

The number of value types alone does not require a Wallet. Multiple ordinary
materials can remain Inventory assets. Conversely, even one value requires a
ledger if its approved lifecycle includes accounting behavior from the table.

## Conditional product-neutral minimum ledger contract

This is a design boundary, not authorization to implement it. If an approved
answer activates a ledger row above, the smallest common contract is:

1. A player-owned account identity whose classification comes from reviewed,
   versioned server rules.
2. An immutable transaction header with a server operation type, request ID,
   effective server timestamp, and optional approved external reference.
3. Immutable entries that balance within one transaction; no client-selected
   account, amount, classification, or counterparty.
4. A server-derived balance projection. Clients cannot directly insert,
   update, or delete accounts, entries, transactions, holds, or balances.
5. One atomic boundary for validation, debit/credit entries, downstream asset
   delivery, and result receipt. Repeating the same request returns the same
   result; reusing it for different input is rejected.
6. Owner-scoped read projections and privileged reconciliation projections,
   with cross-player and unauthorized negative tests.
7. Optional lots, holds, external references, and transfers are absent unless
   their corresponding approved condition requires them.

Reward remains the delivery mechanism for product-neutral assets. A future
operation that spends value and grants assets must coordinate Ledger,
Inventory, and its immutable result in one server-authoritative transaction;
it must not create two independently retryable mutations.

## Product answers required before implementation

The **Product owner** owns these answers. The architecture/integration owner
may select the minimum technical row only after the answers are approved.

### D-14 — mandatory Wallet gate

For every proposed economy value:

1. Is it an owned quantity, a spendable balance, or neither?
2. What approved actions credit it, debit it, or consume it?
3. Must every change be auditable as a journal, or is an operation receipt
   sufficient?
4. Are any classifications governed separately?
5. Can it expire, be reserved, be transferred, become negative, or be adjusted
   by operations staff?
6. Does it require external settlement, refund, reversal, or reconciliation?

### D-12 — acquisition transaction

Identify whether Character Gacha spends a value, which D-14 value it uses,
whether spend and result delivery must share one transaction, and what the
player-visible/server audit receipt must prove. Pool, rate, price, guarantee,
and disclosure answers remain product-owned.

### D-13 — duplicate outcome

State whether a duplicate remains ownership state, changes progression, or
converts into a D-14 value. A conversion answer must state whether one atomic
result needs Inventory and Ledger entries.

### D-15 — growth consumption

State which growth actions consume owned assets or spendable values, whether a
failed action refunds or never commits, and what receipt/history the player or
operations team needs.

### D-18 — monetization boundary

State whether any approved Collect, Complete, or Express behavior involves an
external purchase or separately governed value, and define refund/reversal and
standalone-play constraints. This is required before adding reconciliation or
classified-balance capability.

## Risks and controls

| Risk | Control |
| --- | --- |
| Implementing a speculative Wallet hardens unapproved economy assumptions | Keep implementation deferred until D-14 is approved. |
| Treating all quantities as Inventory hides audit, expiry, or settlement obligations | Re-run the condition map for every approved value and operation. |
| Treating all spendable values as Wallet balances creates unnecessary infrastructure | Prefer Inventory plus narrow transaction receipts when no ledger-only condition applies. |
| Splitting spend and delivery permits partial completion or retry duplication | Require one server-authoritative transaction and request identity. |
| Adding classifications without a product rule silently creates economy behavior | Store no classification or allocation order until explicitly approved. |
| A later payment requirement forces destructive redesign | Resolve the D-18 external settlement questions before implementing paid flows. |

## Revisit and exit criteria

Revisit this decision when D-14 is approved, together with applicable D-12,
D-13, D-15, and D-18 answers. Exit **DEFER** only when the Product owner has
classified the relevant values and operations well enough to select exactly
one minimum-capability row. Open answers remain conditions; silence is not a
default.
