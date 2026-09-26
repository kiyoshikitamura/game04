# 共闘pending明細・現在予告の分離表示

code a0f92d99fc8ebb46dc39bdfa22b56e8710d22269 / https://game04-5uzykqdsl-kiyoshi-kitamura.vercel.app / dpl_4auMAj7atYtvVrkgDAr6YFcwGemx / API v21。

親が作成した表示fixture room8a525b0e-de45-4a62-ad67-f893cea7db0d、owner=専用QA薬F。E実戦開催を読み取り複製した自室で、現在Lv3・pending Lv2報酬1件。このfixtureで実戦資格獲得や報酬実付与を受入済みとはしない。受取ボタンを実行していない。

本体390×568にて共闘一覧→開催者G2QA薬Fの岡崎城Lv3→報酬。

- 『受取可能な報酬（1件）』『Lv.2 討伐報酬』に銭1000・スキルLB素材1・装備LB素材1を表示。
- その下に閉じた『現在のLv.3の報酬・獲得条件』を別表示。
- 展開すると個別勝利報酬と『Lv.3 討伐時の報酬』（銭5000・スキルLB2・装備LB2・EXP等）を表示。
- pending実明細と将来討伐時の報酬が区別できる。低高さDialogで実明細・受取CTA可視。PASS。

証拠14/15画像・DOM。CSS iframe viewportであり実機ではない。

再入場時に累計day2ログボが自然発生し銭が12600→22600になった。薬検証の輝石100・行動力149は保持。本記録にある銭差分は共闘報酬の受取ではない。
