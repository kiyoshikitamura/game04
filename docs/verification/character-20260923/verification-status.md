# キャラ配下 独立検証（2026-09-24）

現在の状態：**新規合成QAによる固定Preview本体の実操作・結果・保存・再読込までPASS。** 先行した既存セッション方式の停止は履歴として保持する。型チェックやビルド成功を受入の代わりにしていない。旧スキル移行など外部判断待ちは別項のまま。

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

## 4. 先行する既存セッション方式：承認レビューで停止（履歴）

`verify_game04_character_mainbody.cjs` はfixtureではない `/` と実QAセッションを用いる。最初の診断はローカルURLのproxy迂回不足によりHTTP502（`mainbody-browser.json` / `mainbody-blocked.png`）。本体画面や実API成功の証拠ではない。

続く実QAセッション使用はautomatic approval reviewに拒否された。理由は「認証セッションとprivate user/API dataを未確認Supabase宛先へ送信し、親エージェントの再開指示だけではその開示を認められない」。

親はMCPで `lrgyllgzcdcphlbmkknc` が `game04-dev-clean / ACTIVE_HEALTHY` と確認。公開設定URL・公開JWT refも同値。これを受け、スクリプトに固定URL・公開JWT ref・専用QA user IDの照合と、ブラウザ通信をlocalhostおよびこのSupabase originだけに限定するallowlistを追加した。しかしこの安全化後も同じレビュー理由で再度拒否された。以降の再試行・間接実行は停止した。

この時点では本体実API操作・再読込は未確認だった。その後も既存セッション方式は再実行せず、通常UIで新規作成した合成QAだけを使う別方式で本体操作・保存・再読込を完了した（第9項）。共通UI回帰は第7項。現在の本体未完了を意味するものではない。

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

## 7. 認証不要の共通UI回帰と独立目視（追記）

認証付き検証を再開せず、専用の `verify_game04_character_shared_regression.cjs` でlocalhost以外の通信を全遮断。QAセッションを読み込まない。`/qa/raid-integrated` は本体RedesignShell/Headerを使用するオフラインfixture、`/qa/redesign?view=quest` はQuestViewのfixture。

初回18画面ではHeader固定、画像、横溢れ、Dialog中央/閉じる導線は通過。一方、既存 `game04-visual-tokens.css` の高詳細度max-height指定により、CanonicalDialogの準備画面が600高で568px、844高で777.5pxになり80dvhを超えていた。親へ差戻し、専用Branchの同指定を80dvh上限へ最小修正。

比較01〜06は検証担当が全て目視。重大差分として、(1)編成画面でHP/属性/SP/移動操作が候補一覧を画面下へ押し出す、(2)スキル詳細の開発仮設定注記と小さい強化CTA、をUI担当へ直接差戻した。人物/素材の正式絵柄差、装飾密度、情報密度、結果の実数差は完全一致の主張から除外。結果中央1Dialog・実差分・詳細の末尾到達は機能検証済み。

親の80dvh修正後、回帰18画面を再実行しPASS（`shared-regression.json`、`regression-*.png`）。600高のレイド/クエスト準備は高さ480px・y60px、844高では675.1875px・y84.40625px。すべて中央80dvh以内、本文末尾到達true、閉じる/戻る/挑む/報酬受取/救援CTAはDialog範囲内。Headerのy=0、横溢れ0、未読込画像0、pageerror0、金色スクロールバーを確認。配信Previewそのものの確認や認証付き本体検証ではない。

## 8. 保存失敗後の状態保持：PASS

`verify_game04_character_failure.cjs` / `failure-retry.json` / `failure-*-390x600.png`。親が許可したQA限定 `rejectOnce` は `character_level / character_awaken / save_deck` の3actionだけを許可し、最初の1回のみ失敗させる。本体・実API・DBには影響せず、ブラウザ外部通信を遮断する。

- EXP素材小3・中2を指定→失敗後も値を保持、Dialog1つ、再試行で成功。
- 覚醒の固有魂1・汎用魂残りを指定→失敗後も内訳を保持、Dialog1つ、再試行で成功。
- 編成の右移動→保存失敗後はデッキ順・選択位置を変更しない。再試行成功時だけ並び順と選択位置を更新。
- JavaScript pageerror0。失敗メッセージで入力Dialogをunmountしない修正、save成功を待って選択位置を変える修正を実操作で確認。

最終UI凍結後に48画面を再撮影して全検証PASS、比較6枚を再生成。差戻し2点を再目視し解消を確認：編成候補カードが390×844の画面内に戻った。スキル詳細から開発仮設定注記が消え、現在/次の効果倍率と赤い全幅LB CTAが表示される。Lv育成は対象の現在→育成後Lv、4素材カード、消費/残額、横並びキャンセル/育成CTAが844高内に収まる。600高の結果は内部スクロールを使用し、末尾の閉じるへ到達可能。これ以上の重大な切れ・重なり・画像欠落は確認していない。厳密なピクセル一致と認証付き本体受入は引き続き未主張。

## Git保存した画像の範囲

6枚の並置比較と代表的な低画面・故障保持のJPEGを保存。48状態の全数値はfixture-browser.json、共通回帰18状態はshared-regression.json、故障3件はfailure-retry.json。全PNGは検証スクリプトで再生成可能だが、Gitには重複画像をすべて格納していない。比較画像はQA fixtureであり認証付き本体受入の代用ではない。


## 9. 新規合成QAで固定Preview本体を完了：PASS

`https://game04-btsnlophl-kiyoshi-kitamura.vercel.app` のrootを実際に使用。通常の「はじめから」でこのターン新規作成した合成QAだけを使い、既存ユーザーのセッションファイル・私有stateを読まない方式へ変更した。固定Previewと指定GAME04 dev originだけへ通信し、秘密情報を証跡に保存していない。

- `fresh-mainbody-browser.json`：64画面、50Dialog状態、実API9操作がすべて200、pageerror0、失敗0。
- 編成順入替、装備を外す/同じ個体を戻す、キャラLv育成/覚醒/魂解放、スキルLB、装備Lv/LBを本体UIから実行。各結果Dialog→閉じる→反映を確認。
- 最終reloadのget_stateで銭・武将・スキル・装備個体・編成順/割当・魂・在庫・素材が完全一致（version11、銭1,990,400）。親もDBから独立照合済み。
- 390×844 / 390×600。可視画像読込不備0、横溢れ0、中央80dvh以内、Dialog1つ、背面inert。600高の内部末尾「閉じる」まで到達。
- `mainbody-comparison-01.jpg`〜`mainbody-comparison-06.jpg`：訂正済み6基準と実本体を並置し全6枚目視。844育成CTA初期表示、編成候補、一覧密度、結果と閉じるを確認。モック内の表示例数値/絵柄差・装飾密度差はピクセル一致と主張しない。

詳細は `mainbody-status.md`。旧方式の拒否履歴と新規QA方式の成功を区別し、fixtureや単体APIの証拠を本体証拠へ読み替えていない。追加テスト・本体変更は行わず、この結果で検証ファイルを凍結した。
