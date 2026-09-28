# SR cutins — 2026-09-28

- User ZIP SR-20260928T074845Z-1-001.zip contains 15 transparent PNG files named for their characters, 1774x887 (Mori 1773x887). Names matched exactly against local character catalog and formal SR rarity. Original bytes copied; SHA256/source mapping in assets.json. No document instructions or guessed assignments.
- Base is actual latest canonical Production SHA a13b1810 (including Maeda guide and Owari EXP changes). Dedicated branch codex/sr-cutins-20260928. Initial implementation was Preview only; subsequent authorized Production release is recorded below. No main/DB changes.
- Added the 15 SR assets to the same global skill-cutin resolver as the existing 10 SSR. Unknown identity/phase images still fall back. All currently playable battle routes use this shared renderer. SR uses 800ms baseline, speed/pause synchronization, preload/retry and existing skill -> combo -> damage sequence.
- SR artwork is contained at 100% width so baked-in character names are not clipped; SSR retains its approved 115%. SR has no added colored aura (original artwork preserved).
- /qa/sr-cutins is a Preview-only selector for all 15 characters. It uses a recorded five-action fixture with the explicit test skill 土割り, and does not alter player inventories. Battle outcomes/damage in the fixture are not balance tests.
- Mapping verification covers 25 supplied characters plus all quest/encounter and a deterministic sample of every invasion castle. Mobile tests verify all 15 SR assets, labels, decoded dimensions, pause and viewport bounds. Shared playback test covers five cutins/combos, ordering, completion once, wave header, skip, unknown-character fallback and retirement cleanup. Frozen-clock screenshot is a visual inspection aid; timing is tested separately at normal clock speed.
- Initial short-cutin tests lost the overlay while waiting for Playwright pointer actionability. Pausing immediately after appearance via the same button click handler resolved the test race; the separate normal-pointer shared playback test passes.

## Saved and deployed

Runtime SHA: bb6d694d8d98d3bf05d4d7c01eac064065cf6602. Preview READY at https://game04-a50rbpgv0-kiyoshi-kitamura.vercel.app/qa/sr-cutins, deployment dpl_4rxTn1CPJgAyL2Wwu8B4uwpQ6s5H. Deployment metadata SHA matched. npm run check passed. Deployed 375px tests passed for all 15 SRs (including natural image dimensions and contained layout width); deployed full SR playback, pause, combos1–5, completion, skip and retirement checks passed. Existing SSR playback regression passed locally. At that Preview checkpoint, no Production deployment or database change had been performed.

## Authorized Production rollout

User explicitly approved SR Production release. Deployed immutable Git SHA `4920d43d726dd91650fa824c9ba8408d87e48c63` to `game04-production-receiver` using its Git source. Canonical https://sengoku-hime-ennbu.com resolved to READY deployment `dpl_DPPRo2Kg25rqPgdnj6VfubZ22eAc`. Prior canonical SHA `a13b1810a70c4d129e809d340c1a4d94cb7b636c` is an ancestor, preserving parallel Production work. Main and database were not changed.

All 15 Production SR images returned 200 and matched original ZIP SHA256 hashes; the SR QA route returned the expected Production 404. Mobile public title smoke passed with all 30 SSR/SR/combo image responses, no page errors and no unexpected failed responses. Existing acquisition KPI RPC 404 remains baseline. Live authenticated battle/tutorial progression was not exercised because no test-account session was available; runtime logs remain unavailable as previously reported. Preview gameplay verification above covers renderer behavior.

Existing Production monitor now includes SR assets; original 24-hour deadline (2026-09-29T07:13:16.248Z) is retained. Evidence: production-deployment.json, production-assets.json, production-smoke.json, production-title.png. The first asset-check helper used a Playwright-style status() call on native fetch and failed locally; corrected to the native status property, then all checks passed. No application change was required.
