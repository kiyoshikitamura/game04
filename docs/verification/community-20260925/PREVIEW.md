# Preview確認

- 実装候補: 2046892ba4c1af102123f38a20267718a72c66c5
- GitHub Vercel status: success（2026-09-25 18:03 JST確認）
- Deployment表示ID: 8bd7ZfvYEryXe3s7VhjjYjyHYVqV
- 専用Preview: https://game04-git-work-game04-community-20260925-kiyoshi-kitamura.vercel.app
- 対象UI: https://game04-git-work-game04-community-20260925-kiyoshi-kitamura.vercel.app/qa/community
- local full build: Next.js 16.2.10 webpack成功（型/ページ生成完了）。

ブラウザで以下を確認:
1. 認証済み+VIP有効、認証済み+VIP期限切れ、未認証の3表示。期限切れにはVIPを表示しない。
2. ログイン表示待ちは認証注意を表示しない。
3. ログイン表示を閉じる→既存文言「ゲームデータを保護」と閉じる/今すぐ認証を表示。
4. 閉じる→ページreload→ログイン表示を閉じても当日は再表示しない。
5. 認証済みへの切替後は日次注意なし。
6. 対象ページのアプリ起因console errorなし。ブラウザ拡張のmetadataエラー2件はアプリと分けて記録。

証跡: preview.jpg。表示fixtureは390pxのカラム、ブラウザviewportはdesktop。実機モバイル本体・実アカウントによる最終受入を代替しない。
このfixtureはGameProviderを使わず、DB/Auth/決済へ書き込まない。

Vercel connectorはproject/deployment取得が404となったため、GitHubのVercel成功statusと実Previewのブラウザ表示で確認。不変deployment hostnameは未取得。保護設定・環境変数等は変更していない。

追補: ヘッダーVIPの期限更新は期限タイマーとfocusへ限定し、新しい毎秒のshell全体再描画を避けた。最終型検査PASS。既存Home/Raidの時間表示は保持。
