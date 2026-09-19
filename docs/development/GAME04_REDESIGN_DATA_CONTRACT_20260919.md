# GAME04 再設計 Data / DB 契約（2026-09-19）

## 正本・差分監査

企画正本および全面改修計画を読了。旧版本文に残るSPD・リーダースキル・7装備枠の初期案は、同正本の後段FIX一覧と2026-09-19引継ぎによって置換済みとして扱う。

|対象|分類|実装方針|
|---|---|---|
|users / Auth / 通貨 / 既存資産|KEEP|旧行を削除せず再利用。cash / diamonds / vitalityはusersを権威とする|
|旧Character / Skill / Equipment master|KEEP|旧機能互換用にそのまま保存|
|6属性 / 個別HP / 共通SP / Passive / 6装備枠|NEW|src/domain/redesign/types.tsとmasters.ts|
|スキル個別UUID装備|MODIFY|新stateでアカウント共有IDへ集約。同キャラ重複は禁止、キャラ間共有可|
|旧所持資産移行|NEW|legacyImportedIdsに旧UUIDを記録し重複取込防止。元行は変更しない|
|新所持資産 / 成長 / 魂 / デッキ / 進捗|NEW|game04_player_state JSONB、versionによるCAS|
|派遣・PvP・RATE・GvG|REMOVE/HIDE|新ループから非公開。旧DB削除なし|
|Quest / Raid戦闘|NEW|Edgeサーバーが純粋Battle計算。開始snapshotと結果をgame04_battlesに保存|
|Raid共通HP / 報酬記録|NEW|game04_raid_rooms、version CASとplayer更新を単一RPCで確定|
|VIP|NEW|game04_vip_entitlements / grants、30日単発付与。販売無効のまま|

READ ONLY監査先はGAME04 dev `lrgyllgzcdcphlbmkknc`。user_characters(level/awakening)、user_skills(UUID/plus_val/equipped_character_id)、user_equipments(UUID/level/plus_val)、users(cash/diamonds/vitality/回復時刻)を確認した。GAME03へ接続・書込みは行わない。

## 共通契約

- Master配列: CHARACTER_MASTERS(既存60画像)、SKILL_MASTERS(汎用50)、EQUIPMENT_MASTERS(汎用160)。初期専用品をPoolへ含めない。
- sourceRarityは戦国素材の指定を使用。属性・Role・新数値は開発用仮Masterで、経済・性能の正式FIXではない。
- effects.power / passive.percentは百分率（180=180%、2=2%）。HP条件/フェーズ閾値は0〜1比率。
- getCharacterStats / getEquipmentStats / getSkillSlots / buildBattlePartyがUIとserver計算の共通入口。
- 魂はstate.souls[id]辞書。未所持キャラの魂も保存できる。
- grantRewardは確率抽選済み報酬を適用する。抽選はサーバー担当。
- homeCharacterId / homeBackgroundIdは素材キーのみ保存、素材pathはMaster側で差替え可能。

## DBと更新

追加Migration: `20260919123634_game04_redesign_runtime.sql`。8テーブル、3 RPC。全テーブルRLS有効・anon/authenticatedの書込み権限なし。RPCはSECURITY INVOKER、service_roleだけ実行許可。

1. Edgeで認証しゲームUserを特定。
2. `game04_get_state(userId, initial)`で初回作成・users通貨・VIP権威を取得。
3. 旧UUID差分importはpure関数で計算しversion CASで保存。
4. Battle開始時にサーバーsnapshotとseedを保存し、行動力を消費。
5. 結果はサーバーBattleから計算し、報酬・Raid共有HP・stateを同一`game04_commit_state`で保存。
6. request UUIDの再送は同じ返却値。別IDで同battle再確定は拒否。
7. State/Raid version競合では全体ロールバック。Edgeは再取得して再計算する。

VIP値はstate payloadを信頼せずget_state時にentitlementsで上書き。VIP orderは一度だけ記帳。価格・本番商材投入なし。

## 仮数値と後工程

Battle係数、Character/Skill/Equipmentパラメータ、属性割当、育成費用、移行重複の魂/LB変換量、初期開発用素材はPREVIEW_PROVISIONAL。正式Economy・Gacha・Shop再設計時に確定する。旧専用品は旧データに保持し、初期新ループには公開しない。

MigrationはGAME04 devへ適用済み。Preview反映は統合担当が実施。旧191件の進捗率は使用しない。

## DB実適用・最小検証

- 実適用version: 20260919123634 / name: game04_redesign_runtime。CLIが生成したローカルファイルを、リモート適用時に記録されたversionへ揃えた。
- 2026-09-19: users 6 / user_characters 50 / user_skills 27 / user_equipments 40 を維持。
- users全行hash前後一致: 888c7a8273d55de5485b445e099b8ab5。
- rollback transaction内でcash権威・行動力消費・request冪等・state CAS・Battle二重確定拒否・救援outbox・VIP30日/注文冪等・VIP payload無効を確認。
- rollback後のテストstate/battle/raid/VIP行数は全て0。
- game04_redesign_masterのrelease_manifestへ60キャラ・50スキル・160装備・10エリア70ステージ・2種Raidを保存。
- Security advisorsは新8テーブルについて「RLSポリシーなし」の情報通知。ブラウザには権限を与えずservice_roleだけ使用する設計なので意図した拒否状態。PUBLIC実行権限なし確認済み。
