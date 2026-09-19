# GAME04 全面改修・初回統合

基準: `7369f3dbaf3ef454c33932df55ee308e0b7718cb` / `codex/game04-upstream-20260918`。
正本: docs/product の 2026-09-19 Planning / Implementation / Battle / Home / Quest / Growth / Raid。
対象DB: `lrgyllgzcdcphlbmkknc` のみ。GAME03およびProductionは変更しない。

## 差分分類

|分類|対象|
|---|---|
|KEEP|戦国素材、認証・プロフィール、既存資産、法務ページ、決済検証基盤|
|MODIFY|Home、Quest、Battle、育成、デッキ、Raid、VIPの権利接続|
|REMOVE（公開導線）|PvP・RATE・GvG、旧時間派遣、Guild/BBS/募集。旧DB・履歴は保持|
|NEW|6属性・個別HP・合計SPの戦闘、10エリア70ステージ、専用状態API、救援outbox|

## 永続化

- Migration `20260919123634_game04_redesign_runtime.sql` 適用済。
- 新しい8テーブルと3 RPC。ブラウザーからの直接更新不可。Edgeで利用者を認証し、サービス権限で更新する。
- wallet/行動力は既存usersをAuthorityとして共有。状態versionとRaid versionを確認し、競合更新を拒否。
- 戦闘開始時に行動力を消費し、seed/編成/敵を保存。通信再送で同じ戦闘・精算を再利用する。
- 旧所持資産の初回取り込みはUUID台帳で管理し、既存データを削除しない。
- `game04-redesign-api/source.ts` が編集元。配信する `index.ts` はesbuildによる単一bundle。

## 後工程・制限

- M8チュートリアル、M9商材・ガチャ・Economy・数値FIXは未実施。
- 旧ガチャ/Shopは既存基盤の開発表示。旧レコードの同一UUIDへの重複更新は、新資産の魂/LB変換へ未接続。
- 新Mission報酬設計、旧Tutorial依存のコミュニティ利用条件、計測最終接続は次工程で統合確認する。
- 任意解禁Raidの途中参加Checkpointから現在Lvまでの追従仕様は未FIX。該当参加者の出撃を保留表示とし、独自ルールを追加しない。
- 恒常RaidランキングはRaid UI正本で対象外。新ランキング軸は未実装。
- Masterの能力・報酬・育成費・敵強度はPreview暫定値。60キャラ、50スキル、160装備、背景/Bossは既存素材を再利用。
- VIP30日権利・速度・Skip・検証済決済後の付与経路を実装。価格未FIXのため販売は無効。
- 最終実機確認は未実施。進捗は新43件へ再採番し、Preview反映率と完了率を別々に管理する。

実装別の検証記録は同ディレクトリ `GAME04_REDESIGN_*_20260919.md` を参照。

## 初回配信検証

- 実装commit: `93d25673202b1e43297bae338ddfc8033aa8d5f6`
- `npm run typecheck` / `VERCEL_ENV=preview npm run build`: PASS。
- dev実API: 初期化→Quest勝利→同一requestId再送→Unlock Raid作成→Raid勝利 PASS。
- Edge `game04-redesign-api` version 2 / verify_jwt=true。
- ローカルBattle core・Raid・育成検証、およびDB rollback内CAS/冪等/VIP検証 PASS。
- 決済reconciliation単独旧スクリプトは拡張子なしimportのNode解決エラー。実決済は行わず、型・Buildと既存検証済注文経路のコード確認まで。
