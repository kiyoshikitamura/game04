# ARCH-WALLET-DECISION-001

**TASK ID:** ARCH-WALLET-DECISION-001
**OWNER:** CODEX AUTHORITY WORKER
**PRIORITY:** P1
**STATUS:** READY
**SLOT:** AUTHORITY
**BASE COMMIT:** `0fa9d6de15bb870c891d055e11cb6f545217c8f7`
**BRANCH:** `codex/arch-wallet-decision-001`
**MIGRATION VERSION:** NONE

## Scope

Decide whether GAME04 needs a generic wallet ledger before Character or Gacha work. Separate what Inventory and Reward already cover from the conditions that require balance, journal, reservation, paid/free, expiry, or reconciliation behavior.

## Do not touch

- Runtime code, migrations, Supabase, Vercel, or live data.
- Currency names, prices, paid/free rules, gacha rates, duplicate conversion, reward values, or GAME03 economy defaults.
- Product decisions owned by D-12 through D-15 and D-18.

## Dependencies

- Accepted Inventory ownership and Reward transaction contracts.
- `COMMON_GAME_CORE_BOUNDARY.md` and `COMMON_CORE_DEPENDENCY_MAP.md`.
- Product decision D-14 remains open.

## Planned files

- `docs/architecture/WALLET_LEDGER_DECISION.md`
- `docs/development/tasks/ARCH-WALLET-DECISION-001.md`

## Acceptance criteria

- State a clear implement-now, defer, or not-needed recommendation.
- Map product conditions to the minimum required accounting capability.
- Explain why Inventory quantities and Reward receipts are or are not sufficient.
- Define a product-neutral minimum contract only when justified.
- Record risks, decision owner, and the exact product answers needed before implementation.
- Introduce no GAME03 value, term, or master data.

## Validation

- Cross-check current Inventory and Reward migrations.
- Cross-check D-12 through D-15 and D-18 without resolving them.
- `npm run check`.

## Expected output

- One architecture decision memo and fixed completion report.

## Blockers

- If the answer depends on an unresolved product rule, express it as a condition and do not choose the rule.
