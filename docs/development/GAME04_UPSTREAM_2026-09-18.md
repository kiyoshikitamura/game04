# GAME04 Production同期（2026-09-18 JST）

GAME03実Production `bc2f256eddfaa0b53ba136dd7e84f1da21286ed2`（`dpl_FbJikjPe1jb5ZJrfNZ2fnktu4NBi`）を基準に、旧基準`e2998ff0`との差分をGAME04に統合。

- GAME04最新素材ブランチをベースに、キャラ60体、ロゴ、ホーム19アイコン、背景2種、Item18点、Skill45点を維持。
- クエスト21段階、最新固定ボス、初回／探索報酬、案内、戦闘・レイド処理、BP回復、交流未読表示を同期。
- ホームの戦国表示と新CTAメッセージを統合。新会話の話者にも既存キャラ名対応表を適用。地域・会話内容は上流を維持。
- GAME04専用DB `lrgyllgzcdcphlbmkknc` のみ更新。GAME03には一切書込みなし。
- Live DB最終定義から6 publicテーブル・1 private設定テーブル、21列、差分関数とトリガー・権限・制約を同期。上流migration全再生は行っていない。
- Production最終版のクエスト／報酬／行動資源／レイドprofile／ミッション定義を同期。キャラ名と既存プレイヤーを保持。
- 既存5ユーザーは監査付き移行RPCで新進行へ移行。旧探索1件の受取権利を保持し、プレゼント3件へ引き継いだ。初回クリア進行は新システムとして再開始。旧進行・探索は移行監査表へ保存。
- 新規ユーザーの新進行自動有効化を設定。GAME03ユーザーや本番告知は移入しない。
- `resolve-battle`はProduction実配備5ファイルと一致するソースをGAME04へ配備（JWT検証あり）。

## 適用記録

`supabase/baselines/game04-upstream-20260918/01-schema-functions.sql` と `02-production-masters.sql` をGAME04へ適用済み。これらは適用済みbaselineであり、過去migrationの一括適用対象にしない。
`pre-update-masters.json` / `rollback-functions.sql` は更新前定義の参照用。移行後ユーザー状態を巻き戻すものではない。

## 最小確認

- TypeScript型チェック: PASS
- Preview設定でのProductionビルド: PASS
- 専用QAユーザーの匿名新規登録・初期化、新進行自動有効化: PASS
- 専用QA編成で探索→探索報酬→Edgeサーバー戦闘→初回報酬→次段階解放: PASS（敵5体、初回クリア台帳・報酬receipt各1件）
- QAユーザー・検証データ削除済み、元の5ユーザーを保持
- Vercel配信: Ready（`dpl_4ukVVyKsW9EijoGATkEfHNKefP47` / アプリcommit `446827a`）
- 公開URLで起動・ホーム表示・表示画像24要素読み込み: PASS、アプリ由来console errorなし
- ホーム確認は `/qa/presentation?scenario=first-home-fresh` の表示fixture。実DBの進行確認は別途上記QAで実施

確認URL: https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/

既存背景選択（自動=城下町、標準=城門）と配置機能は維持。新たな素材制作や地域名・会話本文の改稿は今回の同期対象外。

ユーザー指示により網羅テストは省略。クエストQAは専用fixtureを使用し、既存ユーザーの編成・所持品は変更しない。
