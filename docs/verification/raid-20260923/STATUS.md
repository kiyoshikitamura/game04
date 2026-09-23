# GAME04 Work統合記録 — 2026-09-23

**完成受入前。主催条件・指定画面幅等の未検証を残す。**

追記（2026-09-23）：新規素材17点はユーザーが一括採用。背景の今後追加も可能。以下の素材「未承認」は検証時点の履歴で、この追記を優先する。主催EXP案はユーザーから用途の質問を受けた段階で、採用は未確定。侵攻専用の主催者Lv用EXPであり、プレイヤーEXPとは別。

## 固定実装

- Repository: kiyoshikitamura/game04
- Branch: work/game04-raid-completion-20260923
- 実装SHA: 237c1562d47275f02fb3274c8aacfdb1358409b3
- Preview: https://game04-oupgp18ej-kiyoshi-kitamura.vercel.app
- Deployment: dpl_CDmCYMqh3Dib3PY6szh7ZHXBxcQN
- 引継元: 5963698663e96bfa909c0cbb3b7c45c5db21f2ef。停止確認後に分岐。元Branch・main・Productionは変更していない。

## 統合内容

- 本体表示に人物トリミング、Header、スクロール下部、丸属性、3勝資格、CTA、専用背景・アイコン・桜装飾を接続。
- 本体実操作で見つかった戦闘結果→一覧の誤復帰を修正。出撃元IDを保持して同じ詳細へ復帰。
- 25ボス／85出現組合せ、侵攻5城×12段階、正式個体・技能・報酬・PlayerEXPへ接続。既存開催snapshot・開始済みbattleは再計算しない。
- 新規侵攻開催は12段階をsnapshot固定。開始段階精算、3勝資格、報酬非遡及、突破済み段階への再挑戦、同時主催1件を実装。
- 素材17点は専用新規候補。GAME03・別用途・未使用SSRサンプルは割当てていない。未承認であることを保持。

## dev変更

- 対象は lrgyllgzcdcphlbmkknc のみ。開始時API v13のbundleとGitの一致を確認してからv14を配信。
- migrations: game04_raid_formal_host_20260923 / game04_raid_formal_player_exp_20260923。
- scripts/game04_raid_formal_master.sql を適用。PlayerEXP guardは正式raid snapshotの版・勝利EXP一致を条件に限定拡張。
- 元の16開催はMaster/API適用前後で同一md5: 3963366812c8a6b49b9037cce1635462。
- bundle SHA256等は [deployment.json](deployment.json)。resolve-battleは変更していない。

## 検証

| 範囲 | 結果と限界 |
|---|---|
| Build / typecheck | Preview build成功、型検査成功。視覚・機能受入の代用にはしていない。 |
| 正式Master | 25／85、5城×12段階×3抽選、技能値、固定編成、共有HP・報酬を自動照合。 |
| ドメイン | 勝敗、資格、再読込、battle/claim再実行、救援上限、期限・満員・不足・退出、侵攻12段階と旧段階精算・非遡及を検証。 |
| 実API | 正式ERB01の敗北・連勝・救援・資格・討伐・履歴・受取・再読込・同一要求再実行・別要求二重受取拒否を確認。[結果](live-api-results.json) |
| 実API境界 | 期限切れ、満員、退出後参加／出撃、不足、正式安土12段階開催、開催要求再実行、主催上限を確認。[結果](live-boundary-results.json) |
| 本体表示 | 同一固定Previewの一覧・詳細先頭・同じ詳細下部を画像読込完了後に撮影。1363×936pxのみ。[比較](visual-comparison.md) |
| 本体通し操作 | 最終237c1562同一Previewで参加→4戦4勝→毎回同じ詳細へ復帰→3勝資格→討伐→再読込→終了履歴→報酬受取→受取済み無効化。DOM証跡はui-evidence.json。詳細復帰修正前の失敗は成功に数えない。 |

検証準備：専用QAアカウントの初期N編成を正式成長値のLv50へ設定し、正式ERB01の新規開催を用意。敵HP6500／共有HP39000／正式報酬は無改変。操作途中の行動力補充なし。Lvアップ全回復は正式機能。これは正式Master接続の操作検証であり、自然育成・クエスト確率発生・戦闘バランスの受入とは区別する。境界テストの満員／期限切れは専用初期状態を設定し、終了後expire済み。

## 残件と判断対象

1. **指定390px／1536pxの本体撮影・照合は未実施。** 現ブラウザーAPIにはviewport変更機能がなく、既定1363pxでの検証。旧SHAの画像や画像縮小を指定幅の証拠にしていない。
2. **新規素材17点は未承認候補。** [一括対応表](../../design/raid/2026-09-23/WORK_ASSET_MAPPING.md)・[manifest](../../design/raid/2026-09-23/WORK_ASSET_MANIFEST.json)。新背景・9アイコン・6丸属性・桜パネル装飾。完全な画素一致・素材承認済みとはしていない。
3. **4城の主催条件・EXPは未承認で開催不可。** 正本authority第68行相当とnumeric第5章が補完案の自動FIXを禁止。ユーザー指示は作業分担・提出方式の優先であり、この数値案の採用指示とは解釈していない。既存安土Lv1／EXP100を保持。下記は一括判断用の既存提案で、適用値ではない。
4. **侵攻12段階の実API連続討伐・全報酬受取は未検証。** Master／ドメイン遷移・本番と同じdev開催APIまでは確認。

| 城 | numeric第5章の主催Lv案 | 主催者クリアEXP案 |
|---|---:|---:|
| 岡崎 | 1 | 100 |
| 長浜 | 2 | 150 |
| 春日山 | 4 | 250 |
| 躑躅ヶ崎館 | 6 | 400 |
| 安土 | 8 | 600 |

同章の機能解放案は通常3-5初回クリア、侵攻令1枚、初期主催Lv1/EXP0。主催Lv上限10・次Lv=現在Lv×100。個体差や敵表の承認を根拠に、これらを自動採用していない。

正式ID／人物／数値／素材識別子対応：[formal-master-mapping.md](formal-master-mapping.md)。本体画像と承認モック：[comparison.html](comparison.html)。

## 検証用データの識別

本体最終確認: RQAWALL (`125d6b0d-0b4a-40dd-ba80-ee64bf3690e4`)、正式ERB01開催 `d8fbc5f0-ce83-407e-95b4-2b1e3c99fc51`。既存QA前候補RQAWEND等は証跡のため保持し、一般プレイヤー資産へ変更しない。正式安土のAPI開催確認 `f4a0896a-c777-42e0-b180-3982ea3d7397` はQA主催者RQAWGstの開催。

最終本体では累計貢献41,298、4勝、討伐成功、銭14,600→討伐報酬受取後19,600を確認。素材一括表示：[asset-review.html](asset-review.html)。
