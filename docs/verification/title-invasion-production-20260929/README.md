# Title + area/stage invasion counts: Production release

The user approved the two-second title pulse and explicitly requested production release together with the parallel area/stage invasion counts. This supersedes the earlier Preview-only restriction for these changes.

## Deployment

- Production: https://sengoku-hime-ennbu.com
- Target: **production / READY**, Next.js 16.2.10, build duration 191 seconds.
- Deployment: `dpl_8XscEfNsx9LUwMNnbnC5Di5vRbna`.
- Production URL: https://game04-production-receiver-6wqzkx4mo-kiyoshi-kitamura.vercel.app
- Delivered SHA: `9d3f67e7c0b004c3f908bdb23197edca93859f78`.
- Branch: `work/game04-title-social-proof-20260929`.
- Title source: `08354f43` (number gold, full text pulse 2 seconds, 30-person threshold).
- Invasion source: `4219054a` (area/stage counts, number-only pulse 1.8 seconds).
- Combined Preview: https://game04-mh9yknzw2-kiyoshi-kitamura.vercel.app
- Previous production: `7b7f0e51d0e343316c229af90469856673c83f94`, deployment `dpl_5A7UxmFUhVi2xjdXutAUtysGr4Zt`.
- Both branches share `bbb64193`, the previous production plus documentation. Merge was conflict-free. Main was not changed.

Production was built with the production receiver's environment, not promoted from the isolated Preview environment. The formal domain and www alias both point to the delivered deployment. Deployment API metadata confirms the exact SHA above.

## Database

Applied only to GAME04 production `soiksqgtmcnspfedmanr`:

1. `game04_title_social_proof_v1`: additive event table and anonymous observation RPC.
2. `game04_quest_invasion_counts`: authenticated aggregate-only RPC.

No existing account/state/economy data was updated or migrated. Portal presence aggregation and sending were unchanged. Title and invasion counts retain their separate approved definitions.

Postflight:

- Invasion RPC returns 68 stage keys / 10 area keys.
- Sample live area counts: mikawa 26, owari 19, mino 18, omi 1, kai 2, echigo 3; remaining areas zero at check time.
- Independent SQL count matches mino area 18 / mino-1 stage 12.
- Invasion RPC: anon denied; authenticated allowed.
- Title event table: anon read denied; authenticated direct insert denied; anonymous narrow RPC allowed.
- Repeated identical event writes produce one event (transactional test rolled back).
- Security Advisor's RLS-without-policies information for the event table is intentional: direct client access is denied; writes go through the bounded RPC, as with existing title arrivals. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Verification

Before release:

- TypeScript and all seven title boundaries passed.
- Combined Preview build passed.
- 360/375/390px: title, area and stage layouts passed; no page JavaScript exceptions.
- Title pulse 2s on the complete text; number gold. Area/stage pulse 1.8s on the number only.
- Reduced Motion stops both animations. Below-threshold title badge absent. CTA overlap absent.
- Visual screenshots inspected; sample evidence is included here.

After release:

- Production API returned count 2, counted at `2026-09-29T01:05:00.881479Z`; same value/time in the portal attempt with `result=success`.
- `?fixture=127` on the API and `?titleOnline=127` on the game do not override production counts.
- Title initial TAP screen has no badge; selection screen correctly hides count 2 and retains usable start CTA.
- TITLE_ARRIVED, TAP_TO_START, SELECTION_VIEWED returned 204 and were verified saved in production. The latter two recorded count 2, range `<30`, displayed false. Arrival remains unknown until data is available.
- `/qa/quest-invasion` returns 404 in production.
- Delivered CSS contains title 2s and invasion 1.8s animations.
- Production browser page exceptions: 0. Runtime logs `--level error --since 10m`: 0 returned immediately after release.

Production stage/area data was verified through the authenticated RPC and independent SQL. Visual stage/area checks used the integrated Preview harness; no existing player's production session or progress was modified for UI verification. Physical phone acceptance was not performed by automation.

The files named `verify-*.mjs` are archived copies of the one-off verification scripts, preserving the URLs and scratch output paths used during release.
