# レイドUI表示層 書き直し検証記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `6018f2a5d00fcb6ab56bb9cb26e65fbb25a9445a`
- Fixed Preview: https://game04-8fes2ifvp-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_DZy6PBMFySwqZdg1E7TVkeedUBty` / Ready / Preview

## 実装範囲

- `RaidApprovedVisual.tsx/.css` を新設し、カード、詳細ヒーロー、開催者、戦況、アクション、貢献欄、進捗意匠、赤CTAを共通表示部品化。
- 本体一覧 `RaidTopApproved`、本体詳細 `RaidRoomDetail`、比較QA `/qa/raid-approved` が同じ共通表示部品を使用。
- 旧 `RaidCardOverlay.css`、旧 `RaidRoomDetailApproved.css`、QA専用 `ApprovedRaidPreviewCorrection.css` を削除。旧クラス体系と重複上書きを対象範囲から除去。
- 正式データ取得、開催者情報、既存の報酬・救援・挑戦コールバックは親コンポーネント側で保持。

## 固定Preview検証

必須データ・画像の読み込み完了後に撮影。ローディング表示中の画像は提出していない。

| Route | HTTP | GAME03旧文字列 | 表示確認 |
|---|---:|---:|---|
| `/qa/raid-approved` | 200 | 0 | 共通カード2件 |
| `/qa/raid-top` | 200 | 0 | 共通カード4件 |
| `/qa/raid-detail` | 200 | 0 | 共通詳細1件、loader=0 |

- 詳細下部は同一 `.ui-hub-page-scroll` を操作し、`scrollTop=305 / scrollHeight=1149 / clientHeight=844` を確認。
- 同じ詳細表示部品で、コンパクト表示=1、アクション=4、貢献欄=1、赤CTA=1を確認。
- `npm run typecheck`: PASS。
- `NEXT_PUBLIC_USE_MOCK_DB=true` 等で `npm run build`: PASS。

## 比較画像

- [一覧比較](./raid-approved-mock-list-vs-body.png)
- [詳細比較](./raid-approved-mock-detail-vs-body.png)
- [詳細下部比較](./raid-approved-mock-lower-vs-body.png)
- [固定Preview一覧](./raid-approved-preview-390.png)
- [本体詳細上部](./raid-body-detail-390.png)
- [本体詳細下部](./raid-body-detail-lower-390.png)

## データ接続

- GAME04マスター：`src/domain/redesign/raid.ts` の `RAID_MASTERS`。
- 採用ID：`encounter_flame` / `unlock_shadow`。
- 表示経路：`RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → 共通表示部品`。
- 開催者・HP・参加者・期限・報酬・救援・挑戦の取得／操作経路は変更していない。
- `キングス・クラウン`、`SHINJUKU`、`char_reiji_01` は3ルートの表示本文に0件。

## 残件

- 本体RPCの旧 `raidVariantId` からGAME04 IDへのサーバー側移行。
- `game04_redesign_master` の `PREVIEW_PROVISIONAL_20260920_v1` から正式承認版への昇格。
- 承認モック専用背景の供給。
- 未承認SVG9種：`clock.svg`、`people.svg`、`swords.svg`、`scroll.svg`、`handshake.svg`、`chest.svg`、`armor.svg`、`victory.svg`、`medal.svg`。正式採用済みとは扱わない。

配置・透過・旧レイアウト除去・重複表示除去・詳細下部のスクロール構造は素材待ちではなく今回完了扱い。

Production公開・mainマージは実施していない。
