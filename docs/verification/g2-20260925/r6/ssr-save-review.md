# R6 SSR背景 保存経路・独立レビュー準備

2026-09-25。SSR6細則は最新ユーザー承認済み。R5の SBG-01 判断待ちを解除。本陣選択、経路不問初回永続、既所持対象、重複付与なし、自動選択変更なし、保存復帰を実装対象とする。

## 稼働DBの読み取り確認

開発project `lrgyllgzcdcphlbmkknc` の `pg_get_functiondef` をSELECT確認（DB変更なし）。

- `game04_commit_state` は `state=p_state-'vipExpiresAt'-'cash'-'diamonds'-'energy'-'version'` を保存。新JSONBキー `unlockedHomeBackgroundIds` は除外されない。
- `game04_get_state` は保存済み `s.state` に動的値を合成して返す。解放ID・選択IDは保持される。
- `game04_commit_growth_state` は同じ p_state を commit_state へ渡す。新列・RPC署名変更は不要の見込み。実API保存試験は実装・配信後に別記録する。

## 入手経路

|経路|現行入口|必要な接続|
|---|---|---|
|既所持・再ログイン|API stateFor|保存済み解放と所持SSRを合流、初回だけ保存。毎readのversion増を防ぐ|
|ガチャ・直接キャラ報酬|applyAcquisitionEvents|正規の入手event適用後に同一stateへ解放追加。重複eventは追加なし|
|魂解放|growth character_unlock|解放後のstateへ同じ対応表で追加|
|旧所持取込み|importLegacyAssets / buildInitialState|既所持扱いの解放を反映。旧所持数量/EXPの独自変換なし|
|選択保存|applyHomeSelection → API commit|サーバー所持・解放判定。未所持SSR背景と任意IDの指定を拒否|
|G3|正式抽選receipt → 共通入手関数|G2では共通hook契約を受入。実ガチャ経路の受入はG3へ引継ぐ|

## 実装後の独立確認

- 全10対応・非SSR・未知ID・既存背景の互換。
- 初回/既所持/重複event/別event重複入手/魂解放、現在選択の保持。
- 選択→CAS保存→再読込、未解放指定拒否と状態不変。
- 任意payloadから解放IDの直接付与不可、未承認の新初期配布なし。
- 純ドメイン試験と認証API・DB試験を分離。G3の実抽選を実施済みにしない。

現時点は経路・保存契約のレビューのみ。SSR機能の実接続合格は実装後に判定する。

## ローカル実装後の独立確認

`node scripts/verify_game04_g2_r6_home_unlocks.cjs` PASS。10 SSR対応、魂所持のみは未解放、初所持/既所持同期、入力不変、二度目同期は同一参照、重複所持・永続性、現在選択保持、JSON往復、旧背景ID・エリア条件を確認。

API source の stateFor と共通commitは同期関数を通す。shop専用RPCも同期済みstateを保存する。applyHomeSelectionはpayload解放IDを採用せず、登録背景と保存済み解放集合で判定する。

応答性能修正は正常commitのDB返値だけをresponseForへ渡す。read/replay/conflictはstateFor再取得を維持。クライアントdraftをDB確定値として返す変更ではない。入手event・魂解放の実経路と再読込は配信後に確認する。

クライアント計測変更も独立レビューし `verify_g2_qa_timing.cjs` PASS。party memoの依存は同state、action-feedback/resultはbusy/state DOM commitでpaintとは区別、owner照合と既存requestロック保持。CTAのpointerdown起点を保持したままclick待ちを別列へ記録。これらのコード確認自体は性能基準達成の証明ではない。

## v25変更前のAPI往復測定

同一専用QA-A、同一実行環境urllib HTTPS、直列、人工回線制限なし。set_homeで既選択castle-approachを20回保存、続いてget_state20回。fresh request ID、資源消費なし。全40回HTTP200。get_stateは全回version22で不要保存なし。

|操作|回数|中央値ms|p95 nearest-rank ms|最大ms|1秒以内|
|---|---:|---:|---:|---:|---:|
|set_home|20|8,623.35|10,300.2|12,169.6|0/20|
|get_state|20|9,050.45|11,075.4|27,943.9|0/20|

生測定は `api-before.json`。これはサーバー経路を含むHTTP往復であり、UI操作可能・画像・iPhone Safariの受入ではない。約8〜9秒の経路時間と27.94秒の外れ値を削除しない。新API配信後に同一QA・同じ手順で比較する。

## v26 認証API・DB受入

実装 `af640e291d3e79e511833dcef1e16f0ff7528b94`、開発API v26。新規専用QA-B `0fe9ead0-f738-4771-977a-9de7d93454af` は親が既所持謙信1体・伊達魂80だけを限定追加。元の5体・既存魂・装備・進行を保持。解放ledgerはfixtureで注入していない。

- 初回get_stateで謙信背景のみ解放しv3→4、選択未設定を維持。二度目readはv4・同state。伊達魂80だけでは背景未解放。
- 伊達背景指定＋payloadに偽の解放ID配列を添えたset_homeは400。サーバー状態で未所持判定。
- 謙信背景選択v5→伊達の正規character_unlockで魂80→0・所持1体・解放2点・v6。選択は謙信のまま。
- 同request ID再送はv6・所持/魂/解放/選択不変。自然行動力回復51→52のみ発生し、再送の付与差分とは区別。別ID再解放は400。
- 伊達背景選択v7→get_stateで選択/解放維持。
- DB SELECTでv7・解放2点・選択伊達・伊達魂0・所持1・解放request receipt1件を照合。

根拠：`ssr-api.json`（秘密なしの要求ID/HTTP/状態投影）、`ssr-db.json`。DB migration不要・ゲームAPIの通常操作で成立。G3の実抽選取得・ユーザーの実機操作はここで合格扱いにしない。

Auth refresh_token によるセッション更新後のget_stateもHTTP200・v7・同選択/解放2点を確認（要求 `1a4cd56b-88c7-4676-9cca-36b705ebba13`）。これは新アクセストークンでの保存復帰確認であり、ブラウザのログアウト→ログイン操作ではない。後者を実施済みと報告しない。

API性能の前後80件・中央値/p95/最大・条件限界は `api-comparison.md` / `.json` へ分離した。
