# 本陣 DM 最終実配送検証

2026-09-24。ユーザーの「進めてください」により、専用QA間のテストDM送信を明示承認済み。

## 対象・配信

固定Preview: https://game04-b629u8avu-kiyoshi-kitamura.vercel.app
実装・配信SHA: `5dc1c98beeec2e1e7086d88319974f5fd6e65595`
Deployment: `dpl_5NfHiEqoGdxkfw1ujNSDPS963nRe`
Supabase: GAME04 dev `lrgyllgzcdcphlbmkknc`

- 送信QA: RQAWGst / `35b326f5-5a93-4532-9619-9c05651269e9`。前回の実API検証専用QAを再利用。
- 受信QA: 本陣DM検証 / `6e6acac8-4ba5-4d6a-a942-939b62ffbab4`。固定Preview本体の通常開始UIで作成。前回ブラウザsessionが消えていたため受信用に追加。
- 両者をpublic.usersのID・表示名で照合してから送信。実ユーザーや全体チャットへ送信していない。
- 本文: 「本陣未読確認（QA）」

## 操作と結果

| 手順 | 結果・証拠区分 |
|---|---|
| 受信前 | 本体DMバッジなし（0件） |
| RQAWGst→受信QA | 正式send_direct_messageをSQL transaction内のauthenticated role・専用QA claimで呼出。テストデータ投入であり、送信者のブラウザ/認証付きHTTP API送信の証拠とは区別 |
| 未読の実配送 | Realtimeで本体「DM (1)」、会話「RQAWGst (1)」と本文を表示。画面stateへのfixture注入なし |
| DMタブ選択のみ | 未読1件を保持。会話を開く前に既読化しない |
| 対象会話を開く | 本体/中央DialogのDM未読件数が0へ。DBの対象メッセージis_read=trueも確認 |
| 本体から返信 | Dialogのtextbox→送信を実操作。同じ本文の返信を1件作成し、双方向履歴・入力欄クリアを確認。認証付き本体の既存send_direct_message経路 |
| 再読込 | タイトル→継続→本体でDMバッジ0。交流を開くと既存の遅延取得で履歴を復元、閉じた後も本体に会話が表示される |

受信メッセージID: `6d012001-215b-4f08-b3e0-7dff5c1549a4`（is_read false→true）
本体返信ID: `93e94575-b3e9-4b58-9863-fc015417f2ec`（宛先RQAWGst、送信成功。受信側QAで未読のまま保持）

## 画像

- [未読1件](home-dm-unread-20260924.jpg)
- [会話を開いた後の解除・本体返信](home-dm-read-20260924.jpg)
- [再読込後の未読0件・履歴復元](home-dm-restored-20260924.jpg)

画像は固定Previewの/qa/home-live-viewport内で実本体/を390×844撮影。幅固定以外のデータ・表示注入なし。

コード修正・API再配信・schema変更なし。Production変更・mainマージなし。新規QAプロフィールと専用QA間のテストDM2件のみ。残る本陣DM検証をクローズ。
