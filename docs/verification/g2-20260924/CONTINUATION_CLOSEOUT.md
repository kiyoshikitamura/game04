# G2 継続作業・版と証拠の固定記録

G2判定: **未完・受入不可**。この記録は継続作業で保存できた成果と、残る必須受入を固定する。mainマージ、G3/G4着手、Production/GAME03変更、共有alias切替、実金銭購入は行っていない。

## 継承と保存

PR #30 / `work/game04-g2-20260924` の保存済head `79669373df0af1a586d0b00cc56b4a3dcb9b1ec9` を継承。旧G1へ巻き戻していない。旧workspaceを読取で保全し、G2の不足ファイルをGitの同候補から取得。旧作業treeの未保存に見えたソースの多くは保存済headと同一であり、古いG1 indexだけで未実装と判定しなかった。旧qa-resume 02/07原本は取得できず、証拠に数えない。取得できない旧会話内部の未送信成果は再構成できない。

|コードSHA|不変Preview|Deployment|今回の本体証拠|
|---|---|---|---|
|30f5a2279831d3dfe56e1ec5b69efea76aee25ef|https://game04-pi8rl4h37-kiyoshi-kitamura.vercel.app|dpl_3gtCxY9jUXpPXqJRtbZ3so9LZQqx|390×568 BOX/育成|
|f45d5235862da4cbeff4668a1e79ade918f974c6|https://game04-jewlwh6hz-kiyoshi-kitamura.vercel.app|dpl_7fPYaSFK2x2zrYNySQUXjDKLfMLB|390×568 再開/薬/通常戦闘/お知らせ空|
|7d5239cb950465b4b8b6b31bbbd66871040d7e71|https://game04-ccrlhfsqz-kiyoshi-kitamura.vercel.app|dpl_29CKqpUsPzdow55H68XrjDXto1fQ|375×844 途中EXP/結果Dialog|
|49177788f9965e72291fb1e27be959b3e544793e|https://game04-nb14xcwec-kiyoshi-kitamura.vercel.app|dpl_BH2b8dj7GSAUCDKbfeRwZKtB1hCe|最新コード配信をmetadataで確認。本体描画の再確認はブラウザ停止で未完|

ブラウザ操作はセッションを維持する専用G2 branch URLで行い、前後の `/api/qa/deployment` と照合した。これは固定URLそのものを各操作で開いたという意味ではない。最新アプリコードtree `01f25a2593e438816dbd916c81268245600d5f15`。後続の記録保存commitはコード変更を含まない。

開発DBは `game04-dev-clean / lrgyllgzcdcphlbmkknc`。主API ACTIVE v23 / verify_jwt=true / hash `1767241b8845188e8c8697d891c5ba06f495e2c142fef067cb987e4f14c18363` を維持。autoEquipはAPI bundleに残らないため、修正前後bundle一致を確認し再配信していない。今回DB差分は `20260924183511 game04_g2_kpi_supply` のみ。rollback SQLの全assert通過後、台帳0件を確認。その後の本体ログボは実データ1件として記録した。

## 実操作とDB照合

専用QA `G2継続QA / 2b544996-e7f4-4e88-a5d2-b20f1f50b4b2` のみを操作。匿名セッションの保存復帰であり、外部認証・別端末引継ぎの合格ではない。QA正式素材は検証fixtureで、G4正式初期配布を変更していない。

- 30f5: 正式無償BOXのCHAR_EXP_M×3・ENERGY_DRINK×1・SOUL_SELECTOR_N×1を本体一括受取。受取中操作無効、受取後0件。DB3行CLAIMED、version2→5、新在庫3/1/1。既存別QAのBOXは未受取を保持。
- 30f5: 武将EXP中1個でくノ一Lv1→8、EXP0→1000、銭12600→11720、素材3→2、version6。f45再開後も表示一致。
- f45: 活力丸確認は52→102表示。処理後は103/100、薬1→0、version7、DB vitality103。時間経過による自然回復を含むため、直前53の観測なしに52へ50加えて103になったという効果計算を主張しない。上限超過保持は実証。
- f45: 本陣→1-1準備（3人/Lv8反映）→戦闘→停止/再開→2倍速→勝利→結果。DB clearedStages=mikawa-1、playerEXP20、銭12220、行動力103、武将/装備EXP小各1、version9。初回報酬と表示一致。旧スキルでの戦闘であり、正式72全効果の本体受入を代替しない。
- 7d: 375×844で武将EXP小1個を使用。Lv8据置・累計EXP1000→1100・銭12220据置・素材1→0・version10。結果上部×なし、下部閉じるで詳細へ戻る。本体のEscape/背面クリック試験は未実施。
- 供給集計: login_bonus 1event/quantity1、present_claimはCHAR_EXP_M 1event/quantity3、他2種各1event/quantity1。全件development/excluded。QA作成時点からの分類で通常集計への混入を防止。管理者HTTP/管理画面統合は別未受入。

画像/DOMは `qa-continuation/`、DB原本は `qa-continuation-db.json` と `qa-continuation/final-state-before-css.json`。画像の空いた右側はcloud browser全体と固定サイズiframeの差であり、スマートフォン実機写真ではない。375のheight query=812はharness仕様により844となる。

## 低高さ修正と受入限界

390×568の実戦闘で敵立ち絵が味方HUDを画面外へ押し出すことを発見（battle-paused.jpg）。Battle正本の常時領域に合わせ491で高さ配分を修正。文字/操作サイズ・5列・必要情報を維持し、正式最大3敵の低高さ配置とカットイン文字間隔を修正。独立source review/静的試験PASS。

修正後の新規360×568タブではRuntime.evaluate timeout、既存タブの390×568再表示もPage.enable timeout。取得済み原本を保存し、同じ復旧を反復しなかった。491の修正後スクリーンショット、5人/状態多数/長名/BURST実表示は未取得。修正前後の実表示比較完了と扱わない。

## 残る必須項目の分類

|種別|対象と必要な次の行為|
|---|---|
|採用判断・仕様|正式72名称/画像、素材10、出陣背景の対応。具体ID/候補はcontinuation-u01-u02.mdと既存契約表。daily10の失効/日跨ぎ/侵攻令、侵攻過剰damage算入は主報告の比較案を維持。素材の新規視覚候補作成/採用はまだ完了していない|
|外部依存|P02〜04 PR31の関連実装・ドメイン後の設定と統合受入。決済/VIP購入、外部認証、法務運用値。P06は別スレッド、本番変更なし|
|実検証・実装残|最終491本体再検証、全画面/主要状態/実機Safari/キーボード、性能分離計測、全供給producer接続/同候補共闘・侵攻/認証横断受入。不明masterおまかせの本体保存、画像失敗回復も局所試験から先は未受入|

採用済み侵攻5城共通背景・共闘17素材・主催仮FIXは再承認不要。旧資産の削除・番号順変換・黙ったEXP換算は行わない。未検証は仕様判断待ちへ付け替えず、G2必須のまま保持する。
