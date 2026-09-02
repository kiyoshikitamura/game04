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

1. Obtain Product-owner answers for Batch A D-02 through D-04; D-01 is source verified.
2. Approve D-14 and related Batch B economy boundaries before any Wallet, Gacha, or economy-shaped growth implementation.
3. Approve Fandom and Community decisions needed by the vertical slice.
4. Select the 1–3 Character slice only after its listed dependencies close.
5. Run a Character animation delivery PoC before committing the production asset pipeline.

The extraction baseline and dependency decisions are recorded in `COMMON_CORE_DEPENDENCY_MAP.md`.

## Decisions intentionally deferred

Gacha prices and rates, duplicate requirements, economy values, guild size, PvP/GvG, support calculation, rankings, shared goals, raids, quests, missions, and release schedule remain unfixed and must not be coded as defaults.
