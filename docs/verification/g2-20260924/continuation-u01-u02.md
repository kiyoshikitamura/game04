# G2 継続 U01/U02・Q05/Q06 照合と限定修正

基準: PR #30 head `79669373`。旧作業ディレクトリは読取のみ。コード修正は最新共有作業ツリーで実施。G1への巻戻し、資産変換、G3/G4、DB/API配信は子Aから行っていない。

## 修正・検証

|ID|画面/状態|分類|原因と修正|検証|残件|
|---|---|---|---|---|---|
|A-CONT-01|編成・おまかせスキル/装備、不明masterの旧所持を含む状態|U01/U02 Q03|候補全所持から選ぶため高Lv不明IDを自動編成し、validateDeckが全保存を拒否。装備は不明masterを武器とみなすfallback。現在masterで解決可能な所持のみ候補化。元所持は完全保持|専用回帰を修正前実行して不明スキル選出を再現、修正後PASS。正式SKD共有、装備個体非重複、保存成立、元在庫不変、全不明時空枠を確認|最終Preview本体確認。修正SHAは親統合コミットで記録|

実行: `node scripts/verify_game04_g2_auto_equip_compat.cjs` PASS、`node scripts/verify_game04_g2_master_growth.cjs` PASS、`node scripts/verify_game04_character_growth.cjs` PASS。後二者は正式72/792行、累計育成、旧所持維持、魂最低10等の影響確認。domain検証を認証API/DB/実端末合格と扱わない。

## 承認照合で維持した項目

- 侵攻5城の共通背景 `/bg/raid/raid-castle-moonlight-v1.webp` は9/24領土侵攻ASSET_MAPPINGで採用済み。専用5城新規画像・共用の再承認を必須残件にしない。
- 共闘17素材一括採用、侵攻主催条件1/2/4/6/8・専用EXP100/150/250/400/600は採用済み仮FIX。再判断不要。
- 汎用魂交換は育成正本の2個単位に加え、MASTER_AUTHORITY_LATEST交換所表が「最低10→5、以後2個刻み」を具体化。現行最低10を不具合として2へ戻さない。
- 本陣「同盟」のロック表示は承認済み。旧char_*保存IDや過去snapshotは表示残骸とは区別して維持。

## 真の未決・具体案

|対象|根拠・現在状態|推奨/比較案|影響|
|---|---|---|---|
|SKD001〜072名称|`u01-skill-id-contract.md` 72行の設計名称。最終creative承認未確認|72設計名称を一括採用 / 世界観別名に変更。ID・正式792行数値は変えない|所持・編成・育成・戦闘・将来G3|
|同72画像|`local-skills.json` 72 designId・50既存pathの候補対応。正式Master.imageは空|既存50画像を72行で視覚比較して適合分採用、不適合だけ制作。番号順変換・未審査共用はしない|名称と同一U01表で管理し二重計上しない|
|素材10画像|下表の専用画像未採用|既存巻物意匠で10点新規候補を作り一括比較。代案は大EXP画像共用・魂/券共通画像+ラベル（誤認リスク）|育成、供給、BOX、商店|
|出陣10背景|現行先頭10画像の順番割当は地名と不一致|既存地理一致候補3（近江→char_miyabi_01、甲斐→char_go_01、越後→char_koharu_01）を比較、残7追加。代案は雰囲気背景としての意図的共用|一覧・エリア詳細。侵攻5城とは別|
|レア度4単独画像|FORMAL_RARITY_BADGES=null、文字識別あり|承認モックとの比較で文字継続か専用4バッジ制作か判断。旧GAME03画像を採用しない|共通カード等|

素材10の対応は既存 `ui-asset-contract.md` と同じ。以下pathは制作候補で未採用。

|在庫キー|用途|候補path|
|---|---|---|
|expItems.character.xlarge|武将EXP特大 20,000|/items/char_exp_xl.png|
|expItems.equipment.xlarge|装備EXP特大 20,000|/items/equip_exp_xl.png|
|genericSouls.N|N汎用魂|/items/generic_soul_n.png|
|genericSouls.R|R汎用魂|/items/generic_soul_r.png|
|genericSouls.SR|SR汎用魂|/items/generic_soul_sr.png|
|genericSouls.SSR|SSR汎用魂|/items/generic_soul_ssr.png|
|soulSelectors.N|N魂選択券|/items/soul_selector_n.png|
|soulSelectors.R|R魂選択券|/items/soul_selector_r.png|
|soulSelectors.SR|SR魂選択券|/items/soul_selector_sr.png|
|soulSelectors.SSR|SSR魂選択券|/items/soul_selector_ssr.png|

## 旧資産の具体契約

前回読取集計 `u01-live-asset-counts.json`（2026-09-24）: state40件、SKILL_001〜008各40所持=320行。legacy user_skills は12ID/27行。二経路は同一資産を含み得るため合算不可。growthVersion旧かつLv>1/EXP>0は武将0・装備0。これは当時の集計であり、後続QA正式SKD付与を含む現在件数ではない。

旧IDは全て変換なし、正式SKDは独立ID・独立所持で追加する案を推奨。既存所持・LB・編成・戦闘snapshotは保持。旧50供給/移行判断はG3等と接続し、番号順・同名だけの置換やLv/EXP換算はしない。今回のおまかせ候補除外は不明master資産を削除・換算せず、有効masterの既存旧50と正式72は引き続き候補に残す。

G2全体・U01/U02完了とは判定しない。
