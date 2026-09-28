# Enemy artwork coverage correction, 2026-09-29

The user approved skill VFX24 and requested correction of all similarly undersized enemies and Production release without another user Preview review.

Production baseline rechecked: `9964cb260c9cc887bb803eb7850d7c08b75ebb82`, `dpl_HQW3SdBsz4MzDipAiRz6ejT5syjt`. Already an ancestor. Parallel production record `c719138b` merged (documentation only). Keep main unchanged.

Cause: the bounds generator only included SR/SSR 4:3 battle variants. Mitsuhide has a 768x1376 full portrait and no battle variant; it incorrectly entered the standard small-image layout. Include non-square art using the battle-or-full source actually used by battle presentation, without changing artwork or optimized delivery URLs.

Audit: all 60 characters, 25 measured non-square and 35 approved square-standard assets. The previous 24 bounds remain unchanged. The only added entry is Mitsuhide. Existing square dimensions are intentionally retained, per the device-three correction. Enemy pool checks cover 367 quest, 97 encounter and 119 invasion entries. Mitsuhide occurrences: four quest waves, three encounters and one invasion stage (mapping.json).

Validation: TypeScript, VFX24 80 fixture/40 engine cases, common UI and unchanged API bundle passed. Browser checks: 30 cases across Chromium/WebKit, widths375/390/1280, Mitsuhide with 1/2/3 enemies, existing Nobunaga wide art and Takenaka square art. Measured image boxes, central-to-side ratio, overflow and browser errors checked; screenshots visually inspected. Initial frame0 captured the transition blackout; evidence was replaced with frame1 captures of the actual visible battle.

The temporary read-only harness uses the real BattleView and is not shipped. To reproduce locally, copy harness.tsx.txt to src/app/qa/enemy-art-audit/page.tsx, run the Preview-configured dev server on3054 and run this directory's browser-check.cjs from repo root, then remove the temporary route. Static coverage: node scripts/verify_enemy_art_coverage.cjs. Generation: Python with Pillow scripts/measure_enemy_art.py.

No gameplay, master statistics, DB, rewards, cutin, combo or VFX behavior was changed by the enemy-size correction. Production will be rebuilt with Production environment values, not promoted from Preview environment values.
