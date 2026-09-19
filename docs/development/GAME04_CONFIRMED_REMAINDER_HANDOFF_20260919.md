# GAME04 確定残件接続・本流返却台帳

監査基準: `137c3eccfb6c66a2a001096900e2edee7dc63b37`。
対象: `kiyoshikitamura/game04` / `codex/game04-upstream-20260918`。
変更可能DB: `lrgyllgzcdcphlbmkknc` のみ。GAME03・Productionへの変更なし。

## 正本と集計の境界

- ユーザー引継ぎは全体141件、未FIX・正式承認待ち35件。この総数は申告値として記録し、全行照合済みとは扱わない。
- Repositoryの `GAME04_REDESIGN_PROGRESS_20260919.json` は実装工程42件のサブセット。M6-05は初期対象外として除外済み。
- Libraryで確認できた同日付進捗Excelは旧43件・32件反映・74.4%版であり、今回の全体正本ではない。現存Excelを推測で141件へ拡張しない。
- 全体141件正本の所在・全行は未確認。今回は全体率を更新せず、4項目の実装・適用・受入根拠を差分台帳として返す。
- 本台帳は実装確認の記録であり、価格・確率・数量・成長率の正式承認を代替しない。

## 今回の差分

| ID | 実装 | 適用・検証 | Status / 残件 |
|---|---|---|---|
| M5-06 | 個人Checkpoint制限・表示を除去。見た目段階を分離。joinedLevelと既存保存互換を保持 | ローカルLv14途中参加、WIN/LOSE、3勝、非遡及、旧Lv精算、再送、次Lv強化を確認。Edge v3適用 | Preview反映済。dev実API Lv14/15・3勝・非遡及・旧Lv精算・2参加者並行処理を確認 |
| M9-03 | 初期スナップショットと新獲得イベントを分離。キャラ魂・スキルLB素材・装備個体、receipt/CASによる再送防止 | ローカル取得・重複・上限保留・未知Master・旧Edge移行境界を検証。dev Migration/Edge適用 | 接続範囲のみPreview反映済。正式変換量・上限後扱い・未知Masterは決定待ち |
| M4-06 | stage_clear / area_clear評価、サーバー受取と台帳保存、Home中央ダイアログ | ローカルFixtureで達成・未達・受取済み・無効Master等を検証。Edge v3適用 | 接続範囲のみPreview反映済。正式Mission Masterは空/無効 |
| MS-03 | Login/Present受取後の新所有再取得、明示的新Masterの取得イベント接続 | コード接続と型検査。現行Login日程や許可条件は維持 | 接続範囲のみPreview反映済。旧Item→新Material・正式Login内容は決定待ち |

MS-03は引継ぎで提示された全体正本ID。既存42件の母集団へ追加せず、進捗JSONの `taskUpdates.items` で分離管理する。

## 適用記録

- 実装commit: `f75a341cda872f043a3ef564f333e09f7f9f9988`。
- 型検査: PASS。
- Build: PASS。
- dev DB: `20260919144247_game04_acquisition_events` 適用済み。
- Edge: `game04-redesign-api` version 3 ACTIVE / verify_jwt=true。
- 今回のPreview: `f75a341cda872f043a3ef564f333e09f7f9f9988` のVercel successを確認。
- 確認URL: https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/
- 表示確認: root TAP TO START、`/qa/redesign` のHome/Raid。認証済み全画面の最終受入ではない。
- 最終統合受入: 未実施。

## 承認待ち・未検証

- 重複変換量は既存仮値をMaster化したもの。最大育成後の取得・未対応Masterはイベントを保留し、独自変換しない。
- Mission条件と報酬、Login日程と報酬、旧Item対応、正式ガチャ・Shop・VIP・成長率は本流の決定待ち。
- 既存素材を継続利用。素材不足による今回ロジック接続の停止はない。
- ローカルBattleの勝敗検証は全Lvバランス、実API多人数競合、画面の実機受入を意味しない。
- 既存初回実API記録のLv1 WINを、今回Lv14/3勝/非遡及/競合の受入根拠として流用しない。

## 関連記録

- `GAME04_RAID_SHARED_LEVEL_20260919.md`
- `GAME04_ACQUISITION_CONNECTION_20260919.md`
- `GAME04_REDESIGN_REWARD_PATH_AUDIT_20260919.md`
- `GAME04_REDESIGN_INTEGRATION_20260919.md`
- `GAME04_REDESIGN_PROGRESS_20260919.json`

## Raid実API受入の範囲

専用QAで計8戦settled（新規API開始4戦、保存済fixture再開4戦）。Lv14新規参加WIN/LOSE、同一request再送、2勝時に別参加者がLv14討伐後の旧Lv戦闘再開で3勝となってもLv15共有HP不変・報酬非遡及、Lv15個別敵HP20,150 > Lv14の19,175、Lv15討伐報酬1件、2並行claimで二重付与なし、2参加者同時Lv16精算の共有HP減少65,786が合算与ダメージと一致。QA Roomはexpired、検証用強化はLv1へ復旧。全Lvバランス・多人数負荷・実ブラウザ中断の受入ではない。

Preview追加確認: `/qa/redesign` の任務中央Dialogで内部スクロールを確認（`.rd-modal-body` clientHeight 682 / scrollHeight 953、overflowY auto）。末尾「達成報酬準備中」へ到達。既存スクロール修正を保持。

取得接続のdev実API: 6イベント（新規キャラ1、重複魂20、Skill素材2、装備個体2）の正確な取込みと後続読取での二重付与なしを確認。並行get_stateの片方はDB REST上流の非JSON応答で400となったため、並行HTTP受入は未PASS。Missionは正式Master空・不正claimの400拒否まで確認し、有効Missionの実API受取は未検証。

Present実API最終確認: Character/Skill/Equipment各2個を各同時2claimし、各組[200,400]で一方のみ成功。取得検証累計12イベント、新規キャラ+1・魂+40・Skill素材+6・装備個体+4で再取得結果完全一致。無効Mission claim400後もstate不変。`GAME04_ACQUISITION_ACCEPTANCE_20260919.json` に証跡を保存。有効Mission実API受取・Login全日程・実ガチャ抽選は未検証。並行get_stateの一方が上流非JSON400となるKnown Issueは残存。
