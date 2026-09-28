# F 回復薬・商店 本体実接続受入

- code: a0f92d99fc8ebb46dc39bdfa22b56e8710d22269
- immutable: https://game04-5uzykqdsl-kiyoshi-kitamura.vercel.app
- deployment: dpl_4auMAj7atYtvVrkgDAr6YFcwGemx
- API: v21（親確認）
- 本体iframe CSS viewport390×568 / Cloud Chrome / tab16。実機確認ではない。
- 専用新規QA G2QA薬F / d6dabf02-3eb2-430e-8352-561f8d735469。P03外部認証とは別。

## 実UI操作

1. 商店→交換所。行動力50/100、輝石200、活力丸0、使用disabled。
2. 回復薬×1、単価50輝石、交換数量2を指定。必要100輝石/受取2個のDOMを確認して交換。
3. 交換成功：輝石100、活力丸2、行動力50/100。08 DOM。
4. 使用確認Dialog：消費1/所持2、50→100、上限超過保持説明。低高さでも確認/閉じる可視。09画像/DOM。
5. 使用成功：行動力100/100、活力丸1、輝石100。10 DOM。確認後の使用ボタンisEnabled=false。
6. read-only DB照合：users.vitality=100、neon_diamonds=100、game04_player_state.version=4、state.energyDrinks=1。旧user_itemsには薬rowなし（現行stateがauthority）。

07画像は数量入力の再描画直前を捕捉して1個表示。2個の実交換根拠は07 DOM・08成功DOMとDB保存結果であり、07画像を2個表示の証拠とは扱わない。

## 境界検証（親fixture待ち）

親が上記専用QAのみ100→99の境界状態を作成後、残1個の薬使用99→149、残0、再読込保持を検証予定。
この準備は自然進行・G4受入とは区別し、薬使用操作自体は本体認証APIを使用する。

### 境界結果：PASS

- 親が専用QAのみv4→v5、vitality99へ境界setup。薬1/輝石100を保持。
- 本体reload→同一匿名QAで復帰、99/100表示。
- 使用確認に99→149/消費1/所持1を表示。実UIから使用成功。
- read-only DB：v6、vitality149、neon_diamonds100、state.energyDrinks0。
- 再reload→本陣149/100、交換所で活力丸0/輝石100/使用disabled。11〜13 DOM、13画像。
- 交換と薬使用は模擬付与ではなく認証API実操作。99への準備のみ境界fixture、自然進行受入ではない。
