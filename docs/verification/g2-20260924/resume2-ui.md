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
