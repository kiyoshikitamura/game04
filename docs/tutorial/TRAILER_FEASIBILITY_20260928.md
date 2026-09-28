# GAME04 Opening Battle Trailer Feasibility — 2026-09-28

## Basis
- Production/reference SHA: `1525abecfd0dc1646676cf85c34f0550685c099c`
- Feasibility branch: `work/game04-tutorial-trailer-20260928`
- GAME03 is untouched.
- Existing tutorial flow after the opening trailer is intentionally not redesigned in this spike.

## Decision
**Feasible with the existing recorded-battle playback. No new battle engine is required.**

The current tutorial already authors a deterministic `BattleResult` and renders it through the production `BattleView`. The opening trailer can use the same pattern while remaining completely separate from player inventory, quest progress, rewards, and battle settlement.

## Proof implemented on the feasibility branch

### Authored trailer replay
`src/domain/redesign/tutorial/trailer.ts`

- Enemy: `魔王・織田信長`, Lv.100, based on the existing Oda character master.
- Party: 豊臣秀吉 / 徳川家康 / 伊達政宗 / 上杉謙信 / 武田信玄.
- The proof gives each party member three existing formal SSR damage skills.
- Five characters use SSR skills against Oda and every displayed hit is fixed to 1 damage.
- Toyotomi then enters BURST and uses three SSR skills consecutively; all displayed damage remains 1.
- Oda then performs an authored all-target attack and all five allies become unable to fight.
- Outcome is a loss.
- The replay never calls the simulator and never writes ownership, rewards, quest progress, or settlement state.

The party Lv.100 setting and which three SSR skill IDs are selected are proof values only. They can be fixed to the final presentation choices without changing the mechanism.

### Isolated visual route
`/qa/tutorial-trailer`

Files:
- `src/app/qa/tutorial-trailer/page.tsx`
- `src/app/qa/tutorial-trailer/TutorialTrailerPreview.tsx`

This route is blocked in Production and exists only for visual verification.

### Result-screen bypass
The normal `BattleView` always shows a battle result after playback. The opening trailer requires:

`全滅 → 暗転 → 豊臣「……軍師が必要だ。」`

For this reason the branch adds an optional `autoCompleteOnFinish` prop to `BattleView`.
- Default is `false`; existing battles retain the current result screen.
- Trailer-only playback can finish directly into the next tutorial scene.
- The QA route currently demonstrates this by going directly to a dark screen with `「……軍師が必要だ。」`.

## Final integration path
Once the visual trailer is accepted:

1. Replace/shorten the current three World Introduction scenes with the trailer scene.
2. On trailer completion, transition directly to the existing Toyotomi tutorial presentation.
3. Move player-name input to the Toyotomi encounter.
4. Narrative premise: Toyotomi lost to Oda and is gathering strategists; the player is one candidate.
5. Continue with the existing tutorial functions for character acquisition, skill equipment, and the Date Masamune practice battle.
6. Do not grant any trailer party member or trailer skill to the player.

## Scope intentionally excluded from this feasibility spike
- No Production deployment.
- No player/tutorial DB migration.
- No rewrite of the existing acquisition/equipment/practice-battle logic.
- No level-design or economy changes.
- No new creative generation.
- No final dialogue copy beyond the approved key line `「……軍師が必要だ。」`.

## Remaining verification
Vercel build for the GAME04 project succeeded on the feasibility branch. Production is unchanged. Visual/device acceptance is still pending. Before integration, run:
- typecheck/build
- `/qa/tutorial-trailer` at 360px and 390px
- confirm 5 allies + 1 Oda render correctly
- confirm SSR skill effects/BURST timing are visually strong enough
- confirm every player-side damage display is 1
- confirm Oda AoE wipes all five
- confirm there is no normal battle-result screen
- confirm transition to darkout occurs without player input
