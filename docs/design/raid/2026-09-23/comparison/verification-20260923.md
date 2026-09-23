# レイドUI統合検証記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `3872d40f95529b2762ceb5d52bf963a1828dcd64`
- Preview: https://game04-n60xptccb-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_2QCsbjd4G3yh9cGwsueCFWXmBSM6` / Ready / Preview

## 配信先検証

| Route | HTTP | GAME03旧文字列 | GAME04 Master表示 |
|---|---:|---:|---:|
| `/qa/raid-approved` | 200 | 0 | 2 |
| `/qa/raid-detail` | 200 | 0 | 1 |
| `/qa/raid-top` | 200 | 0 | 4 |

- 「残り時間が短い順」は本文に表示せず、残時間によるソート処理は維持。
- 詳細下部の `.ui-hub-page-scroll` は `scrollTop=256 / scrollHeight=1100 / clientHeight=844` まで操作可能。
- 詳細下部でCTAと `.raid-detail__eligibility`（3段階丸形）を確認。
- `npm run typecheck`: PASS。
- Mock環境変数を指定した `npm run build`: PASS。

## 比較画像

- [一覧：承認モック｜本体](./raid-approved-mock-list-vs-body.png)
- [詳細：承認モック｜本体](./raid-approved-mock-detail-vs-body.png)
- [詳細下部：承認モック｜本体](./raid-approved-mock-lower-vs-body.png)
- [承認Preview 390px](./raid-approved-preview-390.png)
- [本体詳細上部 390px](./raid-body-detail-390.png)
- [本体詳細下部 390px](./raid-body-detail-lower-390.png)

## 残件

1. 承認モック専用のレイド背景が未供給。現在の表示はGAME04戦国背景で、GAME03市街地背景は使用していない。
2. `public/ui/raid/` のSVG9種は制作した未承認素材。正式採用済みとして扱わず、正式共通素材供給後に差替える。
3. `game04_redesign_master` の投入履歴版は `PREVIEW_PROVISIONAL_20260920_v1`。正式承認版への昇格はデータ側の残件。
4. 本体RPCが旧 `raidVariantId` を返すケースでは、サーバー側のGAME04 Master ID（`encounter_flame` / `unlock_shadow`）への移行が必要。表示・比較QAの固定データは既にGAME04 IDへ切替済み。

Production公開・mainマージは実施していない。
