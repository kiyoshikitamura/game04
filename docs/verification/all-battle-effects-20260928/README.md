# All battle effects — 2026-09-28

The current playable game routes (QuestView, RedesignApp quest/raid/territory invasion and IntegratedTutorial) all use BattleView. Removed its tutorial-only opt-in: SSR cutins and combo images now apply by default. Kept the approved 800 ms SSR baseline, enlarged skill labels, and skill -> combo -> damage ordering. Normal battle wave display, audio, server results, rewards and battle rules are unchanged.

SSR catalog: the 10 supplied characters only. Player character IDs resolve directly; enemy instance IDs require an exact catalog name and known image. Unknown phase images and unmatched characters keep the existing generic skill cutin. Art origins retain their tutorial-opening paths; these assets are now shared.

Verification:
- All 10 SSR identities; unknown name/image and transformed art rejected.
- Formal master mapping: quest 367 enemies / 66 SSR, encounter 97 / 34, territory invasion deterministic sample across all 5 castles 119 / 18. Mapping report attached.
- Mobile 390px common BattleView fixture: five SSR actions exactly once, combos 1–5, skill -> combo -> damage, pause/resume, completion callback once, normal wave header, VIP skip, non-SSR fallback, retirement cleanup, no overflow or browser/HTTP errors.
- Existing complete opening regression passes: 9 trailer SSR cutins, practice, speed changes, pause, victory/farewell/restart. QA fixture callbacks are local; no live account settlement was performed.
- npm run check uses NEXT_PUBLIC_USE_MOCK_DB=true for local validation. First dev/build attempt lacked local Supabase configuration; switched explicitly to local mock mode. No environment files or Production configuration changed.
- Initial wave QA assertion expected an intro at an already-seeked initial frame. The existing hook intentionally suppresses that intro; corrected the assertion to the normal wave header. No playback behavior changed for this test.

Git base checked: origin/main a83a94ad, shared Preview 2c8bb1a8; already included in this dedicated branch. No main/Production write.

Deployment completed: https://game04-5rimhhzm2-kiyoshi-kitamura.vercel.app
Runtime SHA: c520fc402c8c51c4470ac020dcc7b235f86d0cd7
Vercel READY confirmed and commit metadata matched. Deployed mobile shared-battle tests passed (preview/report.json); local asset-failure/retry and reload cancellation tests also passed (recovery). `npm run check` passed with explicit local mock environment. Production/main unchanged. Verification records are committed separately after deployment; the immutable tested URL above contains the runtime SHA.
