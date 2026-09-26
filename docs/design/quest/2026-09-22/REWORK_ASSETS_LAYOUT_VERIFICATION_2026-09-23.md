# Quest assets/layout verification — 2026-09-23

## Fixed source and Preview

- Instruction SHA: `1f6ef03950599fce010d45e02a5846631f7a2979`
- Review target: `782fb9fe46ba8f3ad8f5ed34f5165dfb4c8b661b`
- Approved mock: `quest-approved-mock.png`
- QA route: `/qa/redesign?view=quest`
- Capture viewport: 390 × 844 CSS px
- Preview: https://game04-eectgcfyg-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_ZhHRyrbJkrgqy3QWWsMjS7uLf6DY`

## Asset authority correction

The previous implementation incorrectly displayed GAME03 alignment badges. The corrected GAME04 element mapping uses the asset manifest `config/game04-local-other-assets.json`, `ElementBadge`, and the six existing files below. No element data or combat rule was changed.

| Formal element ID | Display | Asset |
|---|---|---|
| `fire` | 火 | `/creative/ui/element-fire.png` |
| `water` | 水 | `/creative/ui/element-water.png` |
| `earth` | 土 | `/creative/ui/element-earth.png` |
| `wind` | 風 | `/creative/ui/element-wind.png` |
| `light` | 光 | `/creative/ui/element-light.png` |
| `dark` | 闇 | `/creative/ui/element-dark.png` |

Card/fullbody regions now use independent `contain` boxes. Rarity frames, element badges, names, levels, HP, and stats have separate positioning layers. The common preview surface is `#151216`, raised surface `#262127`, text `#F4EFE6` / `#C3B8AA`, gold `#D8B56D`, and primary CTA `#9E353B`. Header Lv is overlaid on the avatar; QA remains behind MENU and Footer is retained.

## Seven-screen visual evidence

The following images were captured by real clicks on the fixed Preview and opened for visual comparison:

- Five required screens: `comparison/01-area-list.png`, `02-stage-list.png`, `03-challenge.png`, `04-preparation.png`, `05-character-detail.png`
- Independent details: `comparison/06-hint-detail.png`, `comparison/07-reward-detail.png`
- Long detail bottom: `comparison/07-reward-detail-bottom.png`
- Mock comparison composite: `comparison/quest-visual-comparison-20260923.png`
- Capture script: `scripts/capture-quest-visual-comparison.mjs`

Result: the area list keeps current plus next locked area; stage flow keeps formal `designId` and node progression; challenge preserves formal multiple enemies and exposes formal HP/ATK/DEF plus real art and badges; preparation shows five readable cards, position markers, `合計SP 400`, and separated edit/back/challenge controls; character detail keeps face, frame, rarity, element, Lv, formal stats, skill icon/name/SP/effect without development-note text; hint/reward dialogs are independent and return to the challenge dialog; reward sections remain 初回／通常／レア with concrete existing icons, names, and quantities.

## Formal data and verification

- Quest65 formal stages/enemies/waves/rewards and existing progress behavior were not rewritten.
- Formal skill image/name lookup uses `src/theme/local-skills.json`; the display removes only the known development-note suffix and does not add replacement numbers or effects.
- `npm run typecheck`: passed.
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: passed.
- Production publish and merge: not performed.
