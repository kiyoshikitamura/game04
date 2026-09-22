# GAME04 メニュー・Header・ミッション／PR #22残件 引き継ぎ

作業Branch: `codex/game04-header-pr-22-ui-preview`
作業起点: `efc8d54`（`codex/game04-local-assets-20260922`）
比較対象: `60fe2f3`（`codex/game04-upstream-20260918`）、PR #22 head `eaf72be`（実装SHA `5dd9abe` を含む）

## 実装済み

- Homeの任務入口をRedesign専用の「攻略の記録」モーダルから既存Canonical `MissionPanel` へ接続。QAはCanonical Mission Master投影を表示し、QA模擬受取は無効化。
- 70面固定の攻略記録表示を任務一覧から除去。攻略の記録そのものは削除せず、任務入口との誤接続だけを解消。
- HeaderのLvをキャラ顔アイコンに重ね、顔の主要部分を隠さない小型バッジへ変更。名前側の独立Lv行は廃止。FooterとGuild Lockは変更なし。
- 保護解除カテゴリの表示を内部値 `protection` から「保護効果」へ変換。Battle判定、効果、発動条件、数値は変更していない。
- 既存の共通UI正本を `docs/product/GAME04_COMMON_UI_AUTHORITY.md` へ移設し、v1.4のメニュー／Header／Footer／正式Mission／PR #22残件を追記。

## 正本と確認状況

- Mission設計正本: `docs/product/GAME04_MASTER_AUTHORITY_LATEST_2026-09-21.md` のMission節、`docs/product/master_sources_20260921/missions.md`
- 実行時の既存Canonical投影: `src/domain/gameplay/canonical/missions.ts` と `src/domain/gameplay/canonical/data/missions_20260910.json`
- QA: `/qa/redesign` で正式Mission名、条件、0/目標進捗、報酬ラベル、攻略中状態を確認。QA受取は模擬データを変更しない。
- 実データ: Homeの任務入口から `MissionPanel` を表示する接続を確認。受取処理は既存RPCと操作遮断を使用し、QA表示と実データ接続の合格を混同しない。
- 最新Master資料は183項目設計、現行ランタイムCanonical投影は47件。資料とランタイム件数差は独自に埋めず、Master接続側の統合残件として記録する。

## PR #22残件

- 65面接続、62面336体、最終3面20体の数値照合報告は既存完了報告として保持。
- 保護解除の内部名表示は今回の表示変換で対応。実装名・内部IDは新規表示しない。
- 最終カットインの接続確認は未完了。倍速2の7-7／9-9再計測と視認性確認は、最終カットイン接続済み候補を受領後に開発・演出担当が実施する。既存50.66秒／30.01秒は比較値であり合格値ではない。

## 検証

- `npm run typecheck`: PASS
- `npm run verify:canonical-missions`: PASS（既存スクリプトは旧Production Master 37件を検証するため、最新Master 183件の受入とは別）
- Mock Preview `npm run build`（`NEXT_PUBLIC_USE_MOCK_DB=true`）: PASS、26ページ生成
- `npm run verify:battle-presentation`: 既存スクリプトの拡張子なし `src/theme/masters` importで起動前失敗。今回変更由来ではない。
- Vercel Preview: READY。
  - Project: `kiyoshi-kitamura/game04`（`.vercel/project.json` はGit管理外）
  - Deployment: `dpl_6Hu6AS3JfU2MtY8u8KdnTLUCkzQo`
  - 固定確認URL: `https://game04-e7jkzep4g-kiyoshi-kitamura.vercel.app/qa/redesign`
  - 対象Branch: `codex/game04-header-pr-22-ui-preview`
  - Preview環境は対象Branch限定で `NEXT_PUBLIC_ENABLE_QA_TOOLS=true`、`NEXT_PUBLIC_USE_MOCK_DB=false` を設定。既存のRepository内Preview公開設定 `config/game04-preview-public.json` を使用し、秘密鍵は追加していない。
  - `vercel inspect`でREADYを確認し、Deployment Protection bypass経由のHTTP取得で`/qa/redesign`のHTML応答を確認。
  - Production公開・昇格は行っていない。

本書は実装完了・ローカルPreview確認・ユーザー受入・最終演出受入を分離して記録する。Draft解除・マージ・Production公開は行わない。
