# GAME04 common Preview integration — 2026-09-25

Dedicated branch: work/game04-common-preview-20260925. No main merge, production deployment or G5 acceptance.

## Received source
| Deliverable | Saved head | Handling |
|---|---|---|
| G2 PR30 | 29b1515f677bb475cb22b956c9802b88f51c2411 | retained; context save optimization OFF, performance remains below gate |
| G3 PR33 | fab7dc7be6128c09e0ff0243c5c446ccd9dc7ab5 | implementation c47c1f4 received; standalone closed; integrated normal/special gacha |
| Tutorial PR34 | ec35f6f205045f72748f14ad7932892867658daf | approved scenes, text, effects preserved; authoritative tutorial actions added |
| Community PR35 | 9f72a1fb6088dc108e4eaffeafe9631e8461b7e5 | retained identity/read UI; approved extra activities connected atomically |
| P02–04 PR31 | 3ca2e73ccca1a816bef6d8aa3a3dbecca3494a79 | prior G2 integration retained; no duplicate implementation |
| Audit PR36 | 51cbf80887e2dcd66aec7e9c1fbf2e876d751e35 | confirmed precision fix + formal 72 skill registry + newly approved names received at 20:24 JST |

## Ownership / environment
G3 isolated write window ended 19:34 JST; G2 received deployment ownership in PR33 comment 5831429757. Old-G2 stop checks are not restarted.
Only isolated project `znakrkaazliexzwihxge` updated. API game04-redesign-api v6, verify_jwt=true, management sha256 `a5b580ea7c79199bc355e55dea2cd72ed071cca8e294e2e0ae0fa8b30a0cbe47`.
Six existing G3 Vercel branch-scoped variables moved to this integration branch without changing values. Production and other branch variables untouched. Existing immutable G3 deployment remains available; future G3 rebuild would require reassignment.

## Integrated connections
- New authenticated anonymous player -> server initializer -> 17 saved tutorial scenes -> exact three R characters/three formal LB0 skills -> fixed formation -> name -> first home -> normal quest -> first defeat -> existing normal missions.
- Existing accounts/inventory retained. Login bonus starts on second home visit; first home suppressed. Save retries validate request operation and payload.
- SSR summon/exchange grouped per request; soul unlock, max awakening/LB, area completion, owner final territory clear recorded only on state edges. Encounter stays unpublished; existing rescue publication retained.
- Isolated runtime supplementation: current energy policy, formal master registry/asset trigger, battle EXP settlement, paid-item exchange, territory hosting/clear/unlock/snapshot triggers, current community profiles/chat/DM reads and writes. No old player data copied.
- Skill effect numeric authority restored to unrounded master; local 8,800 comparisons zero differences. Invasion source regenerated against corrected values; DB master validator passed.

## Remaining acceptance
G2 incomplete; no G5 pass. Midnight/free gacha/login/daily missions/notices, complete performance (including missing battle-start), final auth/payment acceptance and unfinished master audit remain on the common candidate.
G2 saved 80 measurements and v31 recovery stay complete; final 20 battle logs unrecoverable, no browser recovery repeated.
MA08: b4e3f8c records user approval of all 65 quest names, 85 encounter contexts, 356 enemy placements and 60 invasion stages. Imported approved helpers, preserved current profile/badges, connected rescue display. DB quest65 added and release_manifest names synchronized; old snapshots/post bodies unchanged. Sound: no newer handoff found in sound branches or Japanese sound commit search; existing saved assets/functions retained, separate new sound delivery remains residual.
Browser-through-root acceptance and common deployment URL will be appended after deployment.

## Common deployment evidence
Initial integration: f31266313b18dc9b0bca03ed45e3078b6f5840f0; approved names: 2fd350a144a2518272b9542ed6c5aa6d35bb984e; rescue level/context: 3fe62cc5063b64171b94401c2a1a05d3c4487475.
Common branch URL: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app/
See STATUS.md for the consolidated delivery/remaining list and BROWSER.md for exact tested revisions. API readback equals the tracked v6 bundle in full. No source/bundle recovery gap remains for the delivered candidate.

Late confirmed input 51cbf80 (20:50 JST approval): new encounter supply and final invasion souls applied to new masters/snapshots only. 29_approved_raid_supply.sql updates only the isolated master rows; legacy snapshots untouched. The original supply audit against v31 flags known precision differences, so verify_game04_common_supply.cjs checks the composed approved changes with narrow separately verified precision fields.
