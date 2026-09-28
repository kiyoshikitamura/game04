# GAME04 戦闘共通ルール実装・統合記録

更新：2026-09-20。戦闘共通ルール実装・UI接続をGAME04 dev／Previewへ反映し、仮Masterによる限定受入を確認。正式数値・全Lvバランスの受入完了ではない。

## 正本・作業基準

- Repository：`kiyoshikitamura/game04`、branch：`codex/game04-upstream-20260918`。
- 作業基準SHA：`06a9bd8953ab02a475d58abe4efe9e9ee9dde2fc`。巻き戻し先ではない。
- 正本統合SHA：`9c24e211eeab98030994001078dfcf83f5140f26`。
- 最優先正本：`docs/product/GAME04_BALANCE_AUTHORITY_V1_2026-09-20.md`。冒頭「戦闘共通ルール完成版」、第22章300行動、第25章整合確認を収録した版。
- 正本の「文書更新のみ／GitHub未統合」は添付作成時の履歴。本工程の統合・実装・配信状態は本書と進捗JSONで管理する。
- 変更可能DB：GAME04 dev `lrgyllgzcdcphlbmkknc` のみ。GAME03・Productionは変更しない。

## 対象と保存すべき機能

| 分類 | 範囲 |
| --- | --- |
| KEEP | サーバー計算・入力seed保存・結果再生、縦型UI、Quest出撃消費、Raid個別勝敗と共有HP分離、3勝資格・非遡及、開始時Lv精算、領土侵攻開催snapshot・主催者経験値・再送防止 |
| MODIFY | ダメージ・属性・端数、SP400、独立ゲージ200、BURST、枠順、効果・パッシブ、敵割込み、死亡連鎖・蘇生・フェーズ・Wave・300行動終了 |
| REMOVE（新ルール適用時） | キャラSP合算、SP満タンBURST、Lv依存抽選、高消費SP優先、SP枯渇のみでBURST終了、CRITICAL表示 |
| NEW | ルール版の識別、旧保存戦闘の互換、SPとゲージの別表示、300行動残数、共通ルールに対応した状態・詳細ログ・検証用データ |
| 対象外 | 正式な個別能力値・成長・スキル数値・回復式・敵数値・経済・報酬数量、手動戦闘、新たな大規模UI設計 |

開始済み戦闘を新ルールで黙って再計算せず、旧入力・結果・seedとルール版を保持する。既存進行の一括初期化は行わない。今回のDB変更は現在の領土侵攻Masterに限定し、既存開催snapshot・開始済み戦闘を保持した。

## 進捗を分離する

| ID | 工程 | 現在の状態 |
| --- | --- | --- |
| BC-01 | 戦闘ルール実装 | Preview反映済（限定受入） |
| BC-02 | 戦闘状態・ログ・UI接続 | Preview反映済（限定受入） |
| BC-03 | dev／Preview受入 | Preview反映済（限定受入） |
| BC-04 | 正式数値・バランス受入 | 未FIX・別工程 |

既存47件サブセット（9/19の42件＋TI-01〜05）の配信履歴を保持し、今回の4工程は進捗JSONの `battleCommonUpdates.stages` で別管理する。M2各項目の過去の「Preview反映済」は今回のルール受入を意味しない。全体141件正本の全行は未照合のため全体率は算出しない。

## 受入範囲と証跡

| 番号 | 確認対象 | 状態・根拠 |
| --- | --- | --- |
| 1 | ダメージ・属性・端数・最低1・全体・演出多段 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 2 | SP上限超過分を含むゲージ蓄積 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 3 | BURST抽選成功／失敗、行動不能、SP不足、割込み再開 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 4 | 枠順、対象再選択、補助見送り、回復条件 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 5 | 独立効果・上限・終了後再計算、パッシブ生存条件 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 6 | 行動不能終了・共通耐性、敵ブロック全体スキップ | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 7 | 同時割込み・敵連続スキル・終了後被弾SP | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 8 | 死亡時連鎖・1効果1回・蘇生・双方全滅 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 9 | フェーズ1段階・カウント保持・複合効果順序 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 10 | Wave保持・BURST持越しなし・300回目勝利優先／未決着敗北 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 11 | 同一入力seed再現・サーバー結果とUIログ一致 | PASS：ローカル24検証群。詳細は GAME04_BATTLE_COMMON_ACCEPTANCE_20260920.md |
| 12 | Quest／Raid／領土侵攻の消費・勝敗・精算・報酬冪等回帰 | ローカル回帰＋dev実APIの下記範囲でPASS。今回の多人並行は未検証 |

型検査・Build：PASS。24新検証群＋旧版バトル・共有Lv Raid・領土侵攻の3回帰スクリプト：PASS。正式数値でのバランス受入：未FIX・未実施。

### dev実API（専用QAデータ）

- 旧保存済み結果が同一。旧started fixtureの再開結果も同一で、新ルールへ再計算しない。
- Quest新規v2を同一requestで並行開始し、同じseed・結果と1回の行動力消費を確認。再送による報酬二重付与なし。
- Raidの個別WIN、Lv1を2勝で討伐した際の報酬なし、旧Lv1 started fixtureの3勝目確定でLv2共有HP不変・過去報酬なしを確認。
- Lv2新規戦闘の敵HP7475（Lv1は6500）、4勝目のLv2討伐報酬あり、Lv14個別LOSE（wins4維持）を確認。raid_claim同一request再送でmaterials／cash／appliedAcquisitionIdsが一致し、全grant claimedを確認。専用QAroomはexpiredへ変更し、削除していない。
- 同一利用者のQuest再送競合と、Raid複数参加者の同時戦闘は別の受入項目。後者は今回未検証。
- 構造化証跡：`GAME04_BATTLE_COMMON_API_ACCEPTANCE_20260920.json`（統合担当が記録）。

### Preview代表画面

- `/qa/battle-common?scenario=interrupt&viewport=360` をブラウザ実操作。360pxで横overflowなし、共通SP400とバーストゲージ200の別表示、BURST中断を確認。
- 詳細ログ641件、中央80vhダイアログ・金色のデザインスクロールバーを確認。
- limitケース最終1339フレームで残り0/300・敗北理由の一致を確認。
- main PreviewでTAP TO START／戦国姫艶武を確認。取得したconsole5件はブラウザ拡張のエラーのみ。
- QAリプレイfixtureによる代表画面確認。物理スマホ実機・全細則の画面操作受入ではない。

## 配信・DB

- 実装・Preview確認SHA：`b8675e16c325166ae9ff1215eef2795c0017edc9`。
- Vercel：success、deployment `DDo6LfyppK3yGoCsinvmTc9oXmeV`。
- DB Migration：`20260920082351_game04_common_battle_v2_master.sql` 適用済み。対象はdev `lrgyllgzcdcphlbmkknc` の現在のterritory masterのみ。新開催が `common-v2-20260920` をsnapshotへ保持するための更新。
- Master版：`PREVIEW_PROVISIONAL_20260920_common_v2`。既存14開催snapshotのdigest `a32d46f4f218ba4d1e57a4d511204f91` は適用前後で不変。player state／room／battleの一括resetなし。
- 既存の領土侵攻snapshotから始める戦闘は編成を含めlegacyルールを維持。旧保存済みstarted／settledをv2へ変換しない。
- Edge：`game04-redesign-api` version 7 ACTIVE、verify_jwt=true。
- URL：<https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/>。
- GAME03・Productionは変更していない。

## 変更ファイルの範囲

- Domain：`battle.ts`、旧版保存の`battleLegacy.ts`、`types.ts`、`masters.ts`、`quests.ts`、`raid.ts`、`territory.ts`。
- UI：`BattleView.tsx`／同CSS、`GrowthView.tsx`、`PreparationModal.tsx`、`RaidView.tsx`、`src/app/qa/battle-common/`。
- Server：`supabase/functions/game04-redesign-api/source.ts`と配信用`index.ts`、上記Migration。
- 検証・記録：`scripts/verify_game04_battle_common_v2.mjs`、`scripts/game04-battle-common/fixtures.mjs`、本書・受入記録・進捗JSON。

## 未決事項の扱い

- 正本第3章の乱数刻み・演出端数配分は総ダメージや確定範囲を変えない実装詳細として識別し、正式数値承認と混同しない。
- 回復式・スキル倍率・付与率・敵SP・耐性などは検証用または既存仮Masterとして明示する。
- 固定・継続・防御無視ダメージ等の未定義効果を正式マスターに追加しない。
- 未定義ケースを確認した場合、再現例・選択肢・影響を記録し、確定済み部分を継続する。処理ルール実装と全Lv・正式Masterのバランス受入を分離する。

既存仮Masterの回復casterATK％・蘇生maxHP％・敵被弾SP5は検証用であり正式FIXではない。未定義のpoison・SP補充効果は理由付きで無効、ATK／DEF以外のHP／SP／LUKパッシブは新ルールで保留と表示する。正式Master決定後に差し替える。実多人並行・大規模負荷・正式数値での全Lvバランス・物理実機最終確認は未受入。
