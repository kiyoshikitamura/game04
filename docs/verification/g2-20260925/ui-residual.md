# G2 継続残件 UI修正（2026-09-25）

保存済み実装49177788／記録04d2dc97を継承。子UI担当は実行可能な局所修正を実施。未承認数値・素材・G3/G4・外部Pの設定は変更しない。

|ID|対象/分類|根拠・症状|修正|検証・残件|
|---|---|---|---|---|
|R3UI01|共通CanonicalDialog送信中 Q01/U05|起票Q01の二重操作禁止。従来CTA/閉じるのみ排他で本文のinput/selectが操作でき、送信済み数量と表示がずれる|async action pending中の本文をinert、dialog aria-busyを付加。既存ref排他・エラー後解除は維持|局所async回帰PASS。実ブラウザでのinert/キーボードは親の実表示検証待ち|
|R3UI02|交換所/魂確認 Q03/Q04/U08|MASTER_AUTHORITY_LATEST §商店 魂「最低10→5、以後2個刻み」。入力minは10だが利用者に最低条件が表示されず、所持→汎用数のみで消費武将/レアリティ不明|最低10・2個単位を明記し、消費武将名/数量、受取汎用魂のレアリティ/数量を表示。不正数には受取見込みを出さない。送信中は全交換input/selectをdisabled|既存domain条件と同一判定。最低数/比率・残高・旧資産変換なし。本体確認待ち|
|R3UI03|交換所form/共通操作欄 Q02/U05|スクロール共通ルールの必要情報/CTA到達。formがinline自然幅、dialog grid操作欄1frの自動最小幅で長い入力/ラベルが広がる余地|フォームを縦配置/box-sizing border-box/幅100%/min-width0。本文と操作欄は縮小可能なminmax0、長文保持|CSS制約確認。360/375/390/低高さ/実機表示は未受入|

## 局所検証

- `node scripts/verify_g2_canonical_pending.cjs`: PASS。実コンポーネントをtranspileしてhook stateを保持し、同一tick二重送信防止、pending本文inert、閉じる/背景close抑止、非同期reject後解除を確認。実DOMやブラウザの代替合格ではない。
- `node scripts/verify_g2_growth_dialog_guard.cjs`: PASS。前回育成Dialog排他・結果閉じる仕様を保持。
- `npx tsc --noEmit`: PASS（本担当修正直後）。
- vercel:react-best-practicesを適用。新規effect・データ取得・依存追加なし。簡単なderived判定をrender中に算出し、既存排他refとstate復帰を保持。

## 停止要因の区分

- 直ちに実行可能: 上記修正、局所回帰、保存は担当完了。最終SHAは親の統合記録で対応。
- 環境復旧待ち: 実表示・実機のみ。親ブラウザ担当へ360/375/390と狭高さの魂交換、pending入力不可、失敗後再操作、長名表示を引継ぎ。
- 外部依存/ユーザー判断: 本修正に新規判断なし。魂の最低数/交換比率は既承認値を維持。正式画像/名称/日次任務/侵攻damage/P02〜P04は別担当管理。

## R3UI04: 問い合わせ/法務の復帰経路

Q03/U10。設定からcontactへ直接移動し閉じる既存経路は、sameUID+has_profileの検証を保持しておりコード上の追加欠陥を特定していない。一方、法務本文内リンク7画面で`from=settings`が落ち、遷移後に閉じるが表示されなくなる確定欠陥を発見。共通navは元から正しいため保持。

- rights/age-rating→contact、payments→tokusho、cookies→privacyの本文リンクでqueryとreplaceを継承。
- terms/privacy/tokushoのSupportContactへreturnToGameを伝え、窓口未設定のcontactリンクでも同じqueryを保持。
- 本陣メニュー直下のお問い合わせも既存設定と同じmarker記録・queryへ接続。戻り先は既存契約どおり設定。
- `GameContext`のsameUID/has_profile、5分のmarker有効期限、認証確認、法務本文・運用設定は変更なし。
- `node scripts/verify_g2_legal_return_links.cjs`: PASS（実ページをtranspileしsettings/直接アクセスの7×2ケースとSupportContactのqueryを確認）。`npx tsc --noEmit`: PASS。
- ブラウザの実復帰と保存再読込は親確認待ち。リンク局所試験を実認証受入としない。

### Footer二度押し所見の切分け

画像読込直後の1度目無反応/2度目成功について、FooterからRedesignApp.navigateに画像readyの条件は存在しない。navigate先頭はbusy/lockのみ、画像待機は各View内の操作を制限する。コードのみでは所見と一致する確定原因がなく、推測でbusy/lockを除去しない。実表示・イベント/送信状態の証拠追加が再開条件。外部依存やUI完了扱いに移さず未確認として保持。

Coverage表は未表示状態を実装不足と同一扱いしない。今回の確定接続不備以外、保存済みの通常出陣・育成・BOX・薬の機能を未実装へ戻さず、最新候補の代表状態受入は親へ引き継ぐ。
