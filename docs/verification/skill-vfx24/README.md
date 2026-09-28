# GAME04 Skill VFX 24 — Preview implementation

## Baseline and scope
- Branch: `work/game04-skill-vfx24-20260929`.
- Production independently read from `sengoku-hime-ennbu.com`: `e08f4d9ef764dacd57bcfe9e1c6b2aa308e5cc04`, READY, `dpl_2Vcry54NXYJJpmHC53o4Ebz2gW5i`, project `prj_sFLd5kZeu7pjveQIkeL88ShfN8i8`.
- Based on `7bfd846f` from `work/game04-skill-condition-copy-20260929`, a descendant of Production retaining the later conditional-skill/healing copy correction (`9964cb26`). Issue #44 and open PRs reviewed. main is old and was not used as baseline.
- Previous tutorial/SSR10/SR15/combos and current enemy image scale, loading, raid, rewards and starter promotion are retained. No changes to engines, formal numerical masters, API, DB or saved battle outcomes.
- Dedicated checkout; other worktrees and uncommitted work untouched. main and Production are not deployment targets.

## Assets and integration
- Original ZIP supplied through Drive. Unmodified 24 original PNGs, README, manifest and proposed CSV are retained under `source/`.
- Each source SHA256 checked against manifest. Visually reviewed per-sheet split positions (not a generic midpoint); 48 cropped WebP files, original alpha retained, 24px transparent padding. Reproducible script `scripts/skill-vfx24/prepare-assets.py`; crop rectangles and hashes in `crops.json`. Total delivered VFX textures: 11,634,036 bytes; only textures needed by the current battle are preloaded.
- `skill-vfx24.json`: 24 effects, 40 explicit formal skill IDs checked against current presentation master. SKD026 projectile, basic attacks and unknown/legacy IDs preserve the existing 16-family fallback.
- Shared `BattleView` -> `recordedEffects` -> `BattleEffectLayer` -> seek-driven renderer, used by regular battles and QA. No independent clocks, audio or outcome calculations in VFX.
- One preparation per recorded activation; per-target impacts follow the exact recorded order. Group placement uses actual successful targets' anchors. Horizontal effects mirror by side; falling light and ground effects never invert vertically.
- Shield/counter/taunt use recorded added-status deltas. Cleanse requires actual status removal. Break effects show removal before attack, and no destruction on a zero-removal event. Counter stance is a grant, not an extra attack.
- Existing cutin -> combo -> outcome ordering and BURST policy remain unchanged. Minimum VFX times are presentation-only (420–760ms before speed).

## Preview inspection
Route `/qa/skill-vfx24`, protected with the same development/VERCEL preview guard as existing cutin QA.
Select 24 effects and any assigned skill, ally/enemy caster, 1/3 enemies, SSR/SR cutin, combo and grant/removal success. Playback, pause, speed, SKIP, replay and retire use the actual BattleView controls. Mobile playback scrolls to the battle.
Fixtures are explicitly synthetic display samples, with formal skill effect order/target/hit counts. They do not award rewards, change assets or persist progress. This does not claim a live authenticated battle or balance acceptance.

## Verification checkpoint
- TypeScript: PASS.
- Scoped ESLint: PASS.
- Existing 16-family recording regression: PASS.
- Existing cutin mapping: all 25 retained; quest/encounter/invasion pools checked (`existing-cutin-mapping.json`).
- `scripts/skill-vfx24/verify.cjs`: 80 formal-ID/side fixtures; 40 real-engine recordings; success/failure/dead/fallback/order/immutability assertions PASS (`unit-report.json`).
- Common UI and unchanged API bundle checks PASS.
- Preview-environment full Next build (webpack): PASS, including new QA route. Existing prebuild generates display-image derivatives; generated manifest drift is not part of this change.
- Immutable local build: all 48 effect/side combinations and playback controls PASS (`browser/report.json`). Existing shared battle browser regression PASS (`existing-regression/`). An earlier development run was invalidated by HMR and superseded by this immutable-build run.

Final look/timing approval belongs to the user on Preview. Physical iPhone testing has not been performed by the agent.

## Deployment and final verification
- Immutable Preview: https://game04-production-receiver-q854a2e3o-kiyoshi-kitamura.vercel.app/qa/skill-vfx24
- Runtime commit: `49f5fbbbcbac170d0e82de774ba06766f6cf30aa`; deployment `dpl_Dxwn9XJVzEaPLpGZfEcfUBrJiZ5k` READY, target Preview. Subsequent commits only save verification scripts/evidence.
- Existing Vercel Authentication remains enabled. A deployment-scoped seven-day share link was generated for user review; its token is deliberately not stored in Git. Browser verification enters through that link using a fresh browser context.
- Deployed texture verification: all 48 WebP files HTTP 200 and byte-identical SHA256; title and QA HTTP 200, 24 choices, no eager VFX loading at title and no Production DB requests (`preview/assets-and-title.json`).
- Latest Production rechecked at completion: `9964cb260c9cc887bb803eb7850d7c08b75ebb82`, `dpl_HQW3SdBsz4MzDipAiRz6ejT5syjt`, independently promoted by parallel work. This commit is already an ancestor of our baseline. This task did not change main or Production.
- Deployed Preview: all 48 effect/side cases, cutin/combo ordering, pause/resume/speed/SKIP/retire and no-op removal PASS (preview/report.json); no page errors, failed HTTP responses or write requests. 375/390/1280px layouts checked. Separate paused screenshots preserve the actual VFX instead of racing the short animation (preview/layouts.json).
