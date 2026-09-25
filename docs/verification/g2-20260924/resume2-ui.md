# G2 継続 UI 追加是正（子D）

作業基準: G2保存済み head `79669373`。G1への巻戻しなし。2026-09-25 JST。

`AGENTS.md`、スクロールUI正本、既存 `resume-ui.md` / `resume-loading.md` / `LOADING_MEASUREMENTS.md` / 画面品質台帳を継承。React best-practices の独立取得・effect cleanup・状態表示を確認した。既存の12秒画像上限、spinner-only、既取得データを維持する方針は変更していない。

|ID|Q/U・画面/状態|原因と修正|局所検証|統合候補の必須再検証|
|---|---|---|---|---|
|R2UI01|Q01/Q04 U05 本陣・活動取得|活動取得→公開プロフィール取得を直列待機後に活動を表示していた。別effect化し、活動成功時点で一覧を投影。救援author変更が活動RPCまで再実行する依存も解消。|実effect実行の非同期検証 PASS。活動成功がprofile取得を呼び出さず確定することを確認。|実APIのprofile遅延時に活動が先行表示されること。性能全体の改善判定は別途。|
|R2UI02|Q01/Q04 U05 本陣・活動失敗/空/再試行|RPC失敗時に既存一覧を空へ差替え、throw未捕捉、初回待機が空表示、再試行なし。成功時のみ差替え、loading/error/空を分離、既存一覧を保持したまま再読み込み。chat送信エラーから活動エラーを分離し重複を抑制。|成功/旧PVP除外/失敗保持/throw/cleanup後応答抑止 PASS。`npm run typecheck` PASS。|本陣と交流Dialogで再試行CTA・一覧保持・成功後エラー解消。実回線タイミングは未測定。|
|R2UI03|Q02 U05 出陣・報酬/武将詳細Dialog|報酬の1fr auto、数値のflex最小幅により長名/大数量がDialog幅を拡張しうる。minmax(0,...)、min-width:0、完全折返し、ボス名の折返しを追加。|CSSルール点検。情報省略・overflowでの隠蔽なし。|360/375/390px、390×568で長名/大数量、本文末尾CTA到達のDOM寸法と画面確認。実機別。|

変更ファイル:

- `src/app/components/redesign/HomeView.tsx`
- `src/app/components/redesign/QuestView.css`
- `scripts/verify_g2_home_activity_async.cjs`
- 本記録

局所検証コマンド: `node scripts/verify_g2_home_activity_async.cjs`。ソース内の実際の活動effectをTypeScriptで変換して実行し、transport応答順/失敗/破棄を確認する。DOM全体・認証・DB保存・性能測定を代替しない。

引継ぎの未完: Q01の同条件実測、全体の画面/状態網羅、実機/Safari/キーボード、正式不足素材・72スキル名称画像、P02〜P04依存は維持。既存RUI01〜07/RL01〜03を今回未実装へ戻さず、最終候補の独立再検証対象とする。

API/DB/ガチャ/チュートリアル/初期資産/本番/main/外部設定は変更していない。親のみ共有統合とGit保存を実施する。

## R2UI04 独立レビュー後：活動RPCの未応答からの復帰

独立レビューでRPCが未settleの場合にspinnerが永続することを指摘され修正した。`useChat.ts` の `GUILD_CHAT_REFRESH_TIMEOUT_MS = 12_000` は、コミュニティ送信確定後の読取更新を12秒で打ち切る既存実装。活動もコミュニティのread-only取得であり、同じ12秒の読取復帰上限を適用した。画像専用上限を通信規約と誤認したものではなく、新しい数値目標を導入していない。全APIの承認済み性能目標や達成として一般化しない。

- 12秒でAbortControllerを中断、errorへ遷移し再読込可能にする。
- transportがabortを無視し未settleでもtimer自体がUIを復帰させる。既存一覧は維持。
- timeout後の遅延成功を破棄し、再試行の結果を上書きさせない。
- 正常完了/cleanupでtimer解除、cleanupでabort。書込・残高・mutation lockは無変更。
- 実effect + fake clockで未settle timeout、abort signal、遅延応答抑止、再試行成功、cleanupを追加しPASS。

実API/ブラウザ上でのtimeout表示と再試行は親の独立再検証へ残す。

## R2UI05 お知らせの未応答からの復帰

親の追加点検で `InboxPanel.tsx` も取得未settle時の無限待機が残ると判明。R2UI04で適用した既存12秒のread-only復帰境界をお知らせ読取へ適用。AbortControllerで中断し、transport未settle/abort無視でもtimerからerror/retryへ移行。既存一覧保持、正常完了のtimer解除、close/tab切替cleanupと遅延応答破棄を維持。プレゼント受取mutationには適用しない。

`node scripts/verify_g2_news_async.cjs` PASS。実ソースeffectを実行し、成功・RPCエラー・throw・未settle timeout・abort・遅延応答・再試行で空一覧成功・cleanupを確認。配信版での本体表示は親へ引継ぐ。

追加変更: `src/app/components/InboxPanel.tsx`、`scripts/verify_g2_news_async.cjs`、本記録。

## 最終候補 f45d523 後の限定追加点検（コード変更なし）

親の依頼により独立修正可能な残件を2件以内で抽出。

1. 育成/覚醒送信中のDialog操作遮断。`GrowthView.tsx`ローカルModalがsavingを共通ModalのcloseDisabledへ伝えないため、送信中も×/Escape/背面クリック・内部戻るが可能。runのactionLockは二重消費を防ぐが、正本17.3の他操作遮断と異なる。ローカルModalでpending中のclose/内容操作を遮断する限定変更が可能。実操作再現と親の所有調整後に修正する。
2. 育成結果の右上×。共通UI正本の育成結果仕様は下部「閉じる」のみ、右上×なし。現在は共通Modalの×も表示する。結果Dialog限定で上部×を除去し、下部終了を維持できる。規約上の差異でありデータ障害とは分ける。

武将個別Dialogの上下「Lv育成／覚醒」は同じ操作を2回表示している。UI最新正本のCharacter詳細では操作の種類は明示されるが、上下配置の指定なし。共通正本ではCTA重複を点検対象にしている。一方、当該武将承認モック原本は今回復元資料にないため、スクロール便宜として承認済みとは断定せず、未承認の重複と断定して撤去もしない。原本照合を親へ依頼。

上記報告時点で追加編集なし。共有台帳はE/親が管理する。

## R2UI06 / R2UI07 親指示による上記2件の限定修正

正本の育成結果仕様は **16.3**（前の連絡の16.2は誤記）。上下の育成/覚醒CTAは保持。

- R2UI06: GrowthViewの全12ローカルModalへ `pending={saving}` を接続。pending中は本文divをinertにし、共通Modalの既存closeDisabledで×/Escape/背面クリックを遮断。本文の戻る/入力等も操作不可。処理後は解除し、確認済み結果または失敗表示へ戻る。fieldset追加だと既存CSSが全子buttonに作用するためdiv inertとした。DOMを置換して一覧/スクロールを捨てる変更はしていない。
- R2UI07: 共通Modalに後方互換 `hideCloseButton=false` を追加。育成結果のみtrueとして右上×をDOM・アクセシビリティ木から除去。resultOnly時closeDisabledでEscape/背面終了も抑止し、下部「閉じる」から終了する。結果以外の×は従来どおり。
- `node scripts/verify_g2_growth_dialog_guard.cjs` PASS。実ソースを変換し、pending時inert/closeDisabled、通常復帰、全caller、結果の×DOM除去、既存共通Dialogの既定挙動、背面クリック保護を検証。
- `npm run typecheck` PASS。
- 独立Eソースreview: 全12caller、既存背景inert保持、16.3一致、後方互換、wrapperと既存直接子CSSを確認、阻害不具合なし。実ブラウザでのinert/スクロール/下部終了は別受入。

変更: `GrowthView.tsx`、`Modal.tsx`、`scripts/verify_g2_growth_dialog_guard.cjs`、本記録。親のみ統合/Git保存。
