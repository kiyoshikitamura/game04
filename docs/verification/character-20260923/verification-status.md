# キャラ配下 独立検証（2026-09-24）

総合状態：**部分完了。本体実 API ブラウザ検証・配信後総合受入は未完了。** 型チェックやビルド成功を受入の代わりにしていない。

## 1. 正式ドメイン：PASS

`node scripts/verify_game04_character_growth.cjs` と `node scripts/verify_game04_character_boundaries.cjs`。証跡は `domain-growth.log` / `domain-boundaries.log`。

- 編成枠3→4→5、最大5、同一武将重複拒否。
- 6装備枠保存、アクセサリ2個体、同一個体2枠・未定義7枠目・部位不一致拒否。
- 保護中・装備中の分解拒否、操作失敗時の元state非変更。
- 正本EXP/銭800セル、素材不足・解放上限、汎用魂併用、初回解放の汎用魂禁止、再解放拒否。
- 魂交換最低10・偶数、端数保持、スキル不足/上限、装備LB上限。
- 正式装備160件、成長曲線、LB能力値二重補正なし。
- 結果はbefore/after実差分。覚醒/装備LBで現在Lv不変を表示。同じstateの再送で成功差分を捏造しない。

## 2. QA fixtureブラウザ：PASS（保存/APIなし）

`node scripts/verify_game04_character_browser.cjs`。共通GrowthViewを使う `/qa/redesign?view=character`。最終証跡 `fixture-browser.json` と `fixture-*.png`。

390×844 / 390×600、**48画面、38Dialog状態**。デッキ・編成・キャラ一覧/詳細/全身・Lv育成/結果・覚醒/結果・魂解放/結果・魂交換/確認・スキル一覧/詳細/LB結果・装備一覧/詳細/Lv育成/結果/LB結果/保護/分解確認を撮影。

- 全可視画像のdecode完了、未読込/破損画像0。初期デッキも画像準備Dialog完了後に撮影。
- 全38Dialogは同時1つ、画面中央、最大80dvh、背面 `.rd-shell` inert。
- `.rd-modal-body` の内部スクロール末尾へ移動し、最後のボタンが本文範囲内へ到達することをDOM座標で確認。各 `*-end-*` 画像あり。
- スクロールバー実計算色：金 `rgb(196,161,107)` / 暗 `rgb(33,23,27)`。
- 横溢れ0、JavaScript pageerror0。デッキ5枠・表示共通SP400。
- Lv育成キャンセル後に素材選択し直し、同時2clickでも銭30,000→29,940の1回消費を確認。スキルLBも同時2click操作。
- 魂交換8/11入力は確認不可。確認→取消、育成キャンセル、分解確認の閉じるを操作。
- 装備保護後は分解button無効、解除後は確認へ進める。分解確定による削除と再読込は実API証跡側で検証。

これはfixture stateの操作であり、認証・本体API・DB保存・配信先の証拠ではない。全操作の不足/上限/連打をブラウザですべて網羅したという意味でもない。

## 3. 実API：別担当証跡

`live-api.md` / `live-api.json` を参照。API担当から24/24 PASSの完了連絡あり。成功・同一request再送・保存再読込・拒否時非消費を実GAME04 devの専用QAアカウントで検証。本項のAPI検証を、本体ブラウザ通過と読み替えない。

## 4. 本体rootブラウザ：承認レビューで停止

`verify_game04_character_mainbody.cjs` はfixtureではない `/` と実QAセッションを用いる。最初の診断はローカルURLのproxy迂回不足によりHTTP502（`mainbody-browser.json` / `mainbody-blocked.png`）。本体画面や実API成功の証拠ではない。

続く実QAセッション使用はautomatic approval reviewに拒否された。理由は「認証セッションとprivate user/API dataを未確認Supabase宛先へ送信し、親エージェントの再開指示だけではその開示を認められない」。

親はMCPで `lrgyllgzcdcphlbmkknc` が `game04-dev-clean / ACTIVE_HEALTHY` と確認。公開設定URL・公開JWT refも同値。これを受け、スクリプトに固定URL・公開JWT ref・専用QA user IDの照合と、ブラウザ通信をlocalhostおよびこのSupabase originだけに限定するallowlistを追加した。しかしこの安全化後も同じレビュー理由で再度拒否された。以降の再試行・間接実行は停止した。

**本体上の実API操作・状態再読込・本体Header/Footerのクエスト/レイド回帰は未確認。** 続行にはユーザーの明示的承認が必要。

## 5. 訂正済み6基準画像との並置比較

`python scripts/verify_game04_character_comparison.py` で `comparison-01.jpg`〜`comparison-06.jpg` を生成。上段は `docs/design/character/2026-09-23/corrected/*-baseline.jpg`、下段は最終QA fixture。同じ表示例の数値・所持者に合わせた捏造はしていない。

- 01：キャラ一覧・詳細・内部スクロール末尾。正式LB表記、HP/攻撃力/防御力/幸運。
- 02：デッキ・編成・スキル一覧・装備一覧。Criticalなし、5枠、共通SP400。
- 03/04：育成・覚醒・魂解放の操作前と中央結果を別状態で比較。
- 05/06：スキルLB・装備Lv・装備LB操作前/結果。結果は中央Dialog1つのみ。

修正確認：デッキ縦長人物、名前/Lvの不要折返し削減、総合HP→属性→共通SPの順、選択中スキル、3種おまかせの正式アイコン、控えめな桜装飾、結果中央人物と名前、6装備枠、詳細下端CTA。

**完全なピクセル一致・デザイン最終承認は主張しない。** 基準の絵柄/所持者/表示数値は実stateと異なり、fixtureヘッダーは本体共通Header自体ではない。装飾密度・基準との余白/カード比率差は並置画像で確認できる。

## 6. 外部判断待ち

旧50スキル→新72スキルの所持引継ぎ対応表は未承認。黙って換算/削除していない。新規API/fixture検証成功で既存全ユーザー移行完了とはしない。
