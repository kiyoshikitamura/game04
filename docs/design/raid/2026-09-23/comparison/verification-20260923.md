# レイドUI統合検証記録

- Branch: `codex/game04-raid-approved-implementation-20260923`
- Implementation SHA: `6f09fa588e18f9847f8cdbd8205d6546fb64e5e5`
- Fixed Preview: https://game04-1rn9clbn7-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_FNLgcTWGpAxPxPz5YHRuPXwbs5ST` / Ready / Preview

## 配信先検証

固定Preview上で、各画面の必須データ・画像読込完了後に検証した。比較画像はローディング表示中に撮影していない。

| Route | HTTP | GAME03旧文字列 | GAME04表示 | loader |
|---|---:|---:|---:|---:|
| `/qa/raid-approved` | 200 | 0 | 1 | 0 |
| `/qa/raid-detail` | 200 | 0 | 1 | 0 |
| `/qa/raid-top` | 200 | 0 | 3 | 0 |

- 「残り時間が短い順」の説明文は削除し、期限によるソート処理は維持。
- 一覧は全面背景の上に人物を左、情報・操作を右へ重ね、情報面を不透明な分割面にしない構造へ修正。時間は相対表示、CTAは折返しなし。
- 詳細下部は `.ui-hub-page-scroll` を実操作し、`scrollTop=328 / scrollHeight=1173 / clientHeight=844` を確認。
- 同状態でコンパクトヘッダー=1、アクション=4、赤CTA=1、`.raid-detail__eligibility`=1、ローダー=0を確認。
- `npm run typecheck`: PASS。
- `NEXT_PUBLIC_USE_MOCK_DB=true` 等のPreview用環境変数で `npm run build`: PASS。

## 比較画像（同一実装SHA）

- [一覧：承認モック｜本体](./raid-approved-mock-list-vs-body.png)
- [詳細：承認モック｜本体](./raid-approved-mock-detail-vs-body.png)
- [詳細下部：承認モック｜本体](./raid-approved-mock-lower-vs-body.png)
- [承認Preview 390px](./raid-approved-preview-390.png)
- [本体一覧 390px](./raid-body-top-390.png)
- [本体詳細上部 390px](./raid-body-detail-390.png)
- [本体詳細下部 390px](./raid-body-detail-lower-390.png)

## 差分修正結果

| 指摘 | 結果 |
|---|---|
| 一覧の人物／情報の左右配置 | 左人物・右情報の全面重ね合わせへ修正済み |
| 透過・不透明面 | 背景を隠す不透明な左右分割面を廃止し、右側の透過グラデーションへ修正済み |
| 時間表示 | 相対時間表示へ修正。説明文は追加していない |
| CTA折返し | `white-space: nowrap` と収まりを調整し、固定390pxで確認済み |
| 詳細下部 | コンパクトヘッダー、2×2アクション、貢献欄、3つの丸形進捗、赤CTAを同一スクロール状態で確認済み |
| ローディング撮影 | 本体詳細の必須アクション表示と loader=0 を待って再撮影済み |

## GAME04正式マスタ接続

- 採用根拠：`docs/design/raid/2026-09-23/comparison/master-connection.md` および `docs/design/raid/2026-09-23/IMPLEMENTATION_VERIFICATION.md`。
- マスター所在：`src/domain/redesign/raid.ts` の `RAID_MASTERS`。IDは `encounter_flame`、`unlock_shadow`。
- 関連投入履歴：`supabase/migrations/20260919151837_game04_territory_invasion.sql`。投入版は `game04_redesign_master / PREVIEW_PROVISIONAL_20260920_v1`。
- 表示経路：`RAID_MASTERS → resolveRaidTopEnemy → RaidTopEntry.enemy → RaidTopApproved / RaidRoomDetail / ApprovedRaidPreview`。一覧・詳細・比較QAを同一経路へ統一。
- `raid_production_20260830.json`、`キングス・クラウン`、`SHINJUKU`、`char_reiji_01` は表示経路から除外。旧RPCが `raidVariantId` を返すケースのサーバー側ID移行は未完了で、暫定的な表示マッピングで成功扱いにしていない。

## 残件（素材待ちと機能残件を分離）

素材待ち：承認モック専用レイド背景、および `public/ui/raid/` の未承認SVG9種。文字・別用途素材・簡易図形で正式素材扱いにはしていない。

未承認SVG9種：`clock.svg`、`people.svg`、`swords.svg`、`scroll.svg`、`handshake.svg`、`chest.svg`、`armor.svg`、`victory.svg`、`medal.svg`。正式共通素材供給後に差替える。

機能／データ残件：本体RPCの旧 `raidVariantId` → GAME04 ID移行、`game04_redesign_master` の正式承認版への昇格、Mock環境の `get_quest_raid_bonus_v1` QA stub（console clean受入）。配置・透過・余白・進捗意匠・スクロール操作は素材待ちではなく今回完了扱い。

Production公開・mainマージは実施していない。
