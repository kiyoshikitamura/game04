# GAME04 Work統合記録 — 2026-09-23

**最終87161e3のPreviewはREADY。390px／1536px・本体3状態の比較PASS、API v16の正式入力77戦・協力12段階完走・境界7件・初期N編成の実敗北を確認済み。素材17点・主催方針仮FIXは採用適用済み。最終本体も参加→4戦4勝→同一詳細復帰→3勝資格→再読込→終了履歴→報酬受取・二重操作防止まで確認済み。**

## 最新の固定実装・証拠

| 項目 | 現在値 |
|---|---|
| Repository | `kiyoshikitamura/game04` |
| 実装Branch | `work/game04-raid-formal-input-20260923` |
| 実装SHA | [`87161e39388cb73338adbaae6cf81f7c3d34ca50`](https://github.com/kiyoshikitamura/game04/commit/87161e39388cb73338adbaae6cf81f7c3d34ca50) |
| 固定Preview | [https://game04-jsmckf7gy-kiyoshi-kitamura.vercel.app](https://game04-jsmckf7gy-kiyoshi-kitamura.vercel.app) |
| Deployment | `dpl_3FccssN2pxXVvtdbnp8h5TVErmaS` ／ READY |
| dev API | `game04-redesign-api v16` ／ `lrgyllgzcdcphlbmkknc` |
| 初回追加検証Branch | `work/game04-raid-invasion-evidence-20260923` |
| 初回追加検証SHA | [`7203f76071d23a82966beab8b214940c493e2d79`](https://github.com/kiyoshikitamura/game04/commit/7203f76071d23a82966beab8b214940c493e2d79) |

過去の途中検証は [remaining-verification-20260923.md](remaining-verification-20260923.md)、初回侵攻実API証拠は [invasion-live-results.json](invasion-live-results.json)。最新結果は本書の確認済み表を参照。追加検証SHAは初期行動力1000の検証証拠の保存先であり、最新実装SHAとは区別する。行動力50からの後続検証は [natural-invasion-live.json](natural-invasion-live.json) と [natural-rescue-live.json](natural-rescue-live.json) に記録。最終証拠は本書と同じGit commitに一式保存。

## 現在の採用・適用状態

- 新規素材17点はユーザーが一括採用済み。背景の今後追加も可能。旧記録・制作時manifestの「未承認候補」は当時の履歴であり、現在の承認状態には適用しない。[素材対応表](../../design/raid/2026-09-23/WORK_ASSET_MAPPING.md)／[manifest](../../design/raid/2026-09-23/WORK_ASSET_MANIFEST.json)／[一括表示](asset-review.html)。
- 主催条件・主催者EXPはユーザーが仮FIX採用し、dev DB・API v15へ適用済み。後日正式レベルデザイン予定。侵攻専用の主催者EXPであり、プレイヤーEXPとは別。主催者Lv上昇による行動力回復はない。
- 仮FIX版は `GAME04_TERRITORY_HOST_PROVISIONAL_20260923`。[採用仕様](../../product/GAME04_RAID_HOST_POLICY_PROVISIONAL_2026-09-23.md)／[独立検証・dev適用記録](../GAME04_TERRITORY_POLICY_2026-09-23.md)／[実API結果](host-policy-live.json)。既存開催snapshot・開始済み戦闘・既存資産を保持。
- 25ボス／85出現組合せ、侵攻5城×12段階、正式個体・技能・報酬を本体経路へ接続。[正式対応表](formal-master-mapping.md)。人物・Header・同一詳細のスクロール下部・丸属性・3勝資格・CTA・背景・装飾を接続済み。最終の指定2幅・6状態比較は確認済み。
- 新規戦闘入力の全60体のHP／ATK／DEF／LUKを、numericの承認基準点・役割・個体差へ接続。SPは旧値保持。開始済み戦闘の保存入力は変更しない。装備・能動スキルの計算経路は今回変更していない。API v16へ配信済み。
- Production公開、Production DB変更、mainマージは実施していない。

| 城 | 採用済み主催者Lv | 最終クリア主催者EXP |
|---|---:|---:|
| 岡崎 | 1 | 100 |
| 長浜 | 2 | 150 |
| 春日山 | 4 | 250 |
| 躑躅ヶ崎館 | 6 | 400 |
| 安土 | 8 | 600 |

通常3-5（`mino-5`）初回クリアで主催・救援参加を解放し、侵攻令1枚を一度付与。初期主催者Lv1／EXP0、上限Lv10、次Lv必要EXP＝現在Lv×100。同時主催1件。令は開催成立時に1枚消費し、救援参加では不要。主催者EXPは同開催3勝資格を満たす主催者へ最終討伐時に一度付与する。

## 確認済み結果と条件

| 検証 | 結果・適用範囲 |
|---|---|
| 主催仮FIXの実API | 未解放開催・救援参加拒否、岡崎開催、安土の主催Lv拒否、令1枚消費、同要求再送の増殖・追加消費なし、同時主催1件を確認。令付与は再保存で増えない。適用前後24既存開催のchecksum一致。 |
| 初回侵攻12段階（行動力1000） | API v15で岡崎城を33戦（突破済み段階への再挑戦1戦を含む）で最終討伐。保存された正式敵・共有HP・報酬は無改変。主催者EXP0→100、主催者Lv1→2、通常プレイヤーEXP不変。 |
| 初回侵攻の再読込・重複防止 | 侵攻の同request再送、突破済み段階再挑戦で現在段階HP不変、途中段階で主催者EXP不増、再読込、報酬二重受取時の資産不増を確認。 |
| 初回侵攻の検証条件 | 使い捨てQA `RQAPolA` にSR5人Lv100／覚醒5、装備・能動スキルなし、**初期行動力1000**を準備。操作途中の補充なし、最終340。通常の育成・行動力条件による受入、ブラウザでの33戦通し操作、成長表の全面一致を証明する結果ではない。 |
| 主催仮FIX版Preview本体表示 | `a21a589`／[固定Preview](https://game04-g0toxzgha-kiyoshi-kitamura.vercel.app)／`dpl_Gfi2yYveznoKT72eX43tshmypC51` の同一Previewの一覧・詳細先頭・同じ詳細のスクロール下部を、画像読込完了後に1363×936pxで撮影。`body/raid-policy-{list,detail,lower}.jpg`。主催画面は `body/raid-policy-host.jpg`。重大な重なり・Header／Footerによる隠れなしを目視確認。完全一致判定ではない。 |
| 行動力50からの単独試行 | 主催者は行動力50・プレイヤーLv1／EXP0・主催者EXP100で開始。レイド26戦＋クエスト47戦、正式クエスト報酬のLvアップ回復合計480。手動補充なし。第12段階HP436,659の時点で通常クエスト9-1に3敗し、行動力8で停止。`natural-invasion-live.json` の `status: failed` と停止履歴を保持し、単独完走とはしない。 |
| 同一開催の救援継続 | 開催 `0323de19-dd7d-413a-b8b2-ac1c6c658028` を継続。主催者が救援し、helperB（開始50）・helperOwner（開始41）が各2戦。行動力のDB補充なし、侵攻令の追加消費なし。同じ第12段階を討伐し、主催者EXP100→200。救援者へ主催者EXP・プレイヤーEXPなし。 |
| 協力討伐後の精算 | `natural-rescue-live.json` はPASS。主催者の討伐報酬受取→同要求再受取→再読込で資産・EXP不増を確認。各2勝の救援者は3勝資格未達のため討伐報酬なし。最終主催者行動力9・主催者26勝、救援4戦。 |
| 協力検証の前提 | SR5人Lv100／覚醒5へ事前育成したQA編成、装備・能動スキルなし、主催解放済みを前提とする。通常上限内の行動力と正式回復・協力APIの通し検証であり、新規プレイヤーの自然育成・単独完走・ブラウザ全戦操作・戦闘バランスの受入ではない。統合担当のDB保存入力監査で、対象77戦すべてがAPI v16の正式能力値入力を使用して精算済みと確認。 |
| 正式入力のDB監査 | 統合担当が対象77戦（レイド26＋クエスト47＋救援4）の保存入力をDBで確認。`saved=77`、`settled=77`、`formal_naoe_input=77`。編成中の直江兼続は全77件でATK `7766.25`／LUK `30`。最初の開始 `2026-09-23T15:29:48.889604Z`、最後の開始 `2026-09-23T15:37:51.069338Z`。自然行動力・救援の通し実行がAPI v16の正式能力値入力を使ったことを確認済み。[DB監査結果](natural-formal-input-audit.json)。 |
| 指定幅の実寸本体撮影 | 最終 `87161e3` の同一Previewで390×844／1536×936の各3状態PASS。実API本体 `/` をiframe内に実寸表示し、画像読込後に撮影。390px下部の86px余白を含む差分を修正・再比較済み。fixture・拡縮画像を証拠にしていない。[比較記録](final-visual-comparison.md)／[6状態比較HTML](final-comparison.html)。厳密な画素一致は主張しない。 |
| 最新API境界7件 | API v16で期限切れ、満員、退出後参加、退出後出撃、行動力不足、不足時のHP／試行数／行動力不変、参加／救援の同request再送を全件PASS。[結果](final-boundary-live.json)。専用開催の初期境界状態を用意し、既存プレイヤーの資産・行動力は保持。 |
| 未改変初期N編成の実敗北 | 新規匿名QAのN5人Lv1・覚醒0・初期資源を無改変で正式ERB01と実戦。敗北、0勝・資格なし、行動力50→30、同request再送で追加消費・試行数・報酬増なし、再読込保持をPASS。[結果](final-loss-live.json)。敵・能力値・資源のDB変更なし。 |
| 最終本体通し操作 | 最終Preview・RQALastで正式N編成Lv50・行動力50から参加→4戦4勝、毎回同じ詳細へ復帰。3勝資格、累計42,659、討伐HP0。行動力50→30→Lv2全回復50→Lv3全回復50→30。ブラウザ再読込→終了履歴→未受取報酬1件→受取で銭14,600→19,600、受取待ち0件・ボタン無効化、受取後の再読込でも銭19,600と受取済み履歴を確認。[本体DOM証跡](final-ui-evidence.json)。操作途中の補充なし。 |
| 既検証エンカウント・境界 | 正式ERB01の参加・勝敗・資格・討伐・履歴・受取・二重処理、期限・満員・不足・退出・救援等の検証記録を保持。旧237c1562 Previewでの本体4戦通しは旧版の証拠であり、最新Previewで同じ全操作を再検証した証拠とは扱わない。 |

## 完了範囲と後工程

- **今回のレイド統合・指定幅比較・正式Master接続・通し操作の検証を完了。** 既存snapshot・開始済み戦闘・一般プレイヤー資産を保持。最終境界試験用の4開催だけを検証後に期限切れ化し、記録を保持。
- 指定390px／1536pxの6状態比較、素材採用、主催条件、API境界は未完了事項へ戻さない。
- 自然行動力での協力API通し・全77戦の正式入力は確認済み。単独試行3敗停止と救援継続の完走、事前育成済みQA条件を分けて保持する。自然育成・単独攻略難度・正式レベルデザインはユーザー指定の後工程であり、今回の追加承認事項・阻害条件にしない。
- dev行動力50上限・180秒回復と資料100・300秒の差は範囲注記として保持。今回のレイド修正で全体仕様を無断変更していない。

## 旧記録（当時の状態を保存・現在の判定には使用しない）

以下は旧237c1562／API v14を中心とした履歴と、主催仮FIX採用直後の追記を原文保存したもの。旧「素材未承認」「主催条件未承認」「侵攻12段階未検証」等は、この文書上部の現在値・検証条件で更新済み。旧Preview・SHA・QAアカウントは過去証拠の識別用。

### GAME04 Work統合記録 — 2026-09-23

**完成受入前。主催条件・指定画面幅等の未検証を残す。**

追記（2026-09-23）：新規素材17点はユーザーが一括採用。背景の今後追加も可能。以下の素材「未承認」は検証時点の履歴で、この追記を優先する。主催EXP案はユーザーから用途の質問を受けた段階で、採用は未確定。侵攻専用の主催者Lv用EXPであり、プレイヤーEXPとは別。

#### 固定実装

- Repository: kiyoshikitamura/game04
- Branch: work/game04-raid-completion-20260923
- 実装SHA: 237c1562d47275f02fb3274c8aacfdb1358409b3
- Preview: https://game04-oupgp18ej-kiyoshi-kitamura.vercel.app
- Deployment: dpl_CDmCYMqh3Dib3PY6szh7ZHXBxcQN
- 引継元: 5963698663e96bfa909c0cbb3b7c45c5db21f2ef。停止確認後に分岐。元Branch・main・Productionは変更していない。

#### 統合内容

- 本体表示に人物トリミング、Header、スクロール下部、丸属性、3勝資格、CTA、専用背景・アイコン・桜装飾を接続。
- 本体実操作で見つかった戦闘結果→一覧の誤復帰を修正。出撃元IDを保持して同じ詳細へ復帰。
- 25ボス／85出現組合せ、侵攻5城×12段階、正式個体・技能・報酬・PlayerEXPへ接続。既存開催snapshot・開始済みbattleは再計算しない。
- 新規侵攻開催は12段階をsnapshot固定。開始段階精算、3勝資格、報酬非遡及、突破済み段階への再挑戦、同時主催1件を実装。
- 素材17点は専用新規候補。GAME03・別用途・未使用SSRサンプルは割当てていない。未承認であることを保持。

#### dev変更

- 対象は lrgyllgzcdcphlbmkknc のみ。開始時API v13のbundleとGitの一致を確認してからv14を配信。
- migrations: game04_raid_formal_host_20260923 / game04_raid_formal_player_exp_20260923。
- scripts/game04_raid_formal_master.sql を適用。PlayerEXP guardは正式raid snapshotの版・勝利EXP一致を条件に限定拡張。
- 元の16開催はMaster/API適用前後で同一md5: 3963366812c8a6b49b9037cce1635462。
- bundle SHA256等は [deployment.json](deployment.json)。resolve-battleは変更していない。

#### 検証

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

#### 残件と判断対象

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

#### 検証用データの識別

本体最終確認: RQAWALL (`125d6b0d-0b4a-40dd-ba80-ee64bf3690e4`)、正式ERB01開催 `d8fbc5f0-ce83-407e-95b4-2b1e3c99fc51`。既存QA前候補RQAWEND等は証跡のため保持し、一般プレイヤー資産へ変更しない。正式安土のAPI開催確認 `f4a0896a-c777-42e0-b180-3982ea3d7397` はQA主催者RQAWGstの開催。

最終本体では累計貢献41,298、4勝、討伐成功、銭14,600→討伐報酬受取後19,600を確認。素材一括表示：[asset-review.html](asset-review.html)。

#### 2026-09-23 主催方針の仮FIX採用・適用

ユーザー採用により主催条件の未承認残件を解消。後日正式レベルデザイン予定。API v15、新規開催はGAME04_TERRITORY_HOST_PROVISIONAL_20260923。旧開催snapshot保持。採用値はdocs/product/GAME04_RAID_HOST_POLICY_PROVISIONAL_2026-09-23.md、今回の限定検証は../GAME04_TERRITORY_POLICY_2026-09-23.mdを参照。旧記録の未承認記述は履歴。
