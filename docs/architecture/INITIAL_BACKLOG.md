# Initial development backlog

## Completed in the base repository

- Clean Next.js + TypeScript shell with mobile safe-area handling.
- Title and Home placeholders.
- CI quality gate: lint, typecheck, production build.
- Isolated three-environment contract.
- First common-core database migration: authenticated player profile with RLS and an idempotent initialization RPC.
- Explicit common-core and GAME03 exclusion boundary.
- Magic-link authentication, authenticated player initialization, and an editable player Home profile.

## Next, in order

1. Complete Player authority and profile validation from the audited Common Core patterns.
2. Extract generic inventory ownership without importing any GAME03 asset master.
3. Extract atomic reward transaction, receipt, inbox claim, and request idempotency.
4. Decide the minimum generic wallet ledger needed by future Character and Gacha flows.
5. Produce the GAME04 Product Definition for Character, Push/Fandom, Community, and Economy; do not borrow GAME03 values.
6. Build the 1–3 character vertical slice: login → character → gacha → growth → push → community.
7. Run a character animation delivery PoC before committing the production asset pipeline.

The extraction baseline and dependency decisions are recorded in `COMMON_CORE_DEPENDENCY_MAP.md`.

## Decisions intentionally deferred

Gacha prices and rates, duplicate requirements, economy values, guild size, PvP/GvG, support calculation, rankings, shared goals, raids, quests, missions, and release schedule remain unfixed and must not be coded as defaults.
