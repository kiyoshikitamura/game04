# GAME04 production migration — 2026-09-27

User authorized production migration, then normal-device acceptance, then a separate public-launch decision. Previous pre-migration G5 gates are superseded by this sequence. Daily rollover is accepted; unresolved historical 40001/404 reports alone are not release gates. Balance integration is accepted.

## Candidate and destination

- Integration commit: `981f4037ac3c565db90de8eb40561a2f39c8097d`.
- Common Preview parent: `9099e9eafcce090d6b87c064e46ba54a81e37949` (includes retirement loading fix).
- Authentication/billing parent: `6c882e36270ab8b88f2eac2decaa734c6a1f3a25`.
- Branch: `work/game04-production-migration-20260927`.
- Vercel: `game04-production-receiver`, `prj_sFLd5kZeu7pjveQIkeL88ShfN8i8`.
- Supabase: `soiksqgtmcnspfedmanr`; confirmed zero Auth users and zero public tables before migration.
- Origin: `https://sengoku-hime-ennbu.com`.

## Database candidate

`supabase/production/20260927/manifest.json` specifies the exact reviewed source order and hashes. `scripts/build_game04_production_migration.py` generates the production copies. Development sources are preserved.

- No development users, orders, QA fixtures, or progress copied.
- Production project guards replace development project guards.
- Onboarding classifies ordinary registrations as normal, not QA. The formal tutorial is retained.
- Payment reservation, grants and webhook ledger accept live mode only.
- No Preview QA scheduler or fixture-generator RPC installed.
- `kiyoshi.kitamura@scopenext.jp` is excluded only from community activity display after verified authentication. No account access allowlist, progression bypass, extra assets, purchase exemption, or KPI exclusion is introduced.
- Purchases remain closed until production settings and delivery are connected.
- Release campaign timing remains disabled until the publication decision.

The 44 ordered SQL parts were rehearsed against an empty PostgreSQL-compatible PGlite database with Auth stubs: 50 tables; all public tables have RLS; zero application users; no QA fixture RPCs. Formal gacha, quest, territory, runtime and release-manifest JSON hashes match the current isolated development DB. This is schema verification, not production-device acceptance.

Latest integrated Edge source is rebuilt for the production project; its source/dependency/bundle hashes are checked by the existing verifier. Sandbox/live environment isolation (16 rejection cases) and eight billing fixture groups pass. Actual production Google login/payment remain device acceptance work.

## Application and recovery

Apply the generated SQL parts together in their manifest order to the confirmed empty production public schema, using a single atomic migration. Do not replay the legacy migration history or QA APPLY_ORDER instructions.

Deploy the regenerated production Edge bundle with JWT verification. Build the full repository in Production with the production Supabase public key, normal UI, QA/mock disabled, and the canonical origin. The production web must never use the Preview defaults. Configure server-only production Supabase/Stripe secrets in Vercel, never Git. Preserve existing deployment protection until the public-launch decision; do not restrict admission to the device-test email.

If application fails, retain the protected receiver, close purchases, and preserve order/payment/grant records. Avoid destructive rollback after real users or payments exist. GAME03, shared Preview, and main remain unchanged.

Status at this checkpoint: candidate saved; production application and web deployment pending. This file will be updated with actual results.
