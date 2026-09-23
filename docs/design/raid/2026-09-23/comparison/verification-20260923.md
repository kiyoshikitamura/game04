# レイドUI表示層・承認モック再照合記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `7801337ee521e2c8851f71993341a282c3bce906`
- Fixed Preview: https://game04-o02w9r1kk-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_J2ijwnp5wiJgGSZiAPWF9ikhZJ21` / Ready / Preview

## 今回の修正

- コンパクト表示の固定帯に、小さい開催者顔・ボス名・開催者名・HPを集約。本文側のボス名／開催者／HPを重複表示しない。
- 詳細から `確認用Guild`、期限のJST表示、`登録参加者`、参加者画像列を除去。
- 開催者画像は顔が見えるクロップへ調整。
- 貢献欄を `自分の貢献`、`未挑戦`、`討伐報酬資格まで あと3勝`、`参加時の共通進行 Lv.1` の構成へ修正。
- CTAは暗い内側ボタンを残さず、赤いボタン面・剣アイコン・消費行動力を共通部品内で描画。
- 比較QAの3パネルに本体と同じ共通Header／Footerを含め、一覧・詳細・詳細下部を同一表示範囲で確認。

## 固定Preview検証

読み込み完了後に撮影し、ローディング中の画像は提出していない。

| Route | HTTP | GAME03旧文字列 | 検証結果 |
|---|---:|---:|---|
| `/qa/raid-approved` | 200 | 0 | 共通カード2件・詳細2状態・Footer3件 |
| `/qa/raid-detail` | 200 | 0 | 共通詳細1件・loader=0 |
| `/qa/raid-top` | 200 | 0 | 共通カード4件 |

固定Previewの比較QAでは、`確認用Guild`、`JST`、`登録参加者`を各0件、赤CTAを2件確認。`npm run typecheck`、`npm run build` はPASS。

## 比較画像

- [共通Header／Footer込み3状態](./raid-approved-full-shell-1536.png)
- [一覧比較](./raid-approved-mock-list-vs-body.png)
- [詳細比較](./raid-approved-mock-detail-vs-body.png)
- [詳細下部比較](./raid-approved-mock-lower-vs-body.png)
- [固定Preview一覧](./raid-approved-preview-390.png)
- [本体詳細上部](./raid-body-detail-390.png)
- [本体詳細下部](./raid-body-detail-lower-390.png)

## 接続保持

- GAME04マスター：`src/domain/redesign/raid.ts` の `RAID_MASTERS`、IDは `encounter_flame` / `unlock_shadow`。
- 表示経路：`RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → RaidApprovedVisual`。
- 開催者、HP、参加者、期限、報酬、救援、挑戦の取得・操作コールバックは保持。

## 残件

- 本体RPCの旧 `raidVariantId` からGAME04 IDへのサーバー側移行。
- `game04_redesign_master` の `PREVIEW_PROVISIONAL_20260920_v1` から正式承認版への昇格。
- 承認モック専用背景の供給。
- 未承認SVG9種：`clock.svg`、`people.svg`、`swords.svg`、`scroll.svg`、`handshake.svg`、`chest.svg`、`armor.svg`、`victory.svg`、`medal.svg`。正式採用済みとは扱わない。

配置・透過・不要情報削除・重複表示除去・顔クロップ・貢献欄・赤CTA・Header／Footer込みの比較は今回修正済み。素材とデータ移行の残件を表示未実装の理由にはしていない。

Production公開・mainマージは実施していない。
