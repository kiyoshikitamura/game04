# GAME04 全面改修 dev実API 最小確認

実施日：2026-09-19

接続先：`lrgyllgzcdcphlbmkknc` のみ。
Edge Function：`game04-redesign-api` version 1（実API確認時）。

QAユーザー：`67ee9a06-6d41-4858-8de4-b634e982c67e` / `QA再設計19`

既存の匿名認証→`initialize_current_player`→新APIを利用。アクセスtokenは記録しない。

| 確認 | 結果 |
|---|---|
| 匿名Auth・プレイヤー初期化 | PASS |
| Edge verify_jwt=true の認証 | PASS |
| get_state | 初期energy50/cash2600/5人編成 |
| Quest mikawa-1 | WIN、energy50→47、cash2600→2720 |
| 同じQuest requestIdを再送 | energy/cash/material/rewards/replay一致、二重消費・二重報酬なし |
| Unlock Raid開始 | 解禁札1枚消費、Lv1、参加者1人 |
| Raid個別1戦 | WIN、energy47→42 |
| Raid戦果接続 | sharedHP200000→198214、wins1/attempts1、参加報酬候補作成 |

Quest requestId：`4dcb764b-326f-4df2-b64e-393f5d1d9599`

Raid ID：`7b774f54-ffcb-4d7b-858b-5ebd2e16f6ec`

Raid battleId：`c1d81b5a-f268-4ddc-8b5a-9d00c1bfc658`

## 確認範囲

開発専用ユーザーの正規API操作のみ。Production・既存ユーザーへの書込みなし。
全エリア・全RaidLv・討伐3勝報酬・マルチユーザー競合の網羅確認は未実施。

## 確認後の修正

Core確認中、毒の継続ダメージがtotalDamage/キャラ分析に含まれないことを検出。毒の付与者を状態へ保持し、毒ダメージもRaid反映用totalDamageと付与者の与ダメージへ加算するよう修正。専用Core確認スクリプトでPASS。上記実API数値はこの修正前のversion1の記録。修正後の再bundle/Edge反映は親統合工程。
