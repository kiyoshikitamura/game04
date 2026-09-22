# Quest REWORK visual verification — 2026-09-23

## Source of truth

- Instruction SHA: `21847ab3b18125c74af912c966ede8653e02966a`
- REWORK: `docs/design/quest/2026-09-22/REWORK_2026-09-23.md`
- Approved mock: `docs/design/quest/2026-09-22/quest-approved-mock.png`
- QA route: `/qa/redesign?view=quest`
- Capture viewport: 390 × 844 CSS px, same viewport for all five screens

## Implemented and visually checked

1. Area list: common header/footer, current area and next locked area, background art, current/locked badges.
2. Stage list: decorated stage number nodes, connector/status treatment, formal `designId` display, no invented user-facing stage name.
3. Challenge dialog: final-Wave enemy art from the formal quest master, rarity frame, rarity badge, existing attribute badge, level/HP, Wave/action facts, independent hint/reward dialogs, challenge CTA.
4. Preparation: five party cards, real character art, rarity frame, position markers, attribute badges, HP, `合計SP`, separated CTA layout.
5. Character detail: large real art, rarity/attribute/Lv, formal stat grid, skill icon, formal skill description and SP.

The comparison artifact includes the approved mock and the five actual Preview captures side-by-side:

- Composite: `docs/design/quest/2026-09-22/comparison/quest-visual-comparison-20260923.png`
- Individual captures: `comparison/01-area-list.png` through `comparison/05-character-detail.png`
- Reproducible capture script: `scripts/capture-quest-visual-comparison.mjs`

## Data and environment findings

- Quest start remains wired to the formal `questMaster` input/reward path; no formal values were replaced with mock values.
- The existing master does not provide an approved user-facing name for every stage, so the UI shows the formal `designId` instead of inventing a title.
- Existing production attribute badge assets are the available badge vocabulary; the six domain elements are mapped to those existing badges for presentation only. This does not change battle data.
- QA controls are behind the common `MENU` → QA panel and are not part of the quest page top composition.

## Verification

- `npm run typecheck`: passed.
- `npm run build` with `NEXT_PUBLIC_USE_MOCK_DB=true`: passed.
- Preview deployment: `https://game04-demfi1n0c-kiyoshi-kitamura.vercel.app`
- Deployment: `dpl_DnUt3VNHq4srMX7Y44byuRSFu68q`
- Production promotion and merge: not performed.
