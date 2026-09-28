# SSR時間・模擬戦の派表示の追加調整

ユーザー追加指示により、SSRカットインを通常速度1600ms→800msへ短縮。CSSも同じ定数から時間を取得するため見た目と進行の長さが一致する。既存倍速とBURSTの最低表示時間は保持。

openingの模擬戦呼出しで既存hideWaveDisplayを有効化。戦闘ヘッダーの「第1派 / 全1派」と、開始時の「第1派」演出の両方を省く。「戦開始」・スキル→連撃→ダメージ・結果・台詞は保持。

実装SHA: 06dbfebe1b1b14a26123666cbebd86f7fe25eb83
専用ブランチ: codex/tutorial-effects-20260928。main／Production変更なし。

配信: https://game04-347w03j8v-kiyoshi-kitamura.vercel.app/qa/tutorial-opening
Deployment: dpl_JEK1SZwdUNumUgGWnVBc2XJAJc7j、Preview READY、上記SHAと一致。

検証: npm run check（型／共通UI契約／API bundle／build）PASS。配信先375×664の通し検証PASS。CSS 0.8s、スキル→連撃→ダメージ、模擬戦wave phaseなし、停止／再開／倍速、終了／再開始、pageerrorとHTTPエラー0を確認。shorter-preview/にJSONと画面証拠。物理端末は未確認。
