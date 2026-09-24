# G2 U10 / Q01 認証プロフィール・起動同期是正

## 修正済み（統合実接続受入は別）

| ID | Q/U | 症状・原因 | 修正 | 検証・残件 |
|---|---|---|---|---|
| F01 | U10/Q01 | 本体の自己紹介・プロフィール保存が users UPDATE permission denied。旧 update_current_player_profile は players.display_name 用で、users と別契約 | game04_update_own_profile RPC候補へ接続。自己UID限定、名前1〜8文字/bio200字、既存JST日次制限・保守・称号所持trigger維持。名前/bio/称号を1transactionで保存 | Eが修正前再現。候補SQLを親へ提出。DB適用後の保存→再読込、2回目変更拒否・非所有称号拒否の独立検証が必要 |
| F02 | Q01/U10 | プロフィール保存後に無関係な全体bootstrap終了まで保存Dialogが待つ | RPC保存確定応答で状態投影と完了表示。同期refで二重操作を防止。古いbootstrapプロフィール応答にはrevision guard | tsc PASS。保存応答〜Dialog時間の統合測定は未実施 |
| F03 | Q01/U10 | 名前登録前の認証UIDだけで cosmetics/chat読み込みが開始し、public.users未作成のFK・profile not found警告 | onboardingState.has_profile と同一UID確認後にprofile cosmetics/title、chat hookを有効化 | G4の初期付与・tutorial仕様は変更なし。新規/再ログインで統合確認が必要 |
| F04 | Q01 | bootstrapが呼出回数だけ全件直列待機。try以前の失敗でも手動releaseへ到達しない構造 | Promise chainを直接所有。待機中は同UIDの要求を1本に集約し、実行開始後に追加要求があれば次回のfresh readを維持 | 型検証PASS。呼出回数・起動時間の統合測定は未実施 |
| F05 | Q01 | mission同期・在席同期・財布→月額→profileの直列待機が無関係なプロフィール投影へ波及 | mission同期は依存するbadge読取のみ待機。在席同期は背景化。profile読取は財布/月額と並列開始（Supabase thenableをthenで実行開始） | 残高の確定順序、任務同期→任務読取順序は維持。前後同条件の統合計測が必要 |

## 対象ファイル

- src/app/context/GameContext.tsx
- src/app/context/hooks/useUserProfile.ts
- docs/verification/g2-20260924/profile-rpc-candidate.sql （親適用候補。子によるDB反映なし）

## DB調査根拠

2026-09-24 UTC 開発 project ref lrgyllgzcdcphlbmkknc の read-only SQLで確認。

- update_current_player_profile(text) は public.players.display_name への更新。usersのbio保存には使用不可。
- guard_daily_profile_changes はusername 8文字/bio200文字、JST日付で各1日1回。候補では維持。
- guard_equipped_title_ownership はtitle列のUPDATE時に既存値でも所持チェック。そのためp_title_idを明示変更した場合だけtitle列を更新する。
- authenticated は private schema USAGEあり。anonはなし。
- private definerに空search_path、auth.uid限定、PUBLIC/anon EXECUTE剥奪。public側はinvoker wrapper。テーブルUPDATE権限は増やさない。任意UID・残高・EXP・既存資産への引数なし。

## 検証

- `tsc --noEmit --pretty false`：2回目 PASS。1回目は他担当RedesignAppの既存nullエラーのみ、2回目は解消済み。
- 稼働DBへの関数作成・プロフィール変更は未実施。親適用→独立Eによる本体保存・再読込受入を必要とする。
- 12秒という修正前観測は独立Eの観測。ここでは同条件再測定しておらず高速化合格を断定しない。
- Settingsの旧home cosmetics直接保存は !redesign の旧導線限定。現行本陣G1保存APIは変更していない。
- useAuth/useChatファイルそのものの変更なし。chatの有効化をGameContextで正しいprofile lifecycleへ合わせた。

## 境界・残件

- P03外部認証の設定/実ログイン受入はこの修正で代替しない。
- 基準値が未定義の性能閾値を新設していない。E/親のローディング測定・共通規約照合で判断する。
- 旧bootstrap全体の削除は行っていない。旧チュートリアル/運営供給の依存があるため、G4を巻き込む無断置換を避けた。
- 統合SHA/Preview/API/DB版は親が最終候補に対応づける。ここでG2合格とは判定しない。
