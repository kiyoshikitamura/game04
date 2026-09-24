# キャラ配下・訂正済み比較基準

比較には本ディレクトリの6枚の `*-baseline.jpg` を使用する。1536×1024、JPEG品質90。画像内の仮数値・仮名称を仕様へ採用しない。

- 01：装備スキル2箇所を `LB 0` へ訂正。キャラ・装備のLv表記は保持。
- 02：会心率を削除した既存訂正版を継承。
- 03〜05：本体部分の意匠を保持。
- 06：暗転背面に残る旧結果帯を削除し、各例の中央結果Dialogを1つに統一。
- 全6枚：承認済み共通Header／Footerを `docs/verification/raid-20260923/body/raid-policy-list.jpg` から合成し、キャラを選択状態にする。

`scripts/character-reference-chrome.mjs` は画像編集後の中間PNGへ共通Header／Footerを合成する制作補助。01/06の中間PNGは作業用で、Git保存する比較正本は完成JPG。画像訂正をやり直す場合は以下のプロンプトと元画像を用意する。生成結果のバイト単位の再現は保証しない。

## 画像訂正時のプロンプト

原本を目視確認してから画像編集ツールを使用。

01: “Edit this exact 1536x1024 three-panel Japanese game UI mockup. Change ONLY the two equipped skill level labels: in middle panel, bottom equipped skill card 一文字斬り, replace Lv.1 with LB 0; in right panel, upper equipped skill card 一文字斬り, replace Lv.1 with LB 0. Keep all character Lv.1 labels, all equipment Lv.1 labels, art, composition, borders, typography sizes, Japanese text, menus and footers unchanged. Preserve the original image exactly everywhere else. Output full three-panel image at same dimensions.”

06: “In EACH of the three panels remove ONLY the old duplicate result strip visible behind the central result dialog at the BOTTOM of the darkened background (the short outlined strip running approximately y=742 through y=880, which includes another item thumbnail, another close X at right and a red button). Replace that old bottom strip with matching empty very dark floral panel background. Keep the ONE central large foreground result dialog in each panel exactly unchanged, at y=290 to830. Keep underlying upper operation panel, all foreground text, artwork, icon, borders, header, tabs, footer and full three-panel composition unchanged. Each panel must have just one result presentation: the large central foreground modal, with no second duplicate result strip peeking out underneath.”

最終6画像は出力後に目視確認した。
