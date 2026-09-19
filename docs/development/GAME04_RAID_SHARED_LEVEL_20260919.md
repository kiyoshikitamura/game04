# M5-06 Unlock Raid共有Lv参加への変更

## 実装

- 個人Checkpointによる戦闘拒否と画面のCheckpoint・追い付き案内を削除。
- Raid Masterの見た目段階を`appearanceLevels`へ分離。Lv1 / 10 / 20の既存仮素材切替を保持。
- 新規参加者に個人Checkpointを保存しない。既存JSONに残る旧`checkpoint`は参照せず、そのまま読み込める。
- `joinedLevel`は参加前Lv報酬の除外に必要なため保持。
- Raid全体3勝資格、資格取得前Lvの非遡及、勝利加算、個別HPと共有HPの分離、開始済み旧Lvの精算を保持。
- 勝利倍率1.5および既存成長率・報酬量は従来の仮Master値を維持。正式値の確定ではない。

## ローカル検証

`scripts/verify_game04_raid_shared_level.mjs`をesbuildでNode向けにbundleして実行。

- 共有Lv14へ途中参加でき、生成敵Lv14でBattleコアのWIN / LOSE成立（検証用の強弱パーティ使用）。
- 旧checkpoint=10を含む保存データでもLv14で精算可能。
- 2勝時Lv14討伐では討伐報酬なし。旧Lvの進行中戦闘で3勝に到達してもLv14報酬なし。
- 他戦闘でLv15へ更新後にLv14結果を確定しても、新共有HPを減らさない。
- Lv15新規敵のHP・ATK上昇。
- 資格取得後のLv15討伐報酬だけ付与。結果再送・受取再送で二重加算なし。
- 見た目段階Lv1 / 10 / 20の切替を保持。

## 検証境界

このスクリプトは純関数とBattleコアのローカル検証。DBロック・実APIの多人数同時処理・全Lvバランス・Preview画面の受入を意味しない。Edge sourceの旧制限除去、配信用bundle再生成、DB Master更新、Preview反映は親統合工程で別管理。

## 開発DB / Edge v3での実API確認（2026-09-19）

対象はGAME04 dev `lrgyllgzcdcphlbmkknc`、`game04-redesign-api` v3（親から配信完了連絡後に実行）。Productionは未変更。

専用QAを新規作成：

- 主催 `7f79f055-cd21-4252-a655-ebb8aa992361`
- 途中参加者 `962e2d59-1eb5-4595-9a39-aca5b370b30e`
- Room `fae7dde9-001e-4c4b-b7bc-4e61c4183f85`

### 確認結果

| 経路 | 結果 |
|---|---|
| Lv14ルームへAPI新規参加→API戦闘 | WIN、個別敵HP19,175、行動力50→45 |
| 同じ戦闘request再送 | 1勝のまま、行動力追加消費なし |
| Lv14・弱いQA編成でAPI戦闘 | LOSE、勝利数は1のまま |
| Lv14で2勝後、別参加者が共有討伐 | 共有Lv15・HP760,000へ更新 |
| 保存済Lv14戦闘をLv15更新後にAPI再開 | WIN・3勝到達、共有HP760,000を維持、Lv14報酬遡及なし |
| Lv15新規API戦闘 | 個別敵HP20,150へ上昇、討伐で共有Lv16へ進行 |
| 3勝資格取得後Lv15討伐報酬 | `defeat:15:962e2d59-1eb5-4595-9a39-aca5b370b30e`を生成 |
| 参加報酬＋討伐報酬の並行claim・再送 | 両リクエスト成功。スキル素材10→27、装備素材20→25の1回分のみ。他素材不変 |
| 2参加者の保存済Lv16戦闘を同時API再開 | 双方settled、attempts合計+2、合算ダメージ65,786と共有HP減少一致（100,000,000→99,934,214） |

戦闘記録8件は全てsettled。実APIから新規開始した4戦と、保存済開始記録fixtureからAPI再開した4戦で構成する。

開始済復帰fixtureは専用QA2名のBattle input/seed/statusをDBへ作成し、行動力を開始消費分だけ調整したもの。中断を実ブラウザで再現したテストではない。WIN用Lv1000・LOSE用Lv1、討伐直前の共有HP1などの検証用状態を使用したため、通常育成上限・正式バランス・全Lv攻略可能性の受入ではない。

検証後は専用Roomをexpiredにし、途中参加QAのキャラLvを1へ戻した。実ユーザー・既存Roomを変更していない。認証tokenは外部一時ディレクトリだけに保存し、ログ・Repositoryへ含めていない。

### 再実行用ハーネス

- `scripts/game04-raid-shared-level/live.mjs`：`GAME04_RAID_QA_DIR`（private directory）を指定して実行。
- `scripts/game04-raid-shared-level/fixtures.mjs`：esbuildでbundleし、同環境変数を指定。QA専用SQLを生成するのみ。DB適用は対象IDを確認して別実行。
- 順序：bootstrap → prepare SQL → join-win → low SQL → lose → high SQL → win2 → prepare-resume SQL → owner-defeat → resume → hp1 SQL → new-defeat-claim → prepare-concurrent SQL → concurrent。

Preview画面の受入と全Lv・多人数負荷はこの報告対象外。今回の並行検証は2参加者・2リクエストの限定条件である。
