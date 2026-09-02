# Common Game Core boundary — initial

## Rule of extraction

TRIBE NEON is a reference implementation, not a source tree to copy. A module may move into GAME04 only after it is reviewed against an accepted source commit and classified below. Current uncommitted work, draft features, and GAME03 product values are excluded.

## Initial scope

| Classification | Included now | Notes |
| --- | --- | --- |
| Common foundation | Next.js/TypeScript conventions, mobile-first shell, CI quality gate, Supabase environment isolation, player identity, RLS/RPC authority pattern | implemented as a clean baseline |
| Candidate common core | Auth/session adapter, inventory ownership primitives, idempotency utility, analytics event transport, feature-state administration | extract after source-commit audit; no direct copy yet |
| GAME04 product | Character master, Creative Awakening, Push/Support, Fandom, Character Community, Shared Goal, GAME04 gacha/economy, presentation | design and implement in GAME04 after specification is fixed |
| Explicitly excluded GAME03 product | TRIBE NEON masters/assets/UI, Tokyo bases, tutorial, GvG schedule/rules, PvP/raid/ranking assumptions, GAME03 economy, mission/login bonus values, battle presentation | never import as defaults or placeholders |

## Authority rules inherited from the technical overview

- The client presents state; it does not decide draws, price, ownership, rewards, battle results, or privileged community operations.
- RLS protects user-owned rows. Authoritative mutation also validates ownership and state inside an RPC or Edge Function.
- Mutations must be transactional and idempotent. Client time is not authoritative.
- Public rankings and activity feeds are server-generated projections, not client-owned truth.
- Master data is versioned in the repository and applied through reviewed migrations.

## First extraction acceptance

Before importing a candidate module, record:

1. source repository commit SHA and consumer list;
2. dependencies removed or replaced;
3. proof that it contains no GAME03 master, asset, numbers, copy, or route assumptions;
4. migration/RLS/RPC/grant impacts;
5. preview-database fresh-user acceptance result.
