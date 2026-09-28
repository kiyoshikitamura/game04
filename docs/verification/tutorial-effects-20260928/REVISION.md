# 演出調整（2026-09-28、ユーザー追加指示）

本書は初回CHECKPOINTの3200ms／combo先行より新しい変更記録。

- world introduction: 冒頭本文のみ同梱G4NotoSerif（明朝）、weight900。共通テーマの全要素sans!importantに上書きされていたため対象限定の優先指定を追加。
- SSR: 3200ms→1600ms。CSSの長さも同じ定数から渡し、倍速・BURST速度・停止再開に追従。
- スキル名: clamp(19px,5.3vw,30px)→clamp(22px,6.1vw,34px)、約15%拡大。
- openingに限りaction_startの表示時間完了後にcombo650ms→次のdamageフレーム。記録内容を変更せず、pause/resumeとgeneration guardを共用。
- 通常BattleViewはcomboAfterAction=false。旧トレイラーQAでも元のcombo→skill順を実ブラウザで確認。
- 台詞、音源、戦闘記録、数値、main/Productionは変更なし。

実装SHA: 125cb22360720f99f2ceb819ef19920dad522bee
Preview: https://game04-9et06nu01-kiyoshi-kitamura.vercel.app/qa/tutorial-opening

検証: npm run check（型／共通UI契約／API bundle／build）PASS。ローカル390×664通しPASS。停止／倍速、9カットインの一度だけ再生、全3連撃のskill→combo→damage時刻順、通常時2倍の表示時間（設定800ms、実測はJSONに記録）、模擬戦〜完了〜再開始を確認。
最初のfont確認では共通sans指定との競合を検出し修正。revision-local/390-failure.pngはその修正前の証拠、390-world.pngと390-result.jsonが修正後。

配信先375×664の通し検証もPASS。revision-preview/375-result.jsonとPNGに記録。pageerror／HTTPエラー0、横溢れなし。
倍速判定でWeb Animations APIのupdatePlaybackRate反映前にassertする競合を検出し、検証側で次のanimation frameの反映を待つよう修正した。revision-preview/375-failure.pngはその判定時の画像であり、最終判定は375-result.json。
revision-recovery/result.json: 画像失敗→再試行、連撃中の停止→再開→ダメージ、中断reloadの検証PASS。
Deployment dpl_84dbmNMW1V3QqBaEhdRsxDwEo619、Preview READY、実装SHAとの一致確認済み。
物理端末の確認は未実施。実装未完なし。
