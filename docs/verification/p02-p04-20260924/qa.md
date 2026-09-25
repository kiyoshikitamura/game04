# P02–P04 独立検証記録

検証日: 2026-09-24 UTC。担当: independent_qa。実装担当とは別に読み取りとテストを実施。GAME03変更・実課金・本番ログインは実施していない。

## 基準と採用元照合

- GAME04基準: `7476566f945708a8e752f71d4d6b90c23f3b937a`。
- GAME03採用元: `0453fcda56c2f3546b91eb7a073c592988f9cf42`。
- Vercel get_deployment(idOrUrl=www.tribe-neon.com) は Production / READY / `dpl_3QJzS467zac8nApptvAGANDYr6M1` を返した。
- 不変配信: https://tribe-neon-fzz8ncll6-kiyoshi-kitamura.vercel.app
- metadata.githubCommitShaが採用元と一致し、aliasにwww.tribe-neon.comを含む。配信metadata照合であり、決済/実認証再受入ではない。
- 採用元コードはGoogle OAuthとメールアドレス・パスワード。匿名連携はupdateUser/linkIdentity。旧チュートリアル強制・認証報酬は移植対象外。
- G2実DBの主体は `users.id` と `game04_player_state.user_id`。game04_playersという表を仮定しない。

## 独立確認結果

|検証|結果|実施範囲・限界|
|---|---|---|
|採用元配信SHA|PASS|Vercel metadataとRepository SHA一致|
|independent-billing.mjs|8群 PASS|純粋関数fixture。Stripe/DBネットワークなし|
|independent-webhook.mjs|4群 PASS|純粋関数fixture。通知再送/障害復旧|
|P02候補SQL|静的確認|service_role限定・sandbox限定、注文+U09 VIP同transaction|
|P03 binding SQL|指摘修正確認|全identity件数検査と競合後method再読取|
|P04共通表示|静的確認|mobile16px、44pxリンク、スクロール所有、戻る・閉じる|
|最終候補build/Preview|親側記録参照|全コードの型/ビルドを本担当は実行していない|
|G2ゲームstate投影|未受入|U08/U09統合と実DB適用後に確認|
|Stripe test実操作|未実施|test設定とDB接続後に要受入|
|Google実認証|未実施|専用確認アカウント/許可URL設定後に要受入|
|メール実認証|未実施|専用許可確認先/設定後に要受入|
|実機表示・遷移|未受入|スクロール、戻る、購入/設定からの導線をPreviewで確認|
|Production/M|未実施|本起票では本番変更なし|

## テスト操作と結果

実行環境Node 24.19.0。下記2コマンドが終了コード0。

```sh
node tests/p02-p04/independent-billing.mjs
node tests/p02-p04/independent-webhook.mjs
```

billing 8群: paidのみ成功確定、金額/通貨/注文/主体/商品/mode改竄拒否、署名本文/時刻/複数署名、test環境境界、未入金complete、遅延未入金通知、付与失敗後の同一注文再試行、expiryと成功付与の競合。

webhook 4群: mode/他application拒否と同一通知再送、付与エラー→FAILED記録→再送成功、付与後COMPLETED記録エラー→再送時重複なし、他app由来未知注文を無視しDB一時障害は再試行可能なエラー維持。

fixturesの付与先はインメモリ模倣。DB原子性、上限並列購入、Stripe通知到達、Google/メールの成功を証明するものではない。

## レビュー指摘

- P03のidentity件数が許可providerだけを数えていた点を指摘。全identity件数+許可provider検査へ変更済みをGitHub上SQLで確認。
- P03 finalize insert競合後に保存auth_methodを再読取し一致検査する修正をGitHub上SQLで確認。
- P03 UIで既存アカウントへの明示的切替と認証成功後finalize障害の再試行導線不足、およびminHeightのみのスクロール所有を指摘。担当修正後の確認結果は本記録の追記を参照。
- P03専用callbackは旧報酬RPCを呼ばず、元UIDのintent検査、方法一致検査、callback credentialsのhistory除去を実装。DB側に新プレイヤー作成・資産マージはない。
- P02候補は既存billing_grant_orderとgame04_grant_vipを同transactionに包む。U08のgame04_player_stateへの投影が最終的に成立することはG2統合時に別途確認。
- P02イベントCOMPLETEDは受信処理完了であり、注文のGRANTEDとは別。入金未確定は付与しない。
- カードのみ。async_payment_failedでは最新Stripe状態を照合しPENDING保持、期限切れ確定のみ予約解放する方針。取消・離脱時に予約が解放されるまで再購入できないことを実Stripe受入で確認。
- 返金による自動資産回収は本fixtureの範囲外。運用正式判断待ち。

## 残る受入マトリクス

|領域|操作・異常系|期待|
|---|---|---|
|P02|未認証/匿名/他playerでCheckout|注文作成前拒否|
|P02|商品ID・金額・数量改竄|サーバーのGAME04正本のみ採用|
|P02|成功/取消/失敗/離脱/通知遅延|注文→通知→付与を追跡可能、未確定付与なし|
|P02|再送・ブラウザ復帰同時・順序逆転|注文別一度、GRANTED後退なし|
|P02|上限直前の並列購入|原子的予約により上限超過拒否|
|P02|付与失敗・通知記録失敗後再送|同一注文から復旧、重複なし|
|P02|帰還URL直接入力・他人order ID|帰還だけで付与せず他人注文を開示しない|
|P02|VIP/通常商品|U08/U09資産・権利に一度だけ反映|
|P03|ゲスト→Google/メール連携|同一player、進行・残高・編成・権利保持|
|P03|既存認証情報/同一メール/別player|自動資産マージなし|
|P03|取消/期限切れ/不正callback|成功扱いせず元進行保持|
|P03|再ログイン/ログアウト/別端末|検証済み主体に対応する同一playerへ復帰|
|P04|本文/窓口/購入・設定導線|正式運営実態との一致、モバイル可読/戻る/リンク|

## 保存・環境制約

ローカル12群成功後、実行環境がenvironment_offlineとなった。GitHub contents APIへ実行済みtest本文を回収保存し、レビューはremote readへ切り替えた。復旧待ちによる作業中断を避けたが、最終候補をローカルで再実行したとは扱わない。

G2未統合を統合合格にしない。ページ200だけで認証成功としない。正式ドメイン・本番接続/掲載はP06/Mへ残す。
