# 初陣応援パック・本番反映記録

2026-09-28、ユーザーの「画像を反映後に本番反映、お知らせ掲載」の明示指示に基づき完了。

## 公開状態

- 本番：https://sengoku-hime-ennbu.com
- 配信先：game04-production-receiver
- Production deployment：dpl_6EcQDLEfphSk8cYqnLpbEQurfomZ
- 実装SHA：60e839e721cec76e24b161c728283d213b194763
- 本番DB：soiksqgtmcnspfedmanr。商品更新と日次表示RPCを適用済み。
- お知らせ：ID 1 / game04-starter-pack-renewal-20260928。2026-09-28 20:44:14 JST公開。
- 公開後の /api/billing/config：available=true / mode=live / catalogVersion=20260928-game04-starter-ten-tickets。
- ユーザー向けauthenticated権限でもお知らせの読取に成功。

## 最終仕様

- 初陣応援パック：100円（税込）、特選・姫武将召喚札10枚＋輝石500。ほかの同梱物を削除。1アカウント1回。
- 旧テキスト訴求を破棄し、ユーザー添付画像を加工せず使用。
- 画像：public/creative/promotions/starter-pack-100-20260928.png（1024×1536）。添付元／本番配信ファイルのSHA256はともに F9C2A6140F6DBFD1A826580218C25B83A8CA33FCC68611D25F8947B22B510F69。
- ダイアログ：最大幅420px、最大高さ760px。100dvhから上下余白32pxとsafe-areaを除いた高さまで縮小。見出しとボタンを確保し、画像を残りの領域にobject-fit:containで配置。画像のトリミングなし。
- チュートリアル突破後の全ユーザーへ、ホームでJSTの毎日1回。三河クリア条件を撤廃。
- 初回出陣・加入・装備・任務ガイド、戦闘、ログインボーナス、他ダイアログを優先。終了後に再判定。
- 購入済みユーザーも表示対象。購入済みを明示し、再購入を拒否。
- 無料10連プロモーションの既存条件・登用へのCTAを維持。
- 既存注文の内容、購入回数、120日の有効期限を維持。

## 検証

- 型検査、本番用Vercelビルド成功。
- 320×480、320×568、375×667、390×664、390×844、430×932、667×375、844×390で画像全体・44px以上のボタンが画面内に収まることを確認。ローカルChromiumによる画面サイズ再現であり、物理スマホは未接続。
- 375／390pxでガイド抑制、終了後表示、記録失敗の再試行、同日再訪抑制、翌日／購入済み表示、無料召喚CTAを確認。
- 隔離DBの実注文予約→付与→BOX受取で券10・輝石500、重複付与防止、購入上限、JST境界、端末間予約排他を確認。テストデータはすべてロールバック。
- 本番では商品読取、販売設定API、配信ドメイン、画像ハッシュ、お知らせ公開・読取を確認。実請求はしていない。
- プレビューでの確認待ちは設けず、ユーザー承認どおり本番反映と掲載まで実施。

## 証跡

artwork-results.json、artwork-*.png、browser-results.json、db-results.json。publish-news.sqlは重複掲載防止付きの実行SQL。
旧build.logは画像差替え前のローカルビルド記録。最終本番ビルドは上記DeploymentのVercelログが正本。
