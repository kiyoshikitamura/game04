# GAME04 dev構築 状況（2026-09-16）

- GAME03基準: e2998ff0ecbc2d8e608f3e47f9f43ed0fd6f723c。
- GAME04アプリSHA: 42a15254918fca8872ad7e799c04571e20fd2e46。branch: codex/game04-production-clone。
- Git tree f4c8674c8b78f7176510dcf47137cb04fb428691 はローカル検証内容と一致。
- キャラ60体・ロゴを提供PNGへ置換、型/build/画像SHA確認PASS。他素材・性能・確率・成長値維持。N素材5体はSR枠へ仮配置。
- GAME04 DB lrgyllgzcdcphlbmkknc: public257テーブル（旧10保持）、キャラ60体、Cron8、resolve-battle v1 ACTIVE。
- 匿名ログイン有効化後、正規APIで新規開始→無料10連→自動編成→派遣→無料時短→NPC勝利→報酬→Tutorial COMPLETEまでPASS。
- Home編成5人/総合力71493、ガチャ8種、レイド日次2件の参照PASS。
- GAME03への書込みなし。

## 未完了

Vercel専用game04 Preview作成は403（You don't have permission to create a Preview Deployment for this Vercel project: game04.）。可視projectはtribe-neonのみ、game04は404。GAME04をVercelへImportし連携の配信対象へ追加する必要がある。

固定Preview URL/READY未取得。ブラウザ通し確認未完了。ローカルURLはブラウザからアクセス不可。

課金/ショップDIA交換はサーバー側設定未接続で利用不可。商品表示可能、購入ボタン無効。Google等外部認証は未検証。

## 次工程

1. GAME04のVercel project作成/Import・接続権限を解決。
2. 固定SHA archive取得方式で専用Preview配信、GAME04 dev環境変数のみ注入。
3. READY後に60体/ロゴと新規プレイ導線をブラウザ確認。
4. 課金dev検証はGAME04サーバー設定とStripe test設定の接続後。

更新取り込み: GAME04_UPSTREAM_UPDATES.md。DB再現: supabase/baselines/game03-e2998ff0。元migration一括実行禁止。
