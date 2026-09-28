# GAME04 戦闘共通ルール v2 受入記録

対象：`common-v2-20260920`。最優先正本は `docs/product/GAME04_BALANCE_AUTHORITY_V1_2026-09-20.md` の戦闘共通ルール完成版。

この文書は戦闘処理の実装受入と、正式数値・バランス受入を分離する。検証スクリプト中の能力値、倍率、消費、回復式、付与確率はすべて **TEST_ONLY**。個別マスターの承認を意味しない。

## 自動検証

実行方法：

```sh
npm exec --offline --package=esbuild@0.25.0 -- esbuild scripts/verify_game04_battle_common_v2.mjs scripts/verify_game04_redesign_battle.mjs scripts/verify_game04_raid_shared_level.mjs scripts/verify_game04_territory.mjs --bundle --platform=node --format=esm --outdir=/tmp/game04-battle-tests
node /tmp/game04-battle-tests/verify_game04_battle_common_v2.js
node /tmp/game04-battle-tests/verify_game04_redesign_battle.js
node /tmp/game04-battle-tests/verify_game04_raid_shared_level.js
node /tmp/game04-battle-tests/verify_game04_territory.js
```

`verify_game04_redesign_battle.mjs` は旧版入力の互換検証。旧SP合算・高消費優先等を新仕様の受入根拠にはしない。

| 受入領域 | 検証方法 | 結果 |
| --- | --- | --- |
| ダメージ・属性・端数・最低1 | 既知seed、DEF実数減算、属性組合せ、最低値、対象別乱数、多段表示合計 | PASS（ローカル） |
| SP／独立ゲージ | LUK境界、SP400、開始0、SP溢れからゲージ加算 | PASS（ローカル） |
| BURST | 成功／失敗seed、通常行動置換、5回、半額切上げ、SP不足時通常攻撃、割込み後再開、途中行動不能で終了 | PASS（ローカル） |
| スキル・対象・回復 | 枠順、将来SPの先取り禁止、回復HP閾値、切捨て・HP上限、全体回復 | PASS（ローカル） |
| 効果・パッシブ | 独立元強度、合算上限、終了、再付与見送り、同ID最強、死亡による次点切替 | PASS（ローカル） |
| 行動不能 | 敵連続行動ブロックのスキップ、解除後の行動、満タンゲージ保持、強化持続保持 | PASS（ローカル） |
| 敵割込み | 設定順、4連続スキル、余計な通常攻撃なし、被弾SPのブロック終了後加算 | PASS（ローカル） |
| 死亡・蘇生 | 自動蘇生一度（Wave通算）、双方全滅敗北、同時死亡順、蘇生後の次順復帰、敵蘇生で連続行動中止 | PASS（ローカル） |
| フェーズ・複合効果 | 1行動1段階、残りカウント保持、SP上限縮小、DEF低下順、対象固定、スキル内パッシブ固定 | PASS（ローカル） |
| Wave・300行動 | 通算300回目勝利、未決着敗北、上限後割込みなし | PASS（ローカル） |
| 再現・結果再生 | 同じ入力・seedの完全一致、入力不変、フレーム資源範囲 | PASS（ローカル） |

2026-09-20 ローカル実行：24検証群と、旧バトル・共有Lv Raid・領土侵攻の3回帰スクリプトがPASS。 非有限能力値／パッシブ／フェーズ、未承認効果、回復式・付与率未指定、敵0消費、独立複数攻撃をエラーにする追加検証もPASS。分類を持つこと自体を全細則の網羅・実機受入とは扱わない。旧入力は保存した旧エンジンと結果全体を比較し、version未指定・legacy-v1の一致を確認。

## 既存接続の回帰範囲

- `verify_game04_raid_shared_level.mjs`：共有Lv14途中参加、個別WIN／LOSE、3勝資格、資格取得前報酬非遡及、旧Lv結果から新共通HPへの転用禁止、次Lv敵強化、同一戦闘再送・報酬再受取、見た目段階。
- `verify_game04_territory.mjs`：開催条件表示、開催時snapshot、不変ルール、枠解放等のドメイン検証。原子的開催と主催XP付与のDB／API試験は既存領土侵攻受入記録を参照。今回の変更だけで過去の全DB試験を再実施済みとはしない。
- Quest／Raidの出撃行動力消費、開始済み戦闘入力の保持、新旧版ルーティング、報酬二重受取防止はサーバー経路・開発環境確認を別に記録する。純粋なシミュレーター検証はDB排他の証明ではない。

## 開発環境・Preview

実装・Vercel配信SHA：`b8675e16c325166ae9ff1215eef2795c0017edc9`。型検査・Preview build成功。GAME04 dev `lrgyllgzcdcphlbmkknc` にMigration `20260920082351_game04_common_battle_v2_master.sql` とEdge version 7を適用。

- 実API：旧保存結果・旧開始済み入力の互換、新Quest同一要求の並行実行と再送、Raid WIN／LOSE、3勝資格・非遡及、旧Lv精算、次Lv敵強化、報酬受取再送を確認。専用QAルームの共有HP・Lvおよび保存済み開始入力は境界検証用に設定した。実多人数競合や全Lvバランスの証明とはしない。
- Preview：360px幅の代表画面でSP／ゲージ、BURST中断、スキル状態、300行動敗北、中央スクロール付き詳細ログを確認。正式な実機全画面受入は未実施。
- 証跡：`GAME04_BATTLE_COMMON_API_ACCEPTANCE_20260920.json`、配信・制限の詳細：`GAME04_BATTLE_COMMON_INTEGRATION_20260920.md`。
- 確認URL：<https://game04-git-codex-game04-upstream-20260918-kiyoshi-kitamura.vercel.app/qa/battle-common?scenario=interrupt&viewport=360>。

## 未受入

正式個別マスター、全Lvバランス、経済供給、正式な回復式・敵個別耐性、実機最終受入は対象外。
