# Initial development backlog

## Completed in the base repository

- Clean Next.js + TypeScript shell with mobile safe-area handling.
- Title and Home placeholders.
- CI quality gate: lint, typecheck, production build.
- Isolated three-environment contract.
- First common-core database migration: authenticated player profile with RLS and an idempotent initialization RPC.
- Explicit common-core and GAME03 exclusion boundary.

## Next, in order

1. Create and connect the three Supabase projects and the Vercel project.
2. Add an environment-aware Supabase server/client adapter and complete Auth → player initialization.
3. Produce the GAME04 Product Definition for Character, Push/Fandom, Community, and Economy; do not borrow GAME03 values.
4. Audit one accepted TRIBE NEON source commit for Auth/session and inventory primitives.
5. Build the 1–3 character vertical slice: login → character → gacha → growth → push → community.
6. Run a character animation delivery PoC before committing the production asset pipeline.

## Decisions intentionally deferred

Gacha prices and rates, duplicate requirements, economy values, guild size, PvP/GvG, support calculation, rankings, shared goals, raids, quests, missions, and release schedule remain unfixed and must not be coded as defaults.
