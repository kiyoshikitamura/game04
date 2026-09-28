# GAME04 v2 キャラ・スキル接続記録（2026-09-20）

正本：`docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md` 本文を優先。

## 版・保持方針

- 検証マスター版：`PREVIEW_PROVISIONAL_BALANCE_V2_20260920`。戦闘ルール版：`balance-v2-20260920`。
- R20/SR15/SSR10の45体は付録BのID・名称・sourceレア・属性・役割・パッシブ型を照合。旧runtimeレアを新基準にしない。
- N15体の固有パッシブはなし。属性・役割は既存仮値を保持し、正式化しない。
- 覚醒0〜5 → パッシブLv0/2/4/6/8/10。効果量は本文のレア別最大値×[0.4+0.6×(Lv/10)^1.3]（検証用）。
- 攻撃型HP/DEFとATK基準点を保存。`role`に「攻撃」を含み「支援」を含まない役割のみ基準値を適用する検証接続。基準点間の線形補間・この役割群への共通適用は検証用であり正式な個体/役割能力承認ではない。覚醒+4/+5のHP/ATK/DEF二重加算なし。他役割の本体能力・LUK・SP・装備成長は従来仮値を保持。
- `COMMON_CHARACTER_MASTERS`、`COMMON_BATTLE_RULES`、旧スキル・旧成長関数を保存。旧開始戦闘/開催時snapshotは元ルールのparty生成を維持する。
- 72件は独立したQA候補ID。所有中の旧ID・獲得台帳・ガチャPool・報酬IDを書き換えない。旧スキルを72件へ推測割当しない。

## 72件と792行

`generate_game04_balance_v2.py`は正本から45割当・72件endpoint・792行表示表を抽出し、件数・名称ID一致・全LBの表丸めを検証する。
ランタイムはendpointから `A+(B-A)*(LB/10)^1.25` を計算し中間丸めなし。SP軽減対象のみ同曲線でSPを切り上げ、BURSTはその半分を切り上げる。表の小数2桁を再計算の入力にしない。

## ID対応台帳

全件の正式な旧ID対応・画像対応は未確定。下記はQAのみ。付録Cの名称例（火走り、水断、天嵐一閃、薙ぎ払い）は名称の参考情報として保持するが、既存所持IDとの同一性を決定する根拠にしない。

| 設計ID | QA専用ID | 仮称 | 旧所持ID | 画像 |
|---|---|---|---|---|
| SKD001 | `qa_balance_v2_skd001` | 低消費単体攻撃・火 | 未対応・置換なし | Placeholder |
| SKD002 | `qa_balance_v2_skd002` | 低消費単体攻撃・水 | 未対応・置換なし | Placeholder |
| SKD003 | `qa_balance_v2_skd003` | 低消費単体攻撃・土 | 未対応・置換なし | Placeholder |
| SKD004 | `qa_balance_v2_skd004` | 低消費単体攻撃・風 | 未対応・置換なし | Placeholder |
| SKD005 | `qa_balance_v2_skd005` | 低消費単体攻撃・光 | 未対応・置換なし | Placeholder |
| SKD006 | `qa_balance_v2_skd006` | 低消費単体攻撃・闇 | 未対応・置換なし | Placeholder |
| SKD007 | `qa_balance_v2_skd007` | 標準単体攻撃・火 | 未対応・置換なし | Placeholder |
| SKD008 | `qa_balance_v2_skd008` | 標準単体攻撃・水 | 未対応・置換なし | Placeholder |
| SKD009 | `qa_balance_v2_skd009` | 標準単体攻撃・土 | 未対応・置換なし | Placeholder |
| SKD010 | `qa_balance_v2_skd010` | 標準単体攻撃・風 | 未対応・置換なし | Placeholder |
| SKD011 | `qa_balance_v2_skd011` | 標準単体攻撃・光 | 未対応・置換なし | Placeholder |
| SKD012 | `qa_balance_v2_skd012` | 標準単体攻撃・闇 | 未対応・置換なし | Placeholder |
| SKD013 | `qa_balance_v2_skd013` | 高威力単体攻撃・火 | 未対応・置換なし | Placeholder |
| SKD014 | `qa_balance_v2_skd014` | 高威力単体攻撃・水 | 未対応・置換なし | Placeholder |
| SKD015 | `qa_balance_v2_skd015` | 高威力単体攻撃・土 | 未対応・置換なし | Placeholder |
| SKD016 | `qa_balance_v2_skd016` | 高威力単体攻撃・風 | 未対応・置換なし | Placeholder |
| SKD017 | `qa_balance_v2_skd017` | 高威力単体攻撃・光 | 未対応・置換なし | Placeholder |
| SKD018 | `qa_balance_v2_skd018` | 高威力単体攻撃・闇 | 未対応・置換なし | Placeholder |
| SKD019 | `qa_balance_v2_skd019` | 全体攻撃・火 | 未対応・置換なし | Placeholder |
| SKD020 | `qa_balance_v2_skd020` | 全体攻撃・水 | 未対応・置換なし | Placeholder |
| SKD021 | `qa_balance_v2_skd021` | 全体攻撃・土 | 未対応・置換なし | Placeholder |
| SKD022 | `qa_balance_v2_skd022` | 全体攻撃・風 | 未対応・置換なし | Placeholder |
| SKD023 | `qa_balance_v2_skd023` | 全体攻撃・光 | 未対応・置換なし | Placeholder |
| SKD024 | `qa_balance_v2_skd024` | 全体攻撃・闇 | 未対応・置換なし | Placeholder |
| SKD025 | `qa_balance_v2_skd025` | 紅蓮の大計 | 未対応・置換なし | Placeholder |
| SKD026 | `qa_balance_v2_skd026` | 後陣射ち | 未対応・置換なし | Placeholder |
| SKD027 | `qa_balance_v2_skd027` | 追い討ち | 未対応・置換なし | Placeholder |
| SKD028 | `qa_balance_v2_skd028` | 崩し討ち | 未対応・置換なし | Placeholder |
| SKD029 | `qa_balance_v2_skd029` | 毒刃 | 未対応・置換なし | Placeholder |
| SKD030 | `qa_balance_v2_skd030` | 蝕み討ち | 未対応・置換なし | Placeholder |
| SKD031 | `qa_balance_v2_skd031` | 背水斬り | 未対応・置換なし | Placeholder |
| SKD032 | `qa_balance_v2_skd032` | 影縫い | 未対応・置換なし | Placeholder |
| SKD033 | `qa_balance_v2_skd033` | 気合 | 未対応・置換なし | Placeholder |
| SKD034 | `qa_balance_v2_skd034` | 身構え | 未対応・置換なし | Placeholder |
| SKD035 | `qa_balance_v2_skd035` | 鬨の声 | 未対応・置換なし | Placeholder |
| SKD036 | `qa_balance_v2_skd036` | 守りの陣 | 未対応・置換なし | Placeholder |
| SKD037 | `qa_balance_v2_skd037` | 威圧 | 未対応・置換なし | Placeholder |
| SKD038 | `qa_balance_v2_skd038` | 鎧砕き | 未対応・置換なし | Placeholder |
| SKD039 | `qa_balance_v2_skd039` | 応急手当 | 未対応・置換なし | Placeholder |
| SKD040 | `qa_balance_v2_skd040` | 治癒の祈り | 未対応・置換なし | Placeholder |
| SKD041 | `qa_balance_v2_skd041` | 小休止 | 未対応・置換なし | Placeholder |
| SKD042 | `qa_balance_v2_skd042` | 慈愛の大祈祷 | 未対応・置換なし | Placeholder |
| SKD043 | `qa_balance_v2_skd043` | 再生の祈り | 未対応・置換なし | Placeholder |
| SKD044 | `qa_balance_v2_skd044` | 蘇生の祈り | 未対応・置換なし | Placeholder |
| SKD045 | `qa_balance_v2_skd045` | 護身障壁 | 未対応・置換なし | Placeholder |
| SKD046 | `qa_balance_v2_skd046` | 守護の札 | 未対応・置換なし | Placeholder |
| SKD047 | `qa_balance_v2_skd047` | 結界の陣 | 未対応・置換なし | Placeholder |
| SKD048 | `qa_balance_v2_skd048` | 挑発 | 未対応・置換なし | Placeholder |
| SKD049 | `qa_balance_v2_skd049` | 返し刃 | 未対応・置換なし | Placeholder |
| SKD050 | `qa_balance_v2_skd050` | 迎撃の構え | 未対応・置換なし | Placeholder |
| SKD051 | `qa_balance_v2_skd051` | 破勢 | 未対応・置換なし | Placeholder |
| SKD052 | `qa_balance_v2_skd052` | 破護 | 未対応・置換なし | Placeholder |
| SKD053 | `qa_balance_v2_skd053` | 奮起 | 未対応・置換なし | Placeholder |
| SKD054 | `qa_balance_v2_skd054` | 浄毒 | 未対応・置換なし | Placeholder |
| SKD055 | `qa_balance_v2_skd055` | 解縛 | 未対応・置換なし | Placeholder |
| SKD056 | `qa_balance_v2_skd056` | 破陣撃 | 未対応・置換なし | Placeholder |
| SKD057 | `qa_balance_v2_skd057` | 後陣崩し | 未対応・置換なし | Placeholder |
| SKD058 | `qa_balance_v2_skd058` | 蝕みの陣 | 未対応・置換なし | Placeholder |
| SKD059 | `qa_balance_v2_skd059` | 崩陣の波 | 未対応・置換なし | Placeholder |
| SKD060 | `qa_balance_v2_skd060` | 背水の薙ぎ | 未対応・置換なし | Placeholder |
| SKD061 | `qa_balance_v2_skd061` | 奮戦の檄 | 未対応・置換なし | Placeholder |
| SKD062 | `qa_balance_v2_skd062` | 堅守の札 | 未対応・置換なし | Placeholder |
| SKD063 | `qa_balance_v2_skd063` | 破甲の陣 | 未対応・置換なし | Placeholder |
| SKD064 | `qa_balance_v2_skd064` | 威圧の陣 | 未対応・置換なし | Placeholder |
| SKD065 | `qa_balance_v2_skd065` | 封陣 | 未対応・置換なし | Placeholder |
| SKD066 | `qa_balance_v2_skd066` | 軍神の号令 | 未対応・置換なし | Placeholder |
| SKD067 | `qa_balance_v2_skd067` | 再生の陣 | 未対応・置換なし | Placeholder |
| SKD068 | `qa_balance_v2_skd068` | 救護の札 | 未対応・置換なし | Placeholder |
| SKD069 | `qa_balance_v2_skd069` | 返しの号令 | 未対応・置換なし | Placeholder |
| SKD070 | `qa_balance_v2_skd070` | 清めの手当 | 未対応・置換なし | Placeholder |
| SKD071 | `qa_balance_v2_skd071` | 大祓い | 未対応・置換なし | Placeholder |
| SKD072 | `qa_balance_v2_skd072` | 破勢の一閃 | 未対応・置換なし | Placeholder |

## 未決・今回の範囲外

正式スキル名/画像/既存ID対応、最終排出Pool、正式能力・成長・経済、敵被弾SP量。既存旧スキルの未定義SP効果などは引き続き保留。72件を所有データへ自動付与しない。
SKD001〜018・028〜031の「先頭敵」は固有指定か汎用デフォルトか未決。`getBalanceV2Skill`の第3引数 `firstTargetMode: fixed | default` で双方を比較可能。既定fixedは検証用仮解釈として説明へ明記。再現：後列に被弾誘導者がいる場合、fixedは先頭、defaultは誘導者を攻撃。SKD056/072の固定先頭狙いは本文・付録Cで明示されている。
