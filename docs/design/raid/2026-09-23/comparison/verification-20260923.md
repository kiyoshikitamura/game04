# レイドUI承認モック再照合記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `9fff68a`
- Fixed Preview: https://game04-hw5o3q6l4-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_G7nr6yhparC4uijAzb1idm7m7GVE` / Ready / Preview

## 機能接続の追加検証（2026-09-23）

- 一覧・詳細のレベル、定員、属性は `RAID_MASTERS` の正式値を `resolveRaidTopEnemy` から表示へ渡すよう修正。定員 `/20` と `Lv.1` の固定表示を除去。
- 挑戦数は本体 `RaidParticipantDto.finalizedBattles` を表示。勝利数、直近状態、報酬資格、参加時進行は現行本体RPCの応答に存在しないため、勝敗や挑戦数から推測せず `未取得` と表示するよう訂正。
- 報酬確認は `RaidRoomConnectedBrowser → createRaidRoomClearRewardClient → get_raid_room_clear_reward_v1`、受取は既存Present導線へ接続している。
- ただし、終了・未受取レイドを選択する本体一覧RPC `list_raid_room_cards_v1` は `ACTIVE` かつ未終了のみを返す。終了レイドを選ぶための正式な履歴RPCが未提供のため、「対象レイド選択→報酬確認→受取」は本体経路で完了確認できず、機能接続完了とは報告しない。
- 参加→出撃→勝敗確定→詳細復帰→数値更新→報酬受取の実アカウント通し確認は、旧 `raidVariantId` 移行未完了と終了レイド選択RPC未提供のため未完了。敗北時に勝利数が増えないことも、本体の勝利数フィールド未提供のためUI記録は未実施。
- 追加実装 `supabase/migrations/20260923000100_raid_room_functional_projection.sql` はGAME04 devへ適用済み。Supabase側の適用履歴は `20260923120719 / raid_room_functional_projection`。投影RPCの存在を確認した。
- 匿名Previewセッションで `list_raid_room_cards_v2` と `list_raid_room_history_v1` はHTTP 200・空結果を返した。これは本体RPCの読取接続確認であり、参加・出撃・勝敗確定・報酬受取の通し確認ではない。
- 実DBのレイドルームは適用時点で active/ended とも0件。作成RPCは `user unavailable` で拒否されたため、旧GAME03 IDのテストルームを作成して成功扱いにはしていない。
- GAME04再設計ドメインの参加→敗北→勝利→終了→報酬生成→受取は実行PASS。これは本体RPC通し検証ではない。

## 前回記録の訂正

前回記録の「顔クロップ・配置は修正済み」は、提出画像の人物切れ・Header画像のはみ出し・詳細下部の構成不一致と一致していなかったため誤記として訂正する。今回、実画像で再確認したうえで修正した。

## 今回の修正

- 一覧の人物・Header・開催者画像を顔領域へ収め、名前・HP・通貨欄へはみ出さないサイズとクリップに修正。
- 詳細下部はテキストだけの固定帯を廃止し、小さいボス画像＋背景＋ボス名・開催者・HP・時間・人数をまとめた戦況コンパクト構成へ変更。
- 詳細下部の横長背景領域を廃止し、コンパクト戦況の直下に4アクションを配置。
- 前回修正済みの不要情報削除、貢献欄、丸形進捗、赤CTAは保持。

## 固定Preview検証

承認モックと本体を同じ幅 `1536px` で横並びにして目視確認した。画像取得・必須データ読込完了後に撮影し、ローディング中の画像は提出していない。

| Route | HTTP | GAME03旧文字列 | 検証結果 |
|---|---:|---:|---|
| `/qa/raid-approved` | 200 | 0 | QA用Preview環境変数付き固定PreviewでHTML疎通を確認。目視比較画像はGit保存済み |
| `/qa/raid-detail` | 200 | 0 | QA用Preview環境変数付き固定PreviewでHTML疎通を確認。実本体機能の代替にはしない |
| `/qa/raid-top` | 未確認 | 0 | Build routeは生成済み |

- 共通Header／Footer込みの承認モック・本体比較で、コンパクト戦況画像=1、4アクション、赤CTA=2を確認。
- `確認用Guild`、`JST`、`登録参加者`は固定Preview本文で各0件。
- `npm run typecheck`: PASS。
- `npm run build`: Preview環境 PASS。ローカルはSupabase環境変数未設定のため `/auth/callback` prerenderで停止。

## 比較画像

- [承認モック｜本体 同幅横並び](./raid-approved-mock-full-shell-vs-body-1536.png)
- [本体3状態 Header／Footer込み](./raid-approved-full-shell-1536.png)
- [一覧比較](./raid-approved-mock-list-vs-body.png)
- [詳細比較](./raid-approved-mock-detail-vs-body.png)
- [詳細下部比較](./raid-approved-mock-lower-vs-body.png)
- [固定Preview QA一覧再撮影](./raid-approved-preview-qa-1536.png)
- [固定Preview QA詳細再撮影](./raid-detail-preview-qa-1536.png)
- [機能通し検証記録](./functional-flow-20260923.json)

## 接続保持

- GAME04マスター：`src/domain/redesign/raid.ts` の `RAID_MASTERS`、IDは `encounter_flame` / `unlock_shadow`。
- 表示経路：`RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → RaidApprovedVisual`。
- 開催者、HP、参加者、期限、報酬、救援、挑戦の取得・操作コールバックは保持。

## 残件

- 本体RPCの旧 `raidVariantId` からGAME04 IDへのサーバー側移行。
- 正式承認済みGAME04レイドマスタの投入・旧 `raidVariantId` からの正式ID移行。本正本が未提供のため、暫定値の昇格やID創作はしていない。
- 実DBのQAアカウント、開催可能な正式GAME04ルーム、戦闘結果を再現できる検証fixture。本体RPC通し検証にはこれらが必要。
- `game04_redesign_master` の `PREVIEW_PROVISIONAL_20260920_v1` から正式承認版への昇格。
- 承認モック専用背景の供給。
- 未承認SVG9種：`clock.svg`、`people.svg`、`swords.svg`、`scroll.svg`、`handshake.svg`、`chest.svg`、`armor.svg`、`victory.svg`、`medal.svg`。正式採用済みとは扱わない。

人物の切れ、Header／開催者画像のはみ出し、詳細下部の構成、配置、不要情報、CTA内側の描画は今回修正済み。素材・データ移行の残件を表示不一致の理由にはしていない。

Production公開・mainマージは実施していない。
