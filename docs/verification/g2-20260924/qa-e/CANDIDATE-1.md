# G2第一候補の独立確認

対象 SHA `3d497f8aafb41108a0c8df25e39ba988041000fb`、Deployment `dpl_9GmrcqtFnKbVXGXvCGDYSbSbPPhr`。
固定URL https://game04-avanz6nyl-kiyoshi-kitamura.vercel.app 。API v20（親確認）。2026-09-24 13時台UTC。
専用QA `G2QA改E`、user_id `6386ae36-9c7e-4a52-8fe7-28d4382ba35b`。

## 閉じた修正
- E-001プロフィール：設定で自己紹介 `G2候補E 保存確認` を保存→保存完了。users.bioをread-only SQL照合し一致。iframe新規読込でも表示保持。
- U03表示：行動力50/100、時間経過後51/100を確認。300秒の厳密計時と薬使用は未確認。
- U08交換：360幅本体で回復薬1個、確認時50輝石/所持200、実行→UI150。DB energyDrinks=1/version3。users.diamondsは旧列0であり正式walletではない。正式wallet users.neon_diamonds=150 を2026-09-24の専用QA限定read-only SQLで照合済み。
- 出陣詳細/準備では重複人物loaderがなくなり、準備中→人物カード一括表示。G2全画面Q01合格までは未達。
- 375幅おまかせ編成保存CTA→API応答『変更はありません』。

## 寸法・CTA
`/qa/home-live-viewport` は実アプリ `/` を指定寸法iframeへ載せるだけ。fixture/状態注入なし。実機ではなくCSS viewport検証。
|寸法|実測root幅/scroll幅|確認|
|---|---|---|
|360×844|360/360|本陣Header/Footer、商店交換Dialog、交換確定CTA|
|375×844|375/375|本陣、武将デッキ、編成保存CTA|
|390×844|390/390|本陣、出陣一覧→エリア、本陣→任務|
|390×568|390/390|本陣、設定編集キャンセル/閉じる、出陣詳細→挑戦→準備→編成変更|

390×568出撃準備Dialog rect x12 y56.8 w366 h454.4、本文clientHeight313/scrollHeight431、固定出撃CTA y450.8〜495.2。編成変更は本文内スクロールで到達、click成立。
全画面・全状態・長名/大数量・ソフトキーボード・safe-area実機は未確認。任務は次候補予定のため旧表示を合格にしない。

## ローディング数値
ブラウザAPIはread-only DOMを公開しperformance/network/cache制御を提供していない。API待ちと画像待ちの内訳は未計測。以下の操作時間はNode側Date.nowを単一tool呼出し内で計測、browser tool操作往復を含む。
- 390×568候補 再開click→任務click成立3189ms。
- 390×568候補 出陣click→三河open2835ms、詳細を開いた後の挑戦click成立2036ms。

同じcloud Chrome、390×844、双方同時点のAPI v20、直前に同操作で画像をwarmup。アカウントは別（基準G2QA独立Eは1-1クリア/育成済み、候補G2QA改Eは初期3人）。同画像の本陣/三河一覧を操作し、battle/報酬なし。
|版|pass|出陣click→三河open|本陣click→任務open|
|---|---|---:|---:|
|基準|warmup|1445ms|2049ms|
|基準|測定|2034ms|2046ms|
|候補|warmup|9853ms|2058ms|
|候補|測定|2030ms|2052ms|
明確な速度改善はこの測定から主張できない。候補warmupの9853msは原因未分離。ブラウザ内Performance計測を追加する必要がある。

HTTP HTML別測定（Python urllib、ブラウザ外、同実行環境・順次1回、双方Vercel cache HIT、28310 bytes）：基準headers10306.4ms/full10334.8ms、候補8688.8/8720.2ms。実端末起動時間やWeb Vitalsではない。

## 未完
最終統合版、U01正式72件、任務/ログボ、薬使用、全幅全対象、計測契約、P02/P03外部接続は未受入。G2全体合格不可。
