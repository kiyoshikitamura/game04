# Corrected character visual references

Use the six `*-baseline.jpg` images in this directory as the corrected visual targets. All are 1536 × 1024, JPEG quality 90, and retain the original body designs except for the targeted corrections below. Mock numbers remain illustrative, not gameplay authority.

- 01: both equipped skill cards now say `LB 0`; character and equipment level labels stay unchanged.
- 02: existing corrected reference removes the Critical field and uses the common chrome.
- 03–05: body designs preserved.
- 06: duplicate result strips behind the three central result dialogs removed; each example has one central result presentation.
- All six: common header and footer composed from `docs/verification/raid-20260923/body/raid-policy-list.jpg`, with the Character footer route selected.

Reproduce the final chrome composition with `node scripts/character-reference-chrome.mjs`. Set `CHROME_PATH` if the local browser executable differs.

The 01 and 06 `*-body.png` files are imagegen intermediates. The existing 02 baseline PNG is the source intermediate, not an additional final target.

## Imagegen edit prompts

Built-in imagegen was used after inspecting the original references.

01: “Edit this exact 1536x1024 three-panel Japanese game UI mockup. Change ONLY the two equipped skill level labels: in middle panel, bottom equipped skill card 一文字斬り, replace Lv.1 with LB 0; in right panel, upper equipped skill card 一文字斬り, replace Lv.1 with LB 0. Keep all character Lv.1 labels, all equipment Lv.1 labels, art, composition, borders, typography sizes, Japanese text, menus and footers unchanged. Preserve the original image exactly everywhere else. Output full three-panel image at same dimensions.”

06: “In EACH of the three panels remove ONLY the old duplicate result strip visible behind the central result dialog at the BOTTOM of the darkened background (the short outlined strip running approximately y=742 through y=880, which includes another item thumbnail, another close X at right and a red button). Replace that old bottom strip with matching empty very dark floral panel background. Keep the ONE central large foreground result dialog in each panel exactly unchanged, at y=290 to830. Keep underlying upper operation panel, all foreground text, artwork, icon, borders, header, tabs, footer and full three-panel composition unchanged. Each panel must have just one result presentation: the large central foreground modal, with no second duplicate result strip peeking out underneath.”

All six final images were visually inspected after rendering.
