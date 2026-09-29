# GAME04 Title Social Proof — Preview受入

- Branch: `work/game04-title-social-proof-20260929`
- 実装SHA: `55db6d04aec56f60e5c990aa66702af4d7c8ca33`
- Preview: https://game04-25alh71x2-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_9F7AhM5x3UymXZFe1L6MuaMwfswG` / Preview / READY
- 作業開始時Production: `7b7f0e51d0e343316c229af90469856673c83f94`。その記録追加後 `bbb64193` から分岐。
- main: `a83a94ad`。実Productionより古い別系統のため作業基準には使用していない。
- ポチゲー担当最新 `dc5dcb6e` と今回基準のpresence SQL・送信Edge Function・activity API/clientに差分なし。
- Productionへのデプロイ、DB変更、ポチゲー送信仕様の変更は実施していない。

## 取得・表示

`GET /api/title/online` → GAME04本番 `public.game04_portal_attempts` の最新 `online_count / sent_at`。
既存 `game04_prepare_portal_attempt` が、`game04_portal_private.activity` のユーザー主キーで重複排除し、操作時刻が集計時刻の過去5分以内（両端を含む）の行数を記録する。独自推計や再集計はしない。送信成否とは独立に最後に集計された実数を読む。

サーバーは5分スロット＋既存Cron再試行猶予45秒に合わせてキャッシュする。クライアントは表示中・可視タブだけ60秒間隔で取得。開始／再開遷移中は停止。DBは保存済み集計1行の読取りだけ。6分を超えた古い値、不正値、タイムアウト、HTTP失敗では非表示。APIを待たずにCTAを操作できる。

30未満はDOM要素なし。30〜99は10人単位切り下げ、100以上は実数。最初のTAP画面には出さず、選択画面CTAの12px上に絶対配置するため既存CTA座標は変わらない。既存の「続きから」「データをお持ちの方」等の認証状態別ラベル・挙動は維持。点滅は4秒周期・opacity .78〜1、Reduced Motionでは停止。

## 実機確認

通常URLは実集計値を取得する。検証値はPreview限定の `?titleOnline=29` / `30` / `39` / `40` / `99` / `100` / `127` / `error`。TAP TO STARTの後に確認する。Productionサーバーでは検証パラメータを無視する。

|値|表示|
|---|---|
|29|非表示|
|30|現在30人以上がプレイ中|
|39|現在30人以上がプレイ中|
|40|現在40人以上がプレイ中|
|99|現在90人以上がプレイ中|
|100|現在100人がプレイ中|
|127|現在127人がプレイ中|

360/375/390px × 各7値のブラウザ検証。スクリーンショットと `browser-results.json` を参照。物理スマートフォンによる手動受入はユーザー確認用URLで行う。

## 計測

既存 `game04_title_arrivals` と同じ匿名RPC／ハッシュ化ブラウザID方式の追加イベント表 `game04_title_proof_events`。旧KPI／ゲーム開始／認証RPCを変更しない。一般ロールのテーブル直接読取り・書込みは不可。許可したRPCだけ匿名実行可能。生のブラウザID、IP、メールは保存しない。到達計測のvisitor_hashと結合可能。

イベント: `TITLE_ARRIVED`, `TAP_TO_START`, `SELECTION_VIEWED`, `ONLINE_CHANGED`, `START_NEW_TAPPED`, `CONTINUE_TAPPED`。

各イベントに `active_count`, `counted_at`, `display_range`, `displayed`, `new_game_eligible`, `selection_id`, `fixture` を保存する。同じ訪問はvisit_idで関連付け、再送はevent_idで重複排除。続行によるページ遷移にはkeepaliveを使用する。送信失敗は開始をブロックしない。

`scripts/report_title_social_proof.sql` は選択画面を母数、同じselection_idのはじめからタップを分子とするCVR。初期表示レンジ別に比較し、途中で表示有無が変わった訪問を分離する。未取得／失敗は `unknown` とし `<30` に混ぜない。fixtureと新規開始不可の選択画面は除外する。厳密な比較にはunknown・途中変更ありを除外して集計する。

追加SQL `supabase/manual/game04_title_social_proof_v1.sql` は隔離Preview `znakrkaazliexzwihxge` にのみ適用済み。本番反映時にはこの追加SQLの適用とProduction Preview承認が必要。今回は適用しない。

Previewゲーム接続・イベント保存先は隔離DB、Online Countだけ既存本番集計を読取り。専用ブランチのサーバー環境変数 `GAME04_KPI_SERVICE_ROLE_KEY` を使用し、ブラウザへ秘密鍵を公開しない。本番では既存 `SUPABASE_SERVICE_ROLE_KEY` を利用可能。

## 検証と限定事項

- 境界値・invalid/null/stale値の単体検証 PASS。
- TypeScript、Next build、既存Common UI契約、既存API bundleチェック PASS。
- 変更コードlintエラー0。TitleView既存初期化effectのsetState warningは既存部分を保持。
- 隔離DBの匿名RPC保存・ロール権限確認 PASS。RLS有効／ポリシーなしのAdvisor情報は直接アクセスを禁止する意図的な構成（既存Title到達と同じ）。[Advisor説明](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)。
- 実データ照合: 2026-09-29 09:30:02 JSTの送信履歴3人と、Preview APIの3人／同一集計時刻が一致。UIは非表示。
- 配信先で27チェックPASS。各幅で人数の有無によるCTA座標の変化なし、ページJS例外0。続行遷移後のCONTINUE_TAPPED保存も確認。APIを503にした状態で新規開始し、既存導入画面の「次へ」まで到達（`failure-start-ready.png`）。
- 最終確認時もProductionは `7b7f0e51` のまま。
- Tutorial、新規ユーザー生成、認証、Battle等の処理は変更していない。隔離Previewの開始確認でテスト匿名ユーザーを作成した。

## 変更ファイル

- `src/app/components/TitleView.tsx` / `.css`: 表示とイベント呼出しのみ。
- `src/app/components/useTitleOnline.ts`: 非ブロッキング取得・更新・失効。
- `src/app/api/title/online/route.ts`: キャッシュ済み送信集計の読取り、Preview限定fixture。
- `src/utils/titleOnline.ts`: 表示・有効期限判定。
- `src/utils/titleProofEvents.ts`: 非ブロッキングイベント送信。
- `src/utils/titleArrival.ts`: 既存visitor IDヘルパーをexport（到達計測の挙動は維持）。
- `supabase/manual/game04_title_social_proof_v1.sql`: 追加イベント表／RPC。
- `scripts/report_title_social_proof.sql`: CVR集計。
- `scripts/verify_title_social_proof*.mjs`: 境界値・ブラウザ検証。
- `docs/verification/title-social-proof/`: 受入記録と証拠。
