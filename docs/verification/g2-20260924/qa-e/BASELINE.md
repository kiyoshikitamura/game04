# G2独立検証 E：基準本体ベースライン

2026-09-24 12:34〜12:42 UTC。基準SHA e62d3894b54ce70aede4a23a8fc2599c40b744da。URL https://game04-rbch9l274-kiyoshi-kitamura.vercel.app 。API v19は親照合。

専用QA名 `G2QA独立E` を本体から新規作成。既存利用者の状態変更なし。Google等アカウント連携は未実施。匿名Supabase認証付き本体経路であり、P03受入とは区別。

## 実行成立
- TAP TO START→はじめから→旧イントロSKIP→名前登録→本陣。
- 出陣→三河→1-1。ステージボスLv1/HP650/ATK35/DEF10、1Wave、消費0を表示。
- 3人出撃、実戦闘、停止→敵詳細→×2→再開→自然勝利→結果。
- 銭2600→3100、武将EXP小1、装備EXP小1、スキル召喚券1、前田利家1を表示。
- 再読込→タイトル→チュートリアルを続ける→本陣、銭3100とQA名を保持。
- 武将→くノ一→Lv育成。EXP小1個、消費銭60、Lv1→3、EXP0→100、銭3100→3040、素材1→0。結果表示一致。
- 以上は基準版のベースライン。最終統合版で再検証前。DB直接照合は親に依頼。

## 問題
|ID|Q/U|症状|証拠/原因候補|状態|
|---|---|---|---|---|
|E-001|Q01/Q04/U10|設定プロフィール保存失敗。設定内とエラーDialogで同じ文言重複|`Profile update failed: permission denied for table users`。useUserProfile.tsがusers直接UPDATE|親へ修正依頼、再検証待ち|
|E-002|Q03/U07|1-1勝利/報酬/再読込後も『出陣1回完了』0/1。旧バトル/同盟任務準備中露出|baseline-missions-dom.txt|親へ修正依頼、再検証待ち|
|E-003|Q01/U05|出陣一覧→詳細→準備で毎回画像待ち。Dialog内外に複数ローディング、武将各タブでも画像準備Dialog|DOM観測、正確なAPI/画像時間分離は未測定|Dへ共有|
|E-004|Q03/G4|戦国キャラの旧都市イントロ『この街には、いろんな生き方をしてる奴がいる。』、再開がチュートリアルを続ける表記|baseline-intro-dom.txt|G4境界として記録、G2でチュートリアル再実装しない|
|E-005|Q01/U10|未セットアップ直後にplayer profile not foundとchat_read_states_user_id_fkey警告|ブラウザconsole。未登録中の共通取得起動が候補|D/親へ共有|
|E-006|Q03/Q04/U04|結果に『体力回復 +0』、正式行動力用語不統一|baseline-reward-dom.txt|修正候補|

## 検証条件と未確認
- cloud Chrome、viewport DOM実測1363×936、ゲーム幅560。実機ではない。
- Browser skillの公開APIにviewport変更/ネットワークタイミング/キャッシュ制御がなく、360/375/390/390×568は未実施。
- 560×936戦闘は味方カード下部が画面外、縦スクロール存在。モバイル違反とは断定しない。モック比較/小画面確認が必要。
- 初回開始クリック12秒後に起動中を観測、後に本体へ遷移。観測間隔を含むため正確な起動時間と扱わない。
- 再開ボタン→本陣DOM観測は7654ms（tool呼出し間隔を含む上限）。API待ち/画像待ちを分離した性能値ではない。
- 同一候補統合版、全画面、360等、実機、P02決済、Google等認証復帰、計測イベントDB、ログボ/BOX/商店/侵攻は未受入。

画像とDOM証拠は同ディレクトリ。スクリーンショットは動的戦闘の瞬間がDOM取得と異なるため同一フレームの厳密数値照合には使用しない。

## 追加の実DB照合（12:46 UTC頃）
Supabase execute_sqlによるread-only、専用QA user_id `b9003819-973a-47b2-a1ef-9e503c60bb7b` のみ。
- users.cash=3040、game04_player_state.version=4。
- clearedStages=[mikawa-1]、questClearCounts mikawa-1=1。
- char_alice_01（くノ一）level=3、exp=100、growthVersion APPROVED_GROWTH_V1_20260921。
- playerProgress exp=20、level=1、active。
- growthInventory character小=0、equipment小=1、carryExp両方0。
- questTicketGrants SPECIAL_TICKET_SKILL=1。
実本体→匿名認証API→DBで出陣・報酬・育成の一致を確認。Google認証/アカウント移行/ログアウト復帰は別途未確認。

## 追加の画面点検
- プレゼントBOX空状態、お知らせ空状態は表示成立。受取対象なし、付与/二重受取は未検証。
- 商店VIP販売準備中、実購入情報は「ただいま購入できません」。実金銭の操作なし。
- 交換所「正式Masterに定義された交換のみ利用できます」の開発文露出を親へ共有。回復薬50輝石/所持0では不足文言・確定CTA無効化が成立。
- 共闘見出し「レイド」、エンカウント/領土侵攻、既存他者開催を表示。既存開催への参加/攻撃はしていない。
- 侵攻一覧は5城/主催者Lv1 EXP0/100/開催枠0/1/侵攻令1。初回はページと各画像に複数loader。基準データは全城開始敵が柴田勝家、誤割当か正式値かはC/A照合対象。
