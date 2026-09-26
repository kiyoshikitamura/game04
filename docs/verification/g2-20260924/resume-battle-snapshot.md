# G2 再開: 共通HPの開始時点保存

## 変更と根拠

親の限定変更調整を受け、Battle UI handoffの「再生時点と状態の同期」「終了状態を最初から表示しない」に対応。

- 新規raid戦闘のサーバー開始処理で、取得したstartRoomのroomId/level/hp/maxHpをinput.raidStartSnapshotへ保存する。既存のroom versionを使う開始commitと同じ入力に含む。
- 決済時は再取得した保存済みrecord.inputだけからresult.battle.raidStartSnapshotへ転記する。競合requestの破棄された候補から表示値を作らない。settled再送は既存保存resultをそのまま返す。
- 再生Headerはmetadataがあれば「開始時の共通HP（Lv.X）」として固定表示。結果で段階が進んでも次段階のHPへ置き換えない。他者の後続参加による更新でも開始時点は変えない。
- 個人戦の与ダメージから共有HPを毎frame推測しない。勝利倍率やoverkill算入の判断待ち仕様を変更しない。
- 過去段階へ挑戦する場合にも、保存値は開始時の共有roomの段階である。個人戦の敵段階と同一と捏造せず、共有HP側に段階を明示する。
- 既存記録は開始値を逆算・補完しない。従来の明示的な「現在の共通HP（Lv.X）」fallbackを保持。通常出陣のmetadataなし/currentなしは共有HPを出さない。親AppのbattleKindによる通常出陣分離を保持する。

## 変更ファイル

- src/domain/redesign/types.ts: 任意metadata型
- src/domain/redesign/battle.ts: BattleResult任意metadata型のみ、engineロジック変更なし
- supabase/functions/game04-redesign-api/source.ts: 新規input metadata/保存済みinputからresult転記のみ
- src/domain/presentation/raidBattleHpPresentation.ts: 開始時/currentの表示優先
- src/app/components/redesign/BattleView.tsx: 表示helper接続
- scripts/verify_game04_g2_raid_start_snapshot.cjs: 対象回帰

## 検証

- 全体 npm run typecheck PASS。
- 新規対象回帰 PASS: 保存往復/次段階移行/current更新後も開始値固定、旧記録current fallback、quest非表示、元snapshot非破壊。
- metadataあり/なしで同seed6Waveのsimulation結果をdeepEqual。frame/HP/SP/damage/outcomeが完全一致。metadataをengineが捏造しないことも確認。
- 既存 verify_game04_g2_battle_raid.cjs PASS: 6Wave、敵開始SP/上限分離、SKD068、同戦闘決済/受取再送、画像cache/retry。影響対象限定、65面全量の無目的反復なし。

## 未完と親引継ぎ

API bundle作成・dev配信・本体独立確認は親管理。既存v22計測receipt追加を保持。DB schema変更なし。新規本人QA侵攻を開始し、開始前roomと保存input/result、再生Header、結果後roomの対応を確認する必要がある。局所テストを実本体受入に読み替えない。旧保存記録のlive fallbackの確認も対象。数値/報酬/overkill算入/旧snapshot変更はしていない。
