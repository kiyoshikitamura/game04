# 固定Preview確認

- 固定URL: https://game04-h5989fglp-kiyoshi-kitamura.vercel.app
- Deployment: dpl_bLYqjgfjDNB2WTLVhHwyFjewWwjq
- 配信SHA: 061d2638e637e54cfd6330a806db12804325f9eb
- Vercel Dashboard: https://vercel.com/kiyoshi-kitamura/game04/bLYqjgfjDNB2WTLVhHwyFjewWwjq
- Vercel実画面でReady / Preview / Source SHA一致を確認。

## 固定配信で実操作確認

`/qa/invasion-approved` にて5城一覧→岡崎城詳細→最終段階→侵攻確認→キャンセルを実行した。最終敵は徳川家康、敵Lv45、HP54,240 / ATK1,830 / DEF630。確認は開始ボスLv1・敵Lv35、3日、侵攻令1、所持3→2、開催枠0/1→1/1。画像読込には時間がかかったが、完了後に画像未読込/欠落0件をDOMで確認。

`preview-confirm.jpg` は同一固定配信、クラウドブラウザ1363×936での確認画面。390px・低画面の証跡は別記のローカル同一実装検証であり、この画像を390px証拠とは扱わない。これはfixture配信であり実API主催成功の証拠ではない。

本体 `/` は通常の「TAP TO START」、ゲームタイトル、法的情報導線の表示を確認。クラウドブラウザでは固定ドメインに認証済みsessionがなく、実データ侵攻の表示/主催は未検証。他スレQAユーザーのデータは変更していない。

新規匿名QAによる `get_state` のみの応答結果は `preview-get-state.json` に記録。主催・戦闘・資産消費は実行していない。

今回の匿名QA `get_state` はHTTP 409となり、state取得成功には至らなかった。既存ユーザーsessionの転用・状態更新・追加初期化は行わず、実API本体確認の残件として保持。
