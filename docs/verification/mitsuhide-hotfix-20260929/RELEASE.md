# GAME04 明智光秀エネミー画像・進行不能修正

2026-09-29、本番反映とお知らせ公開を完了。

- Repository: kiyoshikitamura/game04
- 保存・配信ブランチ: work/game04-mitsuhide-release-20260929
- 配信SHA: 52e5e277649fca197b74469bfe9e628cf27883e4
- 基準本番SHA: 8af27588dc665b5a0d142da95571490405915de8（3-1・3-5のDEF調整を保持）
- 引継ぎ元の修正: b03364903d1002fa5f6abf2feef2beff3523ef37
- Vercel: game04-production-receiver / Ready / Production
- Deployment: dpl_3joAVkFy55HBv5juwf631LSQqz2N
- 本番: https://sengoku-hime-ennbu.com/
- Supabase: game04-prod / game04-redesign-api v13 ACTIVE / verify_jwt=true

## 確認

- 明智光秀のbattle参照と元PNG・軽量WebPを追加。
- 添付画像と保存画像は1448×1086、透明度一致、白・黒背景へ合成した表示画素も一致。ファイルハッシュ差は非表示の透明画素に由来。
- 本番APIの変更前バンドルは基準本番SHAと完全一致。再生成後の差分は明智光秀のbattle参照1件だけ。配信後の取得バンドルも保存内容と一致。
- 型検査、共通UI検査、APIバンドル整合、画像プリロード既存テスト通過。
- ローカルの既存QAページで6-5・8-4・10-4を375px／390pxで検証。画像表示、「挑戦」の有効化、出撃準備への遷移が成功。実ユーザーの戦闘・報酬は操作していない。
- Vercel本番ビルド成功、正式ドメインが新Deploymentへ切替済み。
- 本番トップ、元画像、軽量画像はHTTP 200。配信PNGのSHA256は99708d79e3f7feae10f5591f0bbbf72400d5cffa034f7c262ba32eadb43e4ceeで保存素材と一致。

## お知らせ

- タイトル: 【不具合修正のお知らせ】
- ID: 20260929150500
- release_key: game04-mitsuhide-hotfix-20260929
- 公開日時: 2026-09-29 15:04:39 JST
- 対象3ステージの進行不能修正と再読み込みの案内を掲載。
- 本番配信を確認した後に公開。is_published=true。

本番配信・掲載済み。ユーザー実機での受入確認は未実施。
