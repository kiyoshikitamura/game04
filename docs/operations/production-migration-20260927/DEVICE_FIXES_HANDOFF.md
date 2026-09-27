# GAME04 実機指摘 修正途中・引継ぎ（2026-09-27）

ユーザー指示により本番配信前に保存して停止。次スレッドで続行する。

## 基準
- 本番ブランチ work/game04-production-migration-20260927 / 85e3417e7637b10f2d5ba5bb4adefea7c14727e3。
- 本番 https://sengoku-hime-ennbu.com/ / Vercel game04-production-receiver。
- Supabase game04-prod / soiksqgtmcnspfedmanr。
- 本番課金実機テストはユーザー合格・クローズ。再開不要。
- 本変更は本番/API/DBへ未反映。GAME03・main・共通Previewは変更しない。

## 保存した修正（実機受入未完）
1. auth/game04/callback を CanonicalDialog 化。確認中は共通ローダー、失敗時のみ戻るCTA。認証・アカウント一致検査は保持。
2. チュートリアルCTAは文章表示中でも次へ送信する。以前の「一度目は全文表示のみ」を解消。即時 pending 表示と連打ロック、失敗時解除。次画面確定はサーバー成功後。
3. 夕桜の城下街を背景選択一覧から削除。初期・不明ID・旧castle-town/bg_default/bg_kabukicho/castle-approachは area:mikawa（三河）へ解決。素材自体は他用途のため削除しない。
4. 特選チケット10枚10連を武将/スキル/装備へ追加。サーバー単発限定チェックを除去。既存の枚数消費・10結果・ポイント処理を使用。
5. API bundle と manifest 再生成済み。新 bundle SHA256: 5a2145b27cf891d3e2ff04b9b9ed7a6a000fbba9030a1c356f44f9518d514856。

## 確認済み
- formal gachaテスト通過。3カテゴリの10枚消費/10結果/10ポイント、9枚時拒否と状態不変を追加確認。
- common UI static contract 通過。
- API bundle整合検査通過。git diff --check通過。
- tscは最初通過。sparse-checkout変更後の最終再実行では既存QA fixture docs/verification/battle-device-five/wave.json が作業ツリーから外れてTS2307。新規コードのエラー報告はなし。次担当は該当追跡fixtureを復元し再実行。
- 背景10エリアは HomeEffect → homeAmbientSource → ambient.html/ambient.js に接続済み。mikawa光/霧、owari塵/霧、mino霧、omi水面光/霧、kai霧、echigo雪/霧、kyoto灯/霧、izumo光/塵、satsuma霧/灯、sekigahara霧。動きを減らす設定や非表示タブでは停止する仕様。
- 背景演出はコード接続確認まで。実機視覚確認は未完了。

## 残件
- 修正箇所375/390幅の見た目、CTA即時反応/二重送信/失敗復帰、チケット確認ダイアログを確認。
- Google表示ドメイン変更は未実施。Supabase公式custom domainsはサブドメイン方式。候補 auth.sengoku-hime-ennbu.com。Supabase paid custom domain追加、CNAME→soiksqgtmcnspfedmanr.supabase.co、発行されるTXT設定、Google OAuthへ https://auth.sengoku-hime-ennbu.com/auth/v1/callback を旧callback保持で追加してから有効化。既存フロントのapexドメインDNSは変更しない。DNSはお名前ドットコム。Googleコンソールは前回Site Unavailableだったため、繰り返し探索せず具体的なユーザー作業に切り出す。
- 最新本番ブランチの並走差分を確認して統合、JWT検証有効でAPI配信→Vercel本番配信→限定確認。秘密値はログ/文書に出さない。
- 本番アカウントの特別通過条件やアクセス制限を追加しない。検証アカウントは通常条件、活動除外のみ。
- ユーザーは長時間の方法探索を望まない。失敗が続く場合は具体的な作業依頼またはCodexへ引継ぐ。

## 続行記録（2026-09-27）
- 回収基準 a7aefb53acc78a5dc02f12919f93ed27ff11cf28。本番ブランチは85e3417eのまま（GitHub compare identical）。
- 追加修正：特選チケットの正式名称・所持数をボタン外へ移動し、共通ActionButtonを「1枚で1回」「10枚で10連」に短縮。半幅のnowrapラベルに長い名称と所持数が連結される問題を解消。
- 型検査用の既存QA JSON fixtureを回収。formal gachaの3カテゴリ10連と不足残高原子性テスト、共通UI static、API bundle整合を再確認。
- 本番 Supabase soiksqgtmcnspfedmanr / game04-redesign-api を v2 に配信。ACTIVE / verify_jwt=true。配信ファイルを再取得し、保存SHA a7aefb53 の index.ts と全文一致を確認。bundle SHA256は上記5a2145b2…のまま。
- Web本番反映は未実施。Vercel app get_projectは入力スキーマ不整合の後、既知project IDでも404。deploy_to_vercelはTool not found。CLI認証は見つからず。繰り返し探索しない。
- 375/390のブラウザ検証は未完了。隔離ブラウザ検証は起動・一時ハーネスの問題を修正後も操作待ちタイムアウト。視覚/CTA二重送信/通信失敗復帰を合格扱いにしない。一時QAページは削除済み、製品に追加しない。
- 次作業：Vercel game04-production-receiver管理画面から、この専用ブランチの最新SHAをProductionへ配信。Readyと配信SHAを確認し、正式ドメインで4修正を375/390幅にて受入。APIは既にv2なので同じAPIの再配信は不要。
- Google表示ドメインは別途未着手のまま。本番課金実機テストは再開していない。main/GAME03/共通Previewは変更なし。
