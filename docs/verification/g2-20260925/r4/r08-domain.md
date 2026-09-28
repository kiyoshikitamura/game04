# R08 / ドメイン接続引継ぎ（2026-09-25）

基準: PR30 / 整理済み台帳 `20c5cde5`。本書はR4の限定変更記録。G2合格判定はしない。

## R08計測接続

既存 `redesignQaTelemetry.ts` / `redesignPerformance.ts` はAPI総待機（認証・通信・応答validation込み）、home/growth/quest必須画像待ち、Navigation / FCPを記録する。FCPはタイトル表示を含み、操作可能時刻ではない。既存44行の結果は保持する。

追加: `/qa/home-live-viewport` のQA専用 `InteractionProbe`。

- 完全一致の対象CTA名（textContentまたはaria-label）を指定する。
- 「次の本体操作を計測」で準備し、本体iframeのpointerdown / Enter / Spaceを開始点として観測する。
- pointerdown / keydownで時計を開始し、clickイベント発火後から操作可能判定を行う。押下中の有効な保存CTAを保存前にreadyと誤観測しない。スクロール等でclickが発火しなかった場合は60秒でtimeout。
- 対象CTAが可視、非disabled / aria-disabled、非inert / aria-busy、viewport内の中央hit-testが当該CTAになる状態を2描画frameで確認した時刻を記録する。
- iframe navigation時はperformance originの0を開始点とする。手動TAP待ちやログボ閉じ待ちも含む。初回起動の比較はTAPを起点にしたinteractionも併記し、人間の待ち時間を性能悪化と取り違えない。
- 開始/観測時刻・timeOriginを表示するため既存API/画像表と突合可能。保存は保存後の対象CTA再操作可能を観測し、API receipt成功も別確認する。
- 遷移先でのみ存在するCTAを対象とする。遷移前にも押せる共通Footerを指定すると画面内部の準備完了は示さない。戦闘準備は準備Dialogの出陣CTAなど、確認対象固有のCTAを指定する。
- 60秒未成立はtimeout。記録は30行上限、非QA / Productionでは無効、通常本体にprobeを置かない。個人ID・入力内容・URLを送信しない。

この数値は指定CTAの操作可能条件を満たした観測であり、全画面TTIやLighthouse TTIの実装ではない。未承認の性能目標D04を合格基準にしない。

同条件比較の記録条件: 同一QAアカウント/同一状態、同viewport、同ブラウザ/回線設定、同一対象CTA、ログボ等の阻害状態、cache条件。warmは同セッション再訪。HTTP cache無効を確認できない新規sessionをcold cacheと断定しない。API/画像の区間は並行し得るため単純加算しない。変更前後の候補両方で同じ計測手順を使い、計測追加だけで性能改善としない。

検証: `verify_g2_qa_timing.cjs` PASS、`verify_g2_legal_return_links.cjs` PASS、`tsc --noEmit` PASS。実ブラウザでの追加probe受入・反復測定は親の統合候補記録へ。静的確認だけでR08完了としない。

## ドメイン: P02〜P04 / P06 引継ぎ

ユーザー確定: **sengoku-hime-ennbu.com 取得済み、DNS未設定**。購入判断待ちは解消。HTTPS、メール、Google OAuth、Stripe、Supabase redirect、Vercel domain設定が完了したとは扱わない。

|引継ぎ先|取得済み情報と次の接続条件|
|---|---|
|P02決済 → G2受入|取得済みdomainをcheckout戻り先・webhook候補のhostに使用。DNS/TLSと関連実装完了後、正確なpathを実装契約と照合して外部設定・テスト決済・本人紐付け・receipt照合を実施。現時点で到達可能URLとはしない|
|P03認証 → G2受入|domain取得済みをredirect許可先のhost資料へ反映。DNS/TLSと関連実装成立後にSupabase / Googleの正確なcallbackを確認して設定。メール送受信・アドレス運用・Google認証完了は未確認|
|P04リーガル → G2受入|法務のサービスドメイン表記は確定値へ反映。運営者・代表・住所・連絡先等はPR31の承認情報と統合する。support@等を推測しない|
|P06（別スレッド）|取得済みdomain・DNS未設定を本番受け皿担当へ。DNS/TLS/メール等の担当範囲と管理画面アクセスを別工程で確認。G2から本番設定を変更しない|

限定コード修正: `legalConfig.ts`に `serviceDomain` を追加、rights / tokushoは公開URL未確定時に取得済みdomainを文字表示する。`serviceUrl` はnullを維持し、未確認のHTTPSリンクを生成しない。`supportEmail`もnullを維持。既存法務の戻り先保持は変更しない。

親は本記録と統合受入結果のH01〜H03/H07へ接続情報を保存。PR31最新head `83673c24deebb24dd3446b64a8895f42010e8b6b`・Draft openを再確認した。P02〜P04/P06側で上表を参照して外部設定を進める。別branchのコード変更・DNS/外部設定は本G2作業で行っていない。
