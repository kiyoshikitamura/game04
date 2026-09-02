# Initial development backlog

## Completed in the base repository

- Clean Next.js + TypeScript shell with mobile safe-area handling.
- Title and Home placeholders.
- CI quality gate: lint, typecheck, production build.
- Isolated three-environment contract.
- First common-core database migration: authenticated player profile with RLS and an idempotent initialization RPC.
- Explicit common-core and GAME03 exclusion boundary.
- Magic-link authentication, authenticated player initialization, and an editable player Home profile.
- Audited Common Core dependency map fixed to TRIBE NEON commit `826f8b7`.
- Server-authoritative Player profile mutation with direct client writes removed.
- Product-neutral inventory ownership with an authenticated read-only projection; no client grant or consumption path.
- Product-neutral reward inbox, atomic claim, immutable receipt, and request idempotency are accepted and validated on dev-clean.
- Wallet implementation is deferred until D-14 identifies an accounting need that Inventory plus narrow transaction receipts cannot satisfy.
- Product Batch A has a source-verified, dependency-ordered approval brief.

## Next, in order

1. Complete M2 Engineering Readiness: developer diagnostics, test layers, shared runtime UX, neutral asset delivery, observability transport, and safe operations foundations.
2. In parallel outside engineering implementation, obtain Circle/Product-owner decisions for M3 without applying defaults.
3. Select the 1–3 Character slice only after the M3 dependencies close.
4. Run the Character-specific animation delivery PoC in M4 before committing the production asset pipeline.
5. Build the M5 playable vertical slice only from approved M3/M4 contracts.

The extraction baseline and dependency decisions are recorded in `COMMON_CORE_DEPENDENCY_MAP.md`.

## Decisions intentionally deferred

Gacha prices and rates, duplicate requirements, economy values, guild size, PvP/GvG, support calculation, rankings, shared goals, raids, quests, missions, and release schedule remain unfixed and must not be coded as defaults.
