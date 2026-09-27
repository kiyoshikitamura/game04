# 本番配信結果 2026-09-27

- 修正コード/配信SHA: 4aad9935f6e6b574a908f4a8e27be50fe70be011
- Vercel: game04-production-receiver / Ready / Production
- Deployment: dpl_66npzZnmd5meE3XLYaFLRnn33XrM
- URL: https://game04-production-receiver-an50ftnvc-kiyoshi-kitamura.vercel.app
- 正式本番: https://sengoku-hime-ennbu.com （wwwも同じdeployment）
- deploy出力のAliased、正式ドメインinspect、deployment API meta.githubCommitShaを照合済み。
- Vercel build: 共通UI契約・API bundle整合・型検査・46ページ生成成功。
- 本番375/390で武将切替の表示/accessible name/同名ダイアログ遷移PASS。遅延プロモーションと画像準備待ちに合わせて検証スクリプトを修正して確認。対象素材6点HEADは200 image/png。
- 戦闘保存待ちと柴田勝家4:3の限定検証はローカル実コンポーネントで実施（REVIEW.md/result.json/画像）。本番でユーザーの戦闘や報酬を操作して再現したものではない。
- API変更なし・再配信なし。認証/課金設定、GAME03、共通Preview、main変更なし。
- 後続保存は検証スクリプトと本番証拠のみで、実行コードは上記配信SHAと同じ。

状態: 本番配信済み・ユーザー実機確認待ち。必要なユーザー作業は通常の再読み込み後、ステージクリアの保存待ち/柴田勝家1体/武将切替を実機で確認すること。
