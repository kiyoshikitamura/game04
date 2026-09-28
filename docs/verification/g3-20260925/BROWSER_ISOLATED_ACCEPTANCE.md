# G3 実ブラウザー受入記録

## 対象と方法

2026-09-25 JST。実アプリ、匿名Auth、隔離DB `znakrkaazliexzwihxge`。
初回機能確認Preview: https://game04-6e1a3d50y-kiyoshi-kitamura.vercel.app/ （実装a14f20f、API v1→v2）。
ユーザーA `39cd3554-dfc7-4781-a71f-da343dbe23c0` / G3QA-A。
`/qa/home-live-viewport?width=360` は本体 `/` の実寸iframe。データ差替えやブラウザー状態注入は行わない。

## 保存・演出・復帰

1. TAP TO START→はじめから→プロフィール作成→本陣→召喚。
2. 正式無料10連を実行。銭12,600、輝石200は不変。
3. 認証API成功後に開門Dialog。SKIPで10件表示。
4. 結果確認ボタンを押す前にページをreload。
5. TAP TO START→続きから→本陣→召喚。同一pendingから開門→SKIP、同じ10件を復元。
6. 本日無料利用済み、残高不変。結果確認で復帰。

結果: 気合(N)、木綿陣羽織(N)、鉄輪の指環(N)、茶屋の娘(N)、小松姫(R)、鉄鋲脚絆(SR)、光差し(N)、浅井長政(R)、影断(R)、武田勝頼(R)。
初回キャラ/スキルと装備個体の表示を確認。ランダム結果をQA固定値へ置換していない。
この操作はゲストセッションでのreload/続きから復帰であり、連携アカウントのログアウト→資格情報入力による再ログインとは区別する。

## 360px実寸UI

- 通常価格1,000/10,000銭、無料利用済み、SSR/SR/R/N=1/10/40/49%。
- 特選3カテゴリの価格、確率、券0、交換200/100/100Ptを照合。
- 輝石200時: キャラ/スキル単発不足disabled、装備単発200のみ有効。券0の券操作disabled。別支払へ切替なし。
- 交換一覧はキャラSSR10件。対象選択後、0Ptでは200Pt交換disabled。
- 提供割合一覧は実マスター45キャラ。SSR0.3000%、SR2.1333%、R3.2500%表示。丸め値は表示のみ。
- 登用DOM clientWidth/scrollWidth=360/360、横溢れなし。
- 主要ボタンfont16px、タブ/提供割合/交換44px高、抽選CTA48.78px高。
- 提供割合Dialog幅336px、x12〜348、height660.9px。背景本体にinert属性あり。
- 初期focusは閉じる×。Shift+Tabで末尾閉じる、Tabで先頭×へ循環。背後操作へ移らない。
- 開門のSKIPは72×44px、初期focusは開門CTA。

証拠: `g3-mobile-normal-360.jpg`、`g3-mobile-special-360.jpg`、`g3-mobile-rates-360.jpg`。

## 発見と修正

- 初回Auth無効: 本人設定後解消。
- 隔離DBにrooms/context/guild_members読取依存が不足: 資材14〜17で限定補完。本体get_state成功。
- 無料確認文「消費なしを消費します。」を「無料で10連登用します。」へ修正。支払自動切替の冗長説明も削除。
- 初回ブラウザー遷移はfeedback3.3ms、API1544.1ms、結果反映1549.2ms。性能合格ではない。最終候補のEU地域指定とAPI読取重複削減後に別記する。
- iframe locatorでクリック発火しなかった1試行はCTA計測60秒timeout。fresh screenshotに基づく実クリックで正常遷移。アプリ処理時間として扱わない。

## 範囲

隔離初期化はQAプロフィール/分類のみでG4チュートリアルと正式初期配布は未実装。活動/旧交流など今回移行していない機能は利用不可。これらをGAME04全体受入としない。

## 390px復帰・操作計測（初回Preview / API v2）

同じAセッションでTAP→続きから→本陣→召喚。無料利用済みと残高保持。
実寸計測: 入力→click 0.7ms、busy反映2.7ms、API1453.2ms、結果React反映1455.2ms、CTA操作可能1487.9ms。
1秒目標は未達、1.5秒内の単一観測。これだけでcold/交換等を性能合格にはしない。

## 最終クライアント候補で発見した通信設定

7f8956e / `game04-942ioj0ag-kiyoshi-kitamura.vercel.app` の実ブラウザーでget_stateが287.3msで通信エラー。地域指定SDKが付けるx-regionに対してAPI CORS許可が不足していた。NodeからのAPI試験はブラウザーCORSを適用しないため検出できなかった。API許可ヘッダーへx-regionを追加し、実ブラウザーを再確認する。

API v3反映後、同じページの再読み込み操作で本陣へ接続成功。最終候補Cで新規無料10連が成功し、文言「無料で10連登用します。」を確認。
最終クライアント7f8956e、API c47c1f4/v3。API変更はCORSヘッダーのみでクライアント資産は一致。
390pxで開門Dialogの背後13要素にinert、開門→Shift+TabでSKIP、Tabで開門へ循環。SKIP44px高。
最終無料抽選: busy反映4.1ms、API1179.5ms、結果反映1194.2ms。画面遷移: busy3.6ms、API1195.1ms、結果反映1198.2ms。
これらはwarm単一観測でありcold性能合格へ読み替えない。開門演出は保存後に開始し約4秒を別途扱う。
C結果: 軽装袴N、島左近R、大口径短筒R、上杉景勝R、作業袴R、鉤爪R、井伊直政R、二枚胴具足R、僧兵N（重複固有魂20）、形見の守袋R。

Cでも結果確認前にreload→TAP→続きから→本陣→召喚→開門を実施。復元結果Dialogの全文を比較して `sameResults: true`。初回はSKIP、復帰時は開門の通常終了で同じ結果。銭12,600/輝石200を維持し、確認後に正常復帰。
証拠: `g3-final-gate-390.jpg`、`g3-final-result-390.jpg`、`g3-final-before-reload.txt`。
