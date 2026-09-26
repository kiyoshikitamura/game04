# G2 実表示追加点検（UI担当、2026-09-25）

## 版・範囲

- 親から引き継いだChrome tab31の実本体iframe。360×568は既読込5196222a、375×568・390×568は親の1b4473cd配信確認後に同branch URLを再読込。
- CSS viewportであり物理スマートフォン・Safariではない。回線スロットリングなし、セッション既存キャッシュあり。ブラウザ外枠は約1350pxで本体iframe左側が指定幅。スクリーンショット右側の空白と下の計測表はQA harnessであり本体に含めない。
- G2継続QAの保存済み所持・状態を使用。保存、claim、交換確定、購入、主催、戦闘は操作していない。別利用者は一覧表示のみ、参加・状態変更なし。
- 実表示担当は今回実装担当でもある。独立コードレビューは別担当E。今回の表示証拠を別担当による独立UI受入と呼ばない。

## 取得できた表示

|幅・版|画面/状態|結果|原本|
|---|---|---|---|
|360/519|設定プロフィール|ラベル/値1列、自己紹介未設定が横書き。Dialog本文スクロールで法務下部へ到達、閉じる固定・操作成立|settings-360.jpg / settings-bottom-360.jpg|
|360/519|5人デッキ|5カードとFooter表示。省略名はタップ詳細で全文確認可能|deck-five-360.jpg|
|360/519|スキル一覧・SSR絞込0|0件理由と絞込解除CTA表示。解除で一覧へ復帰|skill-filter-empty-360.jpg（名称に反し変更前の通常一覧画像）/ skill-ssr-empty-360.jpg|
|360/519|装備未所持|未所持理由と一括分解disabled、Footer操作成立|equipment-empty-360.jpg|
|360/519|任務5受取可|長文/複数報酬、内部scrollで最終任務CTAまで到達。受取送信なし|missions-top-360.jpg / missions-bottom-360.jpg|
|360/519|BOX0件|0件説明、一括受取disabled、閉じる表示・操作成立|box-empty-360.jpg|
|360/519|商店/VIP|価格案内・各入口・VIP販売準備中。外部購入不可表示を合格購入としない|shop-top-360.jpg|
|360/519|魂交換・0所持|最低10/2刻み、消費武将/数量・汎用魂レア/数量が折返し表示。入力は幅内、確認不可、固定閉じる操作成立|soul-confirm-360.jpg|
|360/519|共闘一覧|城カード/HP/残期間/人数/詳細CTAが画面幅内|raid-list-360.jpg|
|360/519|躑躅ヶ崎館・最終段階|開始→最終切替、敵Lv/HP/ATK/DEF更新、報酬多項目、未解放理由と侵攻disabledまでscroll到達|invasion-final-top-360.jpg / invasion-final-bottom-360.jpg|
|375/1b|本陣・武将詳細|本陣表示、竹中半兵衛の全名称/能力/育成CTA。下部閉じるのlocator操作でscroll到達・復帰|home-375-1b.jpg / character-detail-375-1b.jpg|
|390/1b|出陣1-3詳細/報酬|ステージボスLv7/HP3000/ATK150/DEF60をDOM確認、詳細の挑戦CTA固定。報酬Dialogの長文・数・戻る固定を目視し戻り成立。挑戦は送信していない|quest-detail-390-1b.jpg / quest-rewards-390-1b.jpg / quest-rewards-390-1b-dom.txt|

この代表範囲で横はみ出し・押せない固定CTA・スクロール不能の新規本体不具合は認めていない。ただし全画面全状態合格とはしない。

## 観測限界・阻害

- 侵攻のscroll操作でInput.synthesizeScrollGesture timeoutを1回取得。代替screenshot/DOM CUAに切り替えたところ実際のscroll完了と最下部CTAを確認。以後同じ復旧試行を繰り返していない。
- API get_stateはmutation busyを立てない。本担当は保存操作なし。返却後に親が1b/390×568で5枠目の左移動を実送信し、Footer5button.disabled→完了後enabled復帰/結果Dialog閉じるを確認した。根拠原本は `footer-busy-1b-390.txt` / `footer-settled-1b-390.txt`（親g2-r3保存）。R3UI06はこの親の実証範囲で更新する。
- 初回画像ローダーDOMには読み込み見出し/statusがあるが、見出し/sr-onlyは非表示ルールがある。DOM重複を視覚重複不具合としていない。
- 旧資産50系スキル表示の名称/画像が存在しても、正式72採用とは無関係。侵攻背景採用・供給外部設定・G4導線は既存保留を維持。
- QA計測表の再読込ボタンが暗い背景に暗い文字で見にくい小所見あり。通常本体のUIではない。ボタン機能/計測行は確認済みだが、このQA外観は未修正。
- 全対象の未確認表は`independent/U10_U11_COVERAGE_REVIEW.md`を継承。本体送信中/失敗/画像timeout、実機キーボード、6Wave/多数状態、全素材ID、終盤/受取/再送、P02〜P04統合などは今回のread-onlyでは閉じない。

## 保存

`ui-readonly/manifest.json`は取得原本のhash/bytes一覧。転送時に消えた4画像は同じ撮影済みbytesを再保存（再撮影なし）。スクリーンショットは観測時点がDOM更新より前になる場合があり、skill-filter-empty-360.jpgは通常一覧として分類を補正した。
