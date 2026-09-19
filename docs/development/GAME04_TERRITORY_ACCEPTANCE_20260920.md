# GAME04 領土侵攻 受入記録

Authority: `GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`、基準 `2ebc36a152c91d3edcdfc23e47a108c41a0cc9b7`。

## 検証の区別

この工程は仮マスターを使う構造・接続受入であり、正式な経験値・報酬・難易度・商材の受入ではない。

- ローカル: Domain の開催条件、開催時 snapshot、既存レイド戦闘を検証。
- 開発DB: 専用QA利用者のみ。開催RPCの枠・消費・再送および成長付与を検証。
- 実API: 専用QA room と開始済み戦闘入力を使用して Edge の結果確定を検証。Lv1000のQA編成は勝敗境界の固定用で、バランス検証には使用しない。
- Preview: モバイルのHome横並びCTA、侵攻トップ、一覧・再開・未受取報酬への導線を確認。

## Clear / XP 受入行列

| ケース | 手段 | 結果 |
| --- | --- | --- |
| 途中Lv討伐でXPなし | 実API（専用保存済battle入力） | PASS |
| 主催2勝・救援が最終討伐でXPなし | 実API（専用保存済battle入力） | PASS |
| 主催3勝・不在で救援が最終討伐すると主催のみXP | 実API（専用保存済battle入力） | PASS |
| 主催の最終討伐が3勝目ならXP | 実API（専用保存済battle入力） | PASS |
| Clear後に開始済み戦闘で3勝になってもXP非遡及 | 実API（専用保存済battle入力） | PASS |
| 同一要求再送でXP・勝利数・報酬を重複しない | 実API（専用保存済battle入力） | PASS |
| 同じ主催の異なる侵攻を並行Clearし加算欠落なし | 実API（専用保存済battle入力） | PASS |
| Clear / timeout 後の枠解放と受取権保持 | DB / 実API（専用保存済battle入力） | PASS |
| Master変更後も開催中の敵・期間・報酬・XPを固定 | DB rollback・Domain・実APIのsnapshot照合 | PASS |

## 再現用スクリプト

`GAME04_TERRITORY_QA_DIR` は `/tmp` 以下の専用ディレクトリのみを受け付ける。秘密のセッションはRepositoryに保存しない。

- `scripts/game04-territory/live.mjs bootstrap`: 専用主催・救援2名の作成と初期状態取得。
- `scripts/game04-territory/fixtures.mjs prepare`: 専用IDに限定したroom・開始済みbattleのSQLと手順JSONを生成。適用は別工程。
- `scripts/game04-territory/live.mjs run`: 手順に従って実APIを呼び、私用ディレクトリに結果を保存。

開始済み戦闘fixtureの試験は、クライアントが結果を申告する方式ではない。入力・seedをサーバーDBに置き、Edgeが実際に戦闘をシミュレーションして結果を確定する。ただし通常の挑戦開始・行動力消費はこの試験だけでは受入済みにならない。

## 適用状況

dev DB Migration `20260919151837`、Edge v4で上記実API受入済み。Preview UI確認・配信SHAは親の統合記録を参照。

## 実行結果

- 主催者XPは `0 → 0 → 100 → 200 → 200 → 400`。救援2名は0。DBのClear receiptは6件（資格あり4件・なし2件）、付与合計400。
- 最終討伐の3勝目を含めて判定。Clear時2勝のreceiptは、その後3勝になっても資格なしのまま。
- 3勝討伐報酬あり／2勝およびClear後3勝の非遡及を実API返却のrewardGrantsで照合。
- 時間切れの未受取報酬を実APIで受取成功、XP変化なし。終了roomが結果一覧に残ることをAPIで確認。
- XP400で仮成長表のLv3・開催枠3へ上昇。クリアと時間切れで開催中件数から除外。
- 別途、新規 `raid_battle` で開始から精算を確認。行動力5消費、WINで共有Lv1→2、次の敵HP6500→7475。旧Lv1の保存済battleは精算でき、Lv2共通HPへダメージを加えない。DB内battleRulesはroom snapshotと一致。
- 専用Lv1編成はLv2敵には勝利した。敗北境界は専用Lv14 roomで通常出撃しLOSE、勝利数不増を確認。これは能力値の合否判断ではない。

秘密情報を除いた証跡: `GAME04_TERRITORY_API_ACCEPTANCE_20260920.json`。開催条件・並行開催・マスター変更のrollback受入は `GAME04_TERRITORY_HOST_ACCEPTANCE_20260920.json` を参照。

## 残す確認

正式数値・正式画像・全Lvバランス・最終実機受入は対象外。Previewのスマートフォン表示確認は親の統合記録に追記する。DB／APIの接続確認をもって全画面受入完了とはしない。

## QA終了処理

専用主催者 `e3bc195d-80b8-4dcb-8384-98ffbc80e1d3` の `QA_ONLY_SETTLEMENT_20260920` roomのみ、残存activeをexpiredへ変更し通常一覧から除外。結果・receipt・battle証跡は保持。他利用者のroomは変更していない。専用3利用者のキャラLvはすべて1であることをDB照合済み。
