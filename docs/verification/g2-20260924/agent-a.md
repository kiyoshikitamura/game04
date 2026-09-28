# G2 子A U01/U02 実装・照合記録

判定：独立実装・domain試験済み。U01/U02の統合API保存・本体受入は親統合候補で未確認。名称/画像72件の最終採用未確認のためU01完了とはしない。

## 基準・根拠

- G1 e62d3894b54ce70aede4a23a8fc2599c40b744da。
- AGENTS.md、MASTER_AUTHORITY/GROWTH_AUTHORITY/GROWTH_NORMAL_GACHA_HANDOFF、numeric/balance原表を参照。numeric/balanceはG1固定SHAからローカル欠損を復元しただけで改訂なし。
- 正式792行 `data/raid-skill-values.json`、効果意味 `balance-v2.json` と `getFormalRaidSkill`を利用。SKD056/072解除順を保持。

## 修正内容

|問題|原因|修正|確認|
|---|---|---|---|
|SKD72を所持/育成/味方入力で解決不可|本体は旧50のみ|formalOwnedSkills、OWNABLE_SKILL_MASTERSを独立追加|72 ID・正式792行を検証|
|味方LBが一律5%/SP固定|旧adapterの一律倍率|SKDのみLB正式行で入力|SKD071 LB1のSP139、複数武将共有|
|育成表示が一律効果倍率|GrowthView固定5%|正式の現在/次性能とSPを表示|domain試験、最終画面未確認|
|不明IDを編成保存可能|所持検査だけ|所持と解決可能masterの両方を検査|保存時に拒否、旧50は保持|
|育成結果の能力が四捨五入|詳細画面と異なる丸め|growthResultの表示のみ切捨てへ統一、計算値は維持|domain検証|
|初期energyMax50|旧定数|100に変更|初期energy/初期配布内容は変更なし|

`SKILL_MASTERS`/normalGacha/初期スキル付与は旧50poolをそのまま保持。正式72と旧50の122件は互換所持catalogであり、新ガチャ母集団ではない。G3/G4実装を行っていない。旧資産の一括換算・削除なし。過去battle snapshotは変更なし。

育成既存処理はLv間累計銭差分、繰越、失敗時nonconsumeを保持し、その成立を追加回帰で確認。取得receiptは再送時に増えず、正式IDの追加で旧所持/編成を変えない。

## 検証

- `NODE_PATH=/workspace/scratch/f93361447eb2/game04-integration-work/repo/node_modules node scripts/verify_game04_g2_master_growth.cjs` PASS。
  - 72一意ID、792 LB行全数のSP/効果値/条件倍率/確率/解除件数一致。
  - 正本付録Aのキャラ/装備各100Lv×4レア全800行、EXP/銭の両値一致。
  - レア比 N9/R33/SR16/SSR14。
  - 旧50 pool固定、所持catalog122、旧state内容保持。
  - 正式スキル取得→LB→2武将編成→実戦入力、SP139。
  - receipt重複、銭不足非消費、途中EXPの銭二重徴収なし。
  - Lv上限到達時19999 EXP繰越、Lv間累計銭、上限超過130保持。
- `verify_game04_character_growth.cjs` PASS。3/4/5枠、装備中/保護分解拒否、魂交換、装備160成長曲線/LB倍率なし。
- 上記はdomain試験であり、認証API/DB保存・実端末・本体画面受入の代替ではない。

## 実DB読取集計

GAME04 dev `lrgyllgzcdcphlbmkknc` のみ。書込みなし。

- state 40件、SKILL_001〜008各40所持＝320行、SKD0。
- legacy user_skills 12ID/27行。state資産と重複し得るため合算しない。
- growthVersion未付与/不一致かつLv>1またはEXP>0の武将0、装備0。
- `u01-live-asset-counts.json` にID別件数を保存、個人情報なし。
- 採用推奨：旧資産を変換せず独立72追加。旧50の公開導線・今後の供給はG3/移行方針判断へ。未合意換算なし。

## 統合残件

1. sourceからAPI bundleを再生成・配信し、live v19後続を保持すること（親担当）。AはAPIファイル未編集。
2. QA専用資産でSKD071取得/育成/編成/戦闘/再ログイン保存照合。既存ユーザーのstateは変更しない。
3. SKD72の名称/画像採用。`u01-skill-id-contract.md` の同一ID表で管理。未承認画像を番号対応で割当しない。
4. GrowthView現在/次性能のモバイル実表示を親統合候補で確認。
5. 全供給経路の在庫識別子/保存はBおよび親のU07/U08統合で確認。一般EXP素材旧残高をEXP8種へ黙って変換していない。
