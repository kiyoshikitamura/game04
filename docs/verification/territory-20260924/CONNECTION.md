# 領土侵攻 UI 接続確認

## 保持する接続

- 基準: `work/game04-raid-final-evidence-20260923` / `dce0bda37f353c2706e5566fba6333fbdc2c393c`。共闘最終実装 `87161e39388cb73338adbaae6cf81f7c3d34ca50` の直後の証拠コミットで、比較結果は ahead 1 / behind 0。仮 FIX 主催方針 `a21a5892be9ab7f06f7863d71304f996a8a5ec2f` を含む。
- 本体 `RedesignApp` の `territory` タブから `TerritoryView`。API の `TerritoryProjection`、開催一覧、ユーザー ID を受け取る。
- `onHost(destinationId)` → `action('territory_host', { destinationId })` → 応答 `territoryRoomId` の共闘詳細。既存の永続 request ID、API の原子的な条件確認・消費・ルーム生成は変更しない。
- `onOpenRoom(roomId)` は既存共闘詳細へ接続。期限・所有者・active 判定を保持する。
- 表示専用 helper は提供された raidMaster の段階データを読み、正式敵の能力値や抽選を再計算しない。共有 HP と個別敵 HP を分ける。

## 限定ドメイン検証

`node scripts/verify_game04_territory_presentation.cjs` は PASS。結果は `domain-presentation.json`。

5 城 × 開始・中間・最終の 15 表示について、HP / ATK / DEF、武将 Lv、敵名、正式報酬、共有 HP、既存画像参照、通常戦代表表示と固定段階の区別を確認。投影結果を書き換えても入力 Master が変わらないことを確認した。

これは UI・実 API 開催操作の証拠ではない。それらは統合担当と独立検証担当の記録を参照する。

## dev の現状読み取り

2026-09-24、Supabase `list_edge_functions` による読み取りで `lrgyllgzcdcphlbmkknc` の `game04-redesign-api` は version 19 / ACTIVE を確認。SHA256 は `fd0252361231ec6bfed20900463c592e3f3cdec7ed3b2fe88ee1cb9c7c82284e`。今回 API 配信・DB 変更は行っていない。共闘クローズ時の version 16 を再配信しない。

旧検証用セッション保存先 `/tmp/game04-work-live` は現在の環境に存在しなかった。旧証拠の QA ID だけから認証済みセッションを再作成したり、旧検証を今回実行済みと扱ったりしない。

接続担当の新規匿名 QA signup は成功したが、通常 `initialize_current_player` が初回 HTTP 400、続く診断・短い QA 名での再試行が timeout。追加再試行は打ち切り、親へセッションをローカルで引き渡した。接続担当では通常初期化・`get_state`・開催成功を検証済みとしていない。管理 DB 変更は行わない。
