# CCU集中イベント 2026-09-29

## 承認仕様
- 2026-09-29 21:00 JST <= server time < 2026-09-30 00:00 JST。
- エリア1（三河）クリア後、共闘遭遇対象ステージの遭遇率100%。クリア前は通常率を維持。主催中の共闘がある場合の新規開催抑止は維持。
- クエスト・共闘・領土侵攻の戦闘消費行動力1/2、端数切上げ。初回0・再挑戦1の優遇は保持。
- 開催中にゲームAPIを利用した全ユーザーへ姫武将ガチャ券 SPECIAL_TICKET_CHARACTER 3枚を直接付与。新規も対象、イベントにつき一度。
- CCU表示は実装済み。今回変更なし。

## 基準
- 保存基準 fd8d39957945a238e715e6383aeeb9379ad1d9c2。
- 公開ドメインHTMLで dpl_8XscEfNsx9LUwMNnbnC5Di5vRbna を確認。配信SHAは同ブランチ記録の9d3f67e7。
- 本番Edge v10 source hash 75ce9df2905da01dc638fd9e1bfc38d006bb28697795a71210ac222d51d792ed、保存sourceと一致。既存62依存ファイルのhashもmanifestと一致。
- mainは本番正本ではない。別branchに保存。

## 実装
- DBイベント設定をサーバー時計で判定。終了ジョブ・恒常マスター書換えなし。
- battle inputに開始時点の消費量・遭遇率を保存。終了をまたいでも開始済み戦闘の条件は維持。新規開始分から通常復帰。
- 付与台帳のevent_id/user_id一意制約、users行ロック、inventoryと同一transaction。再ログイン・複数タブ・券消費後でも重複不可。
- 報酬RPCはservice_role限定。通常のユーザー認証済みEdgeから呼ぶ。クライアントの時刻・UID指定で付与不可。
- APIのイベント時刻をクライアントに同期。出陣・共闘の表示と出撃確認に適用。開始/終了境界に再描画。

## 検証
- JST開始直前/開始時刻/終了直前/終了時刻、消費0/1/2/5/10/20、無効イベント、未取得状態、遭遇対象外0%の維持を確認。
- Preview DBで開始前/開催中/終了後、3枚のみ、再送、1枚消費後の再送、クライアント直接書込拒否をtransactionで検証しrollback。付与台帳0件と正式開催時刻への復帰を確認。
- API bundle整合検査PASS。変更UI・hookの構文ビルドPASS。
- 本番DB/APIは未変更。Preview実画面の通し確認・本番反映は未完了。

## 配信
- Preview DB: znakrkaazliexzwihxge。追加migration適用済み。
- 本番DB: soiksqgtmcnspfedmanr。未適用。
- Preview Edgeは最新本番を基準にしたbundleのEXPECTED_PROJECTのみPreviewへ置換して配信する。
- 本番配信前に最新Production/並走成果を再確認。migration→Edge→本番環境でフロント再ビルド。Vercel connectorのreceiver取得は404だったため同一探索を反復しない。
- 告知・広告操作はマーケ側。勝ちクリエイティブや広告予算は変更していない。

## Preview実接続結果（2026-09-29 11:18 JST）
- 実装SHA c89d0a63455083beb3429685604974474f16a726、PR #46。
- game04 / receiverのVercelビルドはいずれもsuccess。
- Preview: https://game04-git-work-game04-ccu-event-20260929-kiyoshi-kitamura.vercel.app
- Preview Edge v10、APIの型検査PASS（Deno環境型補助を指定）。
- 新規の匿名検証ユーザーを作成し、初期化→get_stateで開催前の時刻設定を確認。
- Preview開催時間だけを一時変更し、同時3リクエストでガチャ券残数3・台帳1件。
- 実戦: mikawa-3を再出撃。開催中100→97、開始再送97、勝利決済97、決済再送97。保存snapshotはbase5/cost3/chance1。共闘1件発生。
- 終了後: 97→92、再送/決済後92。snapshotはbase5/cost5/chance0.01。
- 検証終了後、DB設定を正式開催時間21:00〜24:00 JSTへ復帰。
- RLS無ポリシーのAdvisor情報は新2テーブルのクライアント直接アクセス拒否を意図したもの。service_role専用。
- 画面レイアウトの変更なし。ブラウザでの実画面通し確認は未実施。本番DB/API/フロントは未反映。
- Vercel接続でreceiver取得404のため、本番配信には承認済みブラウザ経路への切替または担当者の操作が必要。

## エリア1ガイド除外の追加変更
- 100%適用には、出撃開始時点のサーバー保存状態 `earlyProgress.completedAreas` に `mikawa` が含まれることを必須化。
- エリア1未クリア時は開催中も通常率。エリア1を初めてクリアする戦闘も開始時点の通常率を維持し、次の出撃から対象。既存ユーザーのエリア完了移行判定は保持。
- 行動力半減・姫武将券3枚の対象条件は変更なし。
- 未クリア通常率／クリア済み100%／対象外0%／開始前・終了後通常率／行動力半減維持の検証PASS。API型検査・bundle整合PASS。
- 上記の11:18実戦記録はこの除外条件を追加する前の結果。
