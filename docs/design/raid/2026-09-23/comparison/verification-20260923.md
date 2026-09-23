# レイドUI承認モック再照合記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `ffbc5ced9a3e5793e1fc25ba056d930007730428`
- Fixed Preview: https://game04-eyhnk6w4i-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_ECUXUJbUoKK7au6shLmrDqqW8PX3` / Ready / Preview

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
| `/qa/raid-approved` | 200 | 0 | 共通カード2件、詳細2状態、Footer3件 |
| `/qa/raid-detail` | 200 | 0 | 共通詳細1件、loader=0 |
| `/qa/raid-top` | 200 | 0 | 共通カード4件 |

- 共通Header／Footer込みの承認モック・本体比較で、コンパクト戦況画像=1、4アクション、赤CTA=2を確認。
- `確認用Guild`、`JST`、`登録参加者`は固定Preview本文で各0件。
- `npm run typecheck`: PASS。
- `npm run build`: PASS。

## 比較画像

- [承認モック｜本体 同幅横並び](./raid-approved-mock-full-shell-vs-body-1536.png)
- [本体3状態 Header／Footer込み](./raid-approved-full-shell-1536.png)
- [一覧比較](./raid-approved-mock-list-vs-body.png)
- [詳細比較](./raid-approved-mock-detail-vs-body.png)
- [詳細下部比較](./raid-approved-mock-lower-vs-body.png)

## 接続保持

- GAME04マスター：`src/domain/redesign/raid.ts` の `RAID_MASTERS`、IDは `encounter_flame` / `unlock_shadow`。
- 表示経路：`RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → RaidApprovedVisual`。
- 開催者、HP、参加者、期限、報酬、救援、挑戦の取得・操作コールバックは保持。

## 残件

- 本体RPCの旧 `raidVariantId` からGAME04 IDへのサーバー側移行。
- `game04_redesign_master` の `PREVIEW_PROVISIONAL_20260920_v1` から正式承認版への昇格。
- 承認モック専用背景の供給。
- 未承認SVG9種：`clock.svg`、`people.svg`、`swords.svg`、`scroll.svg`、`handshake.svg`、`chest.svg`、`armor.svg`、`victory.svg`、`medal.svg`。正式採用済みとは扱わない。

人物の切れ、Header／開催者画像のはみ出し、詳細下部の構成、配置、不要情報、CTA内側の描画は今回修正済み。素材・データ移行の残件を表示不一致の理由にはしていない。

Production公開・mainマージは実施していない。
