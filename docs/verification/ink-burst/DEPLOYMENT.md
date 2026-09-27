# 検証・保存・配信記録

2026-09-27 / PR #37 / work/game04-common-preview-20260925

- 着手／保存直前PR HEADはae587a7。既存成果と競合なし。
- 共通UI契約、TypeScript、Next.js build成功（44静的ページ）。
- BURST18ドメイン条件・旧保存互換、375/390実BattleView、早期勝利、速度復帰／SKIP／離脱成功。
- 専用2ユーザーの実全体／DM送受信・未読連動成功。ダイジェストで既読にしない。
- Previewニュース公開・既存／新規BOX配布・再送1人1件・90日をDB／画面で確認。
- 3-5 CTA／ガイド実表示・再読込・保存済み確認成功。
- 配信完了時に稼働SHA・URLを追記する。

## 配信済み・実機確認待ち

- 実装保存・配信SHA：3dfdd5daf087fb99bc312d73c2b8cf0700c83078
- Ready：dpl_95gqACbrPSwj9iS4KfSTz3Qsawak
- 一意URL：https://game04-f7tnpcqne-kiyoshi-kitamura.vercel.app
- [共通Preview](https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app)
- alias切替直前にPR #37／対象ブランチ一致、切替後公開APIでSHA・ブランチ・Preview一致。
- 配信後375/390：文字画像のdecodeと幅内配置、墨朱・5連撃順序・速度復帰・SKIP・離脱、pageerror 0。
- 配信後お知らせ→BOX300輝石を両幅で確認。実未読再送→ダイジェストで保持→全体のみ既読→DM対象のみ既読、解放CTA有効を確認。
- 撮影器は開始画像の描画完了と本陣の画像準備完了を待つよう訂正。アプリへの後続変更なし。
- 後続コミットは配信証拠・検証器のみ。実機SE聴取・見え方の受入は未完了。本番公開は対象外。
