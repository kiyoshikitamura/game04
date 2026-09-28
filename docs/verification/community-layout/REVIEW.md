# 交流文字・未解放中央表示（2026-09-27）

基準PR #37 / a648505。変更はHomeView.tsx/cssと文書・表示検証のみ。未読判定、BURST、記念配布、認証/決済、mino-5解放判定、一回ガイド、DBは変更なし。

- 名前12px/500、独立した省略用span。バッジ/未読を外側に残し、nowrap/ellipsis。
- 交流の活動/全体/DMは名前・時刻10pxを上段、本文13pxを下段で全文折返し。本陣は名前/本文12px、名前幅100pxを確保、本文一行省略。
- 同盟「未開放」/領土侵攻「美濃の城クリアで解放」を元ボタン内の中央へ。暗色65%・白文字100%、元の絵・名称が透ける。上下の旧説明を除去。

検証：scripts/verify_community_layout.cjs、375/390×600。実画面の活動・全体・DM・本陣を操作し、追加29検証/墨朱送信検証/長名をDOM文字列だけ差し替える表示ストレス検証（保存名・投稿の書換えなし）。本陣長文のscrollWidth>clientWidthとellipsisを確認。実Previewのクリア済みQAはCTA有効・オーバーレイなし、未クリアは既存offline QAで無効を確認。

ボタン実測：同盟64×61.25、領土侵攻168.5×64（375）/176×64（390）。オーバーレイ有無で寸法差0、中心座標差0。実行時pageerrorなし。agent-browserはCDP起動失敗のためPlaywrightで実画面を操作・測定・撮影。

型検査/共通UI契約/ビルドを実施。画面画像とresults.jsonを同梱。未読RPCと一回ガイドは前回の実DB検証記録を再利用。実機での最終可読性・受入は配信後に確認。

ビルド環境：通常のnpm run buildは開発用Supabase設定不足で停止。既存.env.preview.localをプロセスへ読み込む従来のPreview環境で再実行（値は保存/出力しない）。
結果：型検査PASS、共通UI契約PASS、Preview環境ビルドPASS（44ページ）。

## 配信済み・実機確認待ち
- 実装/配信SHA: bd62e72ab528cd0628fc47cfa1cb0b3bb69df026
- Preview: https://game04-git-work-game04-common-preview-20260925-kiyoshi-kitamura.vercel.app
- Deployment: dpl_2kMbWBLVmD9rpakt6YMvzZFJqrtm / https://game04-24azzb9v8-kiyoshi-kitamura.vercel.app
- Vercel Ready、共通URLの/api/qa/deploymentでSHA/branch/environment=previewを照合。配信直前のPR/branch先端一致。
- 配信後にも375/390×600で活動/全体/DM/本陣、名前のnowrap、本文サイズ・省略、両オーバーレイ中央・寸法不変、解放済みCTAを確認してPASS。長い名前+認証バッジもDOM限定で再現（アカウントの認証状態は変更なし）。証拠deployed/results.json・PNG。
- 残件は実機での最終可読性の受入。main・本番・GAME03の変更なし。
