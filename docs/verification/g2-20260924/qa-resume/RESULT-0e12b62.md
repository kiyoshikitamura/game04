# 再開候補0e12b62独立確認

コード0e12b62dae1fa50168e6b9fc6aa2af1368b3a32e / dpl_6eV43HvatddiaWxbH7kBUwGvAUxM / Preview READY。
固定URL https://game04-g8sktl9yj-kiyoshi-kitamura.vercel.app
API v22・DB20260924165049は親照合、今回ブラウザはゲームAPI操作以前で停止。

Vercelの既存ログイン済みDeployment詳細画面で上記SHA/固定URL/READY/Previewを照合。共有alias変更等なし。Deployment詳細DOMはブラウザツール出力で取得済み。07原本は保存後のファイル確認で残存せず、画像原本保存とは扱わない。

本体iframe CSS390×568（tab16）を開くとタイトルにTRIBE NEON英字とストリート人物・都市の画像、footerは戦国姫艶武が表示された。08画像。この画面のTAP role button操作後にDOMtimeout/空出力が生じたため、TAP自体のアプリ不具合とは断定していない。

切り分けとして同じ固定URLの本体rootを新tab21で1回開く。TAPは正常に「はじめから」「データをお持ちの方」へ遷移。「はじめから」を1回実行すると画面alert「Failed to fetch」、consoleにsignInAnonymouslyのTypeErrorが出た。09画像・DOM・console JSON。新規QA表示名設定に未到達。既存利用者変更なし、fixtureも未適用。

Auth通信失敗のため新候補のBOX正式資産受取→使用→再読込、利用不能旧スキル文言、設定戻り修正、画像待ち上限/再試行、API時間ログは未確認。失敗を反復せず親へ報告。実機確認・G2合格には扱わない。

## API検証の代替経路

親が旧747専用QA G2QA再検（UUID先頭4c888ed3）へCHAR_EXP_M×3、ENERGY_DRINK×1、SOUL_SELECTOR_N×1のBOX未受取fixtureを作成（source GAME04_QA / G2_BOX_RESUME_20260924 / 期限7日）。在庫への直接付与ではない。
旧747の保存済みsessionでAPIv22の本体接続を分離検証するため同じtab16を既知URLへ戻したが、navigateが70秒以上未完了。呼出を中止し長待機反復を避けた。受取操作は一切実行しておらず3件は未受取のまま、正式BOX本体受入は未完。新候補のAuth失敗とこのブラウザ遅延からアプリ原因/ネットワーク原因を断定しない。
