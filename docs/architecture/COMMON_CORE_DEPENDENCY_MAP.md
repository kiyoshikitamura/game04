# Common Game Core dependency map

## Audit baseline

- Source repository: `kiyoshikitamura/tribe-neon`
- Accepted source ref: `origin/main`
- Accepted source commit: `826f8b770f36a6f6844d920b0adcd2853188b91d`
- Audited: 2026-09-02
- Rule: inspect with `git show <sha>:<path>`; never copy from the dirty TRIBE NEON working tree.

The source repository is a mature product implementation with more than 200 forward migrations. Its initial schema contains permissive development policies that are tightened by later migrations. Therefore, GAME04 must not replay or cherry-pick the historical migration chain. Each accepted capability is reimplemented as one small, current-state GAME04 contract.

## Classification and dependency order

| Order | Capability | Reuse decision | Required foundation | GAME04 extraction boundary |
| --- | --- | --- | --- | --- |
| 0 | CI, environment isolation, migrations | Reimplement pattern | none | Keep the small GAME04 baseline; add deployment guards without TRIBE NEON scripts or environment IDs. |
| 1 | Auth, session, player identity | Reimplement current-state contract | Supabase Auth | Caller identity comes only from `auth.uid()`; initialization is idempotent; profile mutation is RPC-only. No anonymous tutorial or starter grant. |
| 2 | Inventory ownership | Reimplement model | Player | Generic ownership rows and read projection only. Do not import character, skill, equipment, item masters, slots, rarities, or growth values. |
| 3 | Reward transaction and inbox | Reimplement model | Player, inventory | A request ID, immutable receipt, atomic grant, and claim state. Reward kinds and amounts remain external inputs from reviewed server-side rules. |
| 4 | Wallet/economy container | Design candidate | Player, reward transaction | Ledger and balance projection may be common. Currency kinds, prices, paid/free rules, duplicate conversion, and sinks are GAME04 decisions. |
| 5 | Mission/login state | Design candidate | Reward transaction, server clock | Reuse server-authoritative progress/claim and internal dispatch concepts. Do not import mission definitions, reset cadence, rewards, or tutorial triggers. |
| 6 | Gacha transaction | Design candidate | Inventory, wallet, reward transaction, master versioning | Reuse request idempotency, atomic spend/draw/grant, and receipt shape. Do not import pools, rates, pity, prices, duplicates, banners, or presentation. |
| 7 | Friends and public profile | Design candidate | Player, moderation | Reuse owner-safe requests and server projections. Public fields and activity semantics require GAME04 definition. |
| 8 | Guild/community | Design candidate | Player, moderation, notifications | Reuse membership authority, role checks, join request lifecycle, unread/read state. Do not import guild cap, levels, donations, shops, GvG, rankings, or TRIBE terminology. |
| 9 | Chat/BBS/DM | Design candidate | Player, community, moderation | Reuse participant-scoped RLS, send RPCs, cooldown, read state, and realtime subscription boundaries. Retention and moderation rules must be defined first. |
| 10 | Battle authority/replay | Contract-only reference | Character ownership, formation, reward transaction | Reuse server-resolved canonical result, immutable snapshot, idempotent settlement, and replay viewer separation. Do not import battle engine, stats, skills, modes, AI, rewards, or presentation. |
| 11 | Operations/analytics/admin | Reimplement pattern | Each owned capability | Feature state and server-produced events can be common. Do not import TRIBE NEON feature codes, release gates, dashboards, or production assumptions. |

## Source evidence worth retaining

The following TRIBE NEON files are references for security and transaction patterns, not copy sources:

| Concern | Reference at the accepted commit | Useful concept | Must be removed/replaced |
| --- | --- | --- | --- |
| Player initialization | `supabase/migrations/20260812000105_initialize_current_player.sql` | `auth.uid()`, transaction lock, retry-safe initialization, restricted execute grant | anonymous-only flow, starter character, Tokyo base, tutorial state, username limits |
| Identity integrity | `supabase/migrations/20260812000107_auth_identity_integrity.sql` | authenticated identity checks and server-derived state | GAME03 tutorial completion and single-provider product rule |
| Owned assets | `supabase/migrations/20260805000012_owner_rls_user_assets.sql` | owner-scoped RLS | GAME03 asset tables and client-side write breadth |
| Reward ownership | `supabase/migrations/20260805000024_owner_rls_payments_presents.sql` | owner isolation | payment schema and direct client mutation |
| Missions | `supabase/migrations/20260812000133_secure_mission_foundation.sql` | internal progress dispatch; authenticated claim RPC | mission masters, values, reset rules, event codes |
| Community membership | `supabase/migrations/20260812000127_secure_guild_membership_flow.sql` | role checks and join-review lifecycle | guild economy, cap, terminology, TRIBE activity types |
| Battle replay | `supabase/migrations/20260813000144_official_battle_replay_contract.sql` | authoritative result and replay boundary | every mode, engine, master, reward, and presentation detail |
| Economy convergence | `supabase/migrations/20260822000174_economy_foundation_canonical.sql` | atomic mutation and server-owned master visibility | all GAME03 currencies, rates, pity, items, and supply values |

The monolithic `src/app/context/GameContext.tsx` is explicitly not portable. It couples authentication, tutorial, inventory, gacha, patrol, PvP, GvG, raid, payments, social state, audio, and presentation. GAME04 will expose small capability-specific server contracts and UI adapters instead.

## Extraction acceptance checklist

Every Common Core change must record all of the following in its pull request:

1. The fixed TRIBE NEON reference SHA and exact reference files.
2. The neutral GAME04 contract being introduced.
3. Removed GAME03 dependencies, values, names, assets, and presentation assumptions.
4. Tables, RLS policies, privileges, RPCs, and server-only operations affected.
5. Retry/idempotency behavior and transaction boundary.
6. Unauthorized-user and cross-user negative tests.
7. Fresh dev-clean application and acceptance result.

## Approved implementation sequence

1. ~~Complete Player authority and profile validation.~~ Completed in `9ee9230`.
2. ~~Introduce generic inventory ownership plus read-only client projection.~~ Completed by `20260902000003_inventory_core.sql`.
3. Introduce reward transaction/receipt and inbox claim authority.
4. Decide whether a generic wallet ledger is required before Character or Gacha work.
5. Add social, battle, and content capabilities only when their immediate GAME04 consumer is known.

This sequence intentionally avoids building unused abstractions. A reference capability is extracted only when the next GAME04-neutral dependency needs it.
