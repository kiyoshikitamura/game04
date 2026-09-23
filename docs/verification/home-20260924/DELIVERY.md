# GAME04 本陣 UI／演出仕上げ

## 配信・保存

- 実装SHA: `5dc1c98beeec2e1e7086d88319974f5fd6e65595`
- Branch: `work/game04-home-finish-20260924`
- 固定Preview: https://game04-b629u8avu-kiyoshi-kitamura.vercel.app
- Deployment: `dpl_5NfHiEqoGdxkfw1ujNSDPS963nRe`
- 配信SHA: `5dc1c98beeec2e1e7086d88319974f5fd6e65595`（`/api/qa/deployment` で確認）
- PR: https://github.com/kiyoshikitamura/game04/pull/25 （Draft、mainへ未マージ）
- 統合元: `dce0bda37f353c2706e5566fba6333fbdc2c393c`。資料のみ `ec3cc023835906101e7213cdceabdb34eb652a80` から取込み。
- Production配信・Production環境変更・mainマージなし。

## 実装

正式本体 `/` の `RedesignApp → RedesignShell → HomeView` を更新。通常・共闘発生・同一ページの下部スクロール・統合切替Dialogを実装。選択背景に対応する既存演出、既存武将全身絵・アイコン・装飾を使用。画像decode完了まで操作を止める。

Headerは顔/Lv/名前/認証/同盟欄/メニュー/銭/輝石/行動力。Footerは本陣/出陣/武将/共闘/召喚。同盟は非活性。切替はテキストのみ。総合力・RP・経験値・回復時間は追加していない。

武将と背景を一括で保存し、未解放・未所持・不正IDは全体を拒否。全10エリアの背景は既存の出陣エリア・解放関数に接続。独自の解放条件・費用・報酬は追加していない。

認証入口は旧チュートリアルの自動閉鎖処理と競合していたため、GAME04からの明示的な開閉状態を独立させた。既存の認証処理・同一UID確認・完了RPC・衝突処理は保持。

## 画面比較

[4状態一覧](comparison-four-states.jpg) / [通常](comparison-normal.jpg) / [共闘発生](comparison-encounter.jpg) / [下部](comparison-lower.jpg) / [統合切替](comparison-switch.jpg)

本体を390pxで撮影し、承認原本の対応パネルを同じ幅へ縦横比を維持して縮小。高さ差は余白で示す。数値・人物名・活動内容・所持数は正式データ差。Header/Footerの既知差は [比較基準](VERIFICATION_CRITERIA.md) に明示。人物ポーズ等は正式既存素材を優先し、モックに合わせて再生成していない。

[低画面上部](home-switch-low-final.jpg) / [低画面末尾](home-switch-low-bottom.jpg) は390×568の本体。内部スクロールで関ヶ原まで到達し、保存/閉じるは固定、背景操作不可。

画像の第1版→差戻し→第2版→最終判定を [独立検証](INDEPENDENT_REVIEW.md) に記録。独立担当は画像/コード/記録を検証し、不一致を表示担当へ直接差戻し。ブラウザ操作は対応ツールを持つ親担当が実行した。

## 検証区分と結果

| 区分 | 操作・確認 | 結果 |
|---|---|---|
| 本体＋実API | 本陣QA924で伝令＋夕桜城下町を選択→保存→閉じる→本体反映→再読込→継続 | 両方復元。くノ一＋城門へ実保存で復元 |
| 本体 | 別武将を選択→閉じる | 保存値・本体表示は不変 |
| 本体 | 390×568で背景末尾まで内部スクロール→固定保存 | 閉じて本体へ復帰。Header/Footer干渉なし |
| 本体 | 未解放背景・同盟 | disabled、解放理由を表示 |
| 本体 | 出陣の続き | 正式次ステージ1-1の確認へ遷移 |
| 本体 | 領土侵攻・任務・商店 | 正式画面/解放状態/任務情報へ遷移 |
| 本体 | Footer出陣・武将・共闘・召喚、本陣へ復帰 | 正式画面へ遷移、共通Header/Footerを保持 |
| 本体 | メニュー・アカウント連携 | お知らせ/BOX/設定等の既存入口、Google/メール既存フォームの表示と閉じるを確認 |
| 本体 | 活動/全体/DM、交流を開く | データ切替、全体入力、空DM表示、空送信disabledを確認。送信はしていない |
| 本体＋静的 | 未読・任務バッジ | 既存dmUnreadTotal/conversations、Inbox未読/BOX未受取、claimable任務へ接続。既読処理は既存chat panel状態を共用。実QAのDM未読は0、正の未読配送は作成していない |
| 本体 | ローテーションバナー | 8秒で召喚/商店切替。各表示をクリックし通常登用/正式商店への一致を確認 |
| 本体＋QA seed | 共闘通知 | 正式Master生成roomの柴田勝家/残り時間/IDが詳細HP39000・主催者と一致 |
| 本体＋QA seed | 通知期限切れ | 17:59:44 UTCの期限到達で通知が自動消滅。DB statusがactiveのままでも非表示 |
| 静的 | 終了済み通知 | 候補選定はstatus=activeかつ将来期限のみ。終了状態は対象外 |
| QA fixture | 遅延保存をダブルクリック | attempts=1/pending=1。上部×/下部閉じる/保存/選択はdisabled。実API成功の証拠とは区別 |
| QA fixture | 初回保存失敗→再試行 | draft保持/永続値不変/エラー表示→attempts=2/successes=1、選択を反映 |
| 実API | 保存・復元・同一requestId・旧ID・未解放/不正/未所持拒否・他資産保持 | [live-api.json](live-api.json) の7群PASS |
| ドメイン | 10エリア対応/解放境界/旧ID/原子性 | verify_game04_home_selection.mjs PASS |
| ビルド | TypeScript/Next build、最終Vercel build | PASS。これだけをUI完成判定にはしていない |

OAuth/メールを実送信しての認証完了、課金、チャット送信、自然遭遇を発生させる周回は実施していない。今回は各既存機能の入口・表示・状態接続を確認し、外部送信や購入を起こしていない。正の未読配送と終了roomの実操作は上表の通り未実施であり、実操作PASSに含めない。

標準画面は専用Branch aliasの `/qa/home-live-viewport` 内で実本体 `/` を操作した。同経路は幅を固定するiframeだけで、fixtureデータや本体CSSを注入しない。最終実装SHA配信後の低画面・認証入口・再保存を確認。固定URL上でも `/qa/home-state` の読込ゲート・連打排他・保存中×無効を再確認。

## API配信の保全

GAME04 dev project `lrgyllgzcdcphlbmkknc` の `game04-redesign-api` v18（verify_jwt=true）へ適用。DB schema変更なし。

作業開始時のrepo APIはv16、実配信は並走成果を含むv17だった。実配信v17を取得し、ホーム選択の閉包とset_home分岐だけを置換。無関係な既存部分が逆変換で一致することをスクリプトで検証してから配信した。古いAPI一式への上書きはしていない。

- 配信bundle SHA256: `5b0361a779d3f45bbe6c4831687c960d20f165e5444543c02561751fbe635ae9`
- [差分適用スクリプト](../../../scripts/patch_game04_home_live_api.mjs)
- [実API検証スクリプト](../../../scripts/verify_game04_home_live_api.mjs)
- [遭遇fixtureの由来/適用記録](encounter-fixture.json)

共闘fixtureは専用QAの新規room1行だけ。プレイヤー資産・成長・既存roomを変更していない。秘密値/セッションはGitへ保存していない。

## 素材・共有変更

[素材対応表](../../design/home/2026-09-23/ASSET_MAPPING.md)。新規ラスタ制作0点。正式人物・背景・sengokuアイコン・既存共闘桜装飾・既存演出を再利用。不足を無関係素材で埋めていない。

共通変更は親担当がRedesignShell/ShellChrome/Modal/TutorialAuthenticationへ集約。ModalのcloseDisabledは任意・既定falseで他Dialogの挙動を保持。共闘/出陣/武将のHeader/Footerと遷移を確認。担当外のページ本文は変更していない。各ページ内部に残る登用/キャラ/ダイヤ等の用語は担当ラインへ引継ぐ名称マップとして記録し、無断改名していない。

実装の未解消不具合は今回の検証範囲ではなし。上表の未実施項目を実検証済みとは扱わない。
