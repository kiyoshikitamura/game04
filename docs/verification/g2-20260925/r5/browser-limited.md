# R5 本体ブラウザ限定確認

対象コード `9e9a0a67da69ee34c9297b123bdf4bf7e06e233b`。不変Previewは [deployment.json](deployment.json)。実操作は同SHAを返す専用ブランチPreviewの `/qa/home-live-viewport?width=390&height=568` 内の本体。Chromeクラウドブラウザ、390×568 CSS iframe。実端末確認ではない。回線制限なし、同セッションの混在キャッシュ。全画面監査ではない。

## 対象と結果

- 専用QA `G2継続QA` だけに正式72スキルLB0と65面クリアの表示fixtureを追加。旧8スキル・武将・残高を保持。SQLは [visual-qa-fixture.sql](visual-qa-fixture.sql)。自然進行・G4受入ではない。
- スキル一覧：正式72＋旧8の80 img全件でcomplete/naturalWidthを確認。名称は正式表へ反映。火走り詳細で画像・LB0→1性能・SP・消費条件を表示確認。LB実行なし。[詳細画像](g2-r5-skill.jpg)。792値不変の静的検証と区別。
- デッキ→武将→スキル変更：72正式名称を候補に表示。水断を選択→保存完了Dialog→デッキに水断LB0。DB version24、先頭char_alice_01のskillIds=[SKD008]、所持80を照合。他メンバーの旧SKILL_002/003を保持。[装着候補DOM](g2-r5-equip-snapshot.txt)、[保存後DOM](g2-r5-equipped-snapshot.txt)。今回この操作の再ログインは未実施。
- 出陣：10エリアが本体に表示。画像グループ10枚success、519.2msを観測。初回三河・尾張の表示、三河ステージ一覧へ遷移を確認。[出陣画像](g2-r5-quest.jpg)。全10エリアの実戦闘再生を行った意味ではない。
- 侵攻：5城の詳細を開き、開始Lv1／中間Lv6／最終Lv12を操作。DOMの背景srcは15組すべて対応表と一致。領域clientWidth/scrollWidthは380/380。添付の通常／関門／城主は既存正式区分に対応し、進行条件・敵値を変更していない。[DOM原本](g2-r5-browser-dom.json)。初回瞬間観測にはloaded=falseを含むため、15枚全部の最終デコード完了をこのDOMだけで合格にしない。配信HTTP・画像デコードは別の全件検証で確認。岡崎城関門と安土城最終の操作画面を保存。[関門背景](g2-r5-invasion-background.jpg)、[最終段階](g2-r5-invasion.jpg)。既存モバイル表示はスクロールで参照できた。
- XL武将／装備素材の新URLは侵攻最終報酬の実DOMへ接続。素材10点全ての個別Dialog操作・全素材を使う育成の再演は未実施。素材ID/path/HTTP全件検証とは分離。
- 新侵攻の保存battleに正式気合・水断の名称/画像が接続。実戦保存は独立担当のAPI証拠。本確認で全バトル演出の実表示を合格へ拡張しない。

## 計測・残件

[計測DOM](g2-r5-browser-snapshot.txt) にAPI/画像の分離原本を保存。初回get_state 1765.2ms、本陣9枚427.4ms、出陣2枚1107.4ms、再訪10枚519.2ms、growth65画像2009.7ms。APIと画像区間は並行するため合算しない。最初のCTA timeout60532msはTAP・ログボ操作待ちを含む観測で、性能不具合と判定しない。

R4の同条件反復測定を保持。R5は素材数・fixture状態が違うためR4との速度改善比較に使わない。cold-cache、実戦闘開始のCTA/API/画像、承認性能基準はR08/D04の残り。今回新しい合格閾値を設定していない。

最初の旧ブラウザtab再使用はEmulation.setFocusEmulationEnabled timeout。別tabへ一度切替で復旧。後の一括操作で詳細画面への遷移未成立によるselector timeoutが1回あり、画面を読み直して個別操作で5城まで到達。環境全体の停止理由にしない。R05/R06の対象通信・画像だけへの障害注入は利用中のブラウザAPIに公開経路がなく、実Previewでの障害表示→retry/終了操作の受入は未実施を維持。局所HTTP試験とstarted再開API/DBは継承。

SSR背景10枚は正規化・ID対応・配信を確認。6細則は未承認のため本陣選択へ追加していない。解放・選択・永続保存はSBG-01判断後のG2作業。
