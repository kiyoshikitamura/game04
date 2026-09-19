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
| 途中Lv討伐でXPなし | 実API予定 | 未実施 |
| 主催2勝・救援が最終討伐でXPなし | 実API予定 | 未実施 |
| 主催3勝・不在で救援が最終討伐すると主催のみXP | 実API予定 | 未実施 |
| 主催の最終討伐が3勝目ならXP | 実API予定 | 未実施 |
| Clear後に開始済み戦闘で3勝になってもXP非遡及 | 実API予定 | 未実施 |
| 同一要求再送でXP・勝利数・報酬を重複しない | 実API予定 | 未実施 |
| 同じ主催の異なる侵攻を並行Clearし加算欠落なし | 実API予定 | 未実施 |
| Clear / timeout 後の枠解放と受取権保持 | DB / 実API予定 | 未実施 |
| Master変更後も開催中の敵・期間・報酬・XPを固定 | DB / Domain予定 | 未実施 |

## 再現用スクリプト

`GAME04_TERRITORY_QA_DIR` は `/tmp` 以下の専用ディレクトリのみを受け付ける。秘密のセッションはRepositoryに保存しない。

- `scripts/game04-territory/live.mjs bootstrap`: 専用主催・救援2名の作成と初期状態取得。
- `scripts/game04-territory/fixtures.mjs prepare`: 専用IDに限定したroom・開始済みbattleのSQLと手順JSONを生成。適用は別工程。
- `scripts/game04-territory/live.mjs run`: 手順に従って実APIを呼び、私用ディレクトリに結果を保存。

開始済み戦闘fixtureの試験は、クライアントが結果を申告する方式ではない。入力・seedをサーバーDBに置き、Edgeが実際に戦闘をシミュレーションして結果を確定する。ただし通常の挑戦開始・行動力消費はこの試験だけでは受入済みにならない。

## 適用状況

作成時点: 実装・DB / Edge反映待ち。Preview反映済みとは扱わない。
