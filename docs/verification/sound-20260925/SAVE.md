# GAME04 sound and compact card backgrounds — GitHub save

Base: PR #37, `a4cf0726620904a3555ca4a4191b2c57557124c7`.

Imported the user's original `BGMサウンド.zip` (7 BGM tracks and 14 SE files)
and `drive-download-20260925T125624Z-1-001.zip` (N/R/SR/SSR card backgrounds).
`assets.json` records source filenames, byte lengths and SHA-256 values.
Existing GAME03 UI, reward, growth and gacha sounds remain in use.

- Title/tutorial: title; home and its features: home; quests: quest;
  encounter raid list/detail: raid; invasion and invasion raid detail: invasion.
- Battle BGM is selected by the calling screen. Quest closing stages are explicitly
  listed in `src/audio/questBgm.ts` as milestone battles. Other quest stages and
  tutorial battles use the normal track; raid/invasion battles use the boss track.
- Saved battle events drive SE, with one sound per kind per action, independent of
  target count. No received-damage, UI-error or per-enemy defeat sound is added.
  Critical audio requires a recorded critical event; no critical outcome is inferred.
- Awakening/LB and enemy phase changes share awaken. Existing volume/mute preferences
  are retained. Gacha opening ducks the home BGM and restores its configured volume.
- Pending SE is invalidated on playback transitions, speed change, SKIP, pause,
  backgrounding and unmount. Same-path BGM transitions retain playback.
- Shared CharacterCard backgrounds are selected by rarity for preparation, character
  lists and formation. BossDisplay retains its existing character background.

Scope: material and implementation saved only. No build, Preview deployment,
device playback acceptance, main merge, production/API/database change performed.

Save checks: TypeScript `--noEmit`, focused recorded-event mapping assertions,
25 imported asset SHA-256 checks, and staged whitespace/scope checks passed.
