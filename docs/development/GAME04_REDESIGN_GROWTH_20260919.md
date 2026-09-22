# GAME04 育成・デッキ全面改修 2026-09-19

## Authority
- GAME04_SENGOKU_PLANNING_AUTHORITY_REDESIGN_2026-09-19.md
- GAME04_SENGOKU_GROWTH_DECK_UI_AUTHORITY_2026-09-19.md
- GAME04_SENGOKU_REDESIGN_IMPLEMENTATION_PLAN_2026-09-19.md

## 差分監査
| 分類 | 既存 | 今回 |
|---|---|---|
| KEEP | 60武将画像、確定済名称、認証、既存ユーザー資産 | 素材と資産移行元として利用。旧行を書き換えない |
| MODIFY | CharacterTab / CharacterSystemV2 の所持単位スキル、旧覚醒、7装備枠 | 新状態上の共有スキル、魂覚醒、6枠へ |
| REMOVE / HIDE | 旧SPD、旧属性、下寄せモーダル、7枠操作 | 新育成画面へ露出しない |
| NEW | 新5タブ、固定5人デッキ、編成順変更、未所持魂入手 | GrowthView と純関数 growth.ts |
| NEW | 一括分解確認 | 装備中・保護中を拒否し、対象件数と獲得原資を表示 |

## 実装
- デッキ / 編成 / キャラ / スキル / 装備。上部タブ、一覧絞込・ソート。
- 5人横一列、総HPと合計SP各1か所。手動入替・左右移動・おまかせ3種。
- キャラ中央詳細と独立全身鑑賞。Lv、魂、覚醒、パッシブ、スキル、6装備枠。
- 同一スキルの複数キャラ共有、キャラ内重複禁止、覚醒による1/2/3枠。
- 装備個体の重複割当禁止、部位検証、一括分解の選択・中央確認。
- 全操作は親API onAction を介し、pure applyGrowthAction をサーバーでも共用。
- 全モーダル中央・80vh・内部スクロール・デザインスクロールバー。

## 契約
GrowthView: `{state: RedesignState, onAction(action,payload): Promise<unknown>}`

| action | payload |
|---|---|
| save_deck | deck |
| character_level / character_awaken / character_unlock | characterId |
| skill_level | skillId |
| equipment_level / equipment_lb | instanceId |
| equipment_dismantle | instanceIds |

魂は `state.souls[characterId]` に統一し、未所持分も保持する。

## 最低限確認
- 純関数確認: Lv素材・銭消費、元状態不変、不正デッキ拒否、スキル共有、装備中分解拒否、スキル上限、魂で未所持武将入手 PASS。
- 担当ファイルのTypeScriptエラー0。統合typecheck/buildは親レーンで実施。

## 残項目
- 数値は `GROWTH_PREVIEW_RULES` に集約した開発用仮値。Economyの正式FIXではない。
- キャラ属性・Role・能力・パッシブ、スキル効果はDataレーン暫定Master。確定バランスは後工程。
- 未格納画像は既存参照素材を利用。画像差替えはMaster側で対応。
- 現在の編成5人以外はキャラ育成と鑑賞が可能。スキル/装備設定は編成へ加えてから行う。
