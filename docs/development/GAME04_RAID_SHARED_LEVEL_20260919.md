# M5-06 Unlock Raid共有Lv参加への変更

## 実装

- 個人Checkpointによる戦闘拒否と画面のCheckpoint・追い付き案内を削除。
- Raid Masterの見た目段階を`appearanceLevels`へ分離。Lv1 / 10 / 20の既存仮素材切替を保持。
- 新規参加者に個人Checkpointを保存しない。既存JSONに残る旧`checkpoint`は参照せず、そのまま読み込める。
- `joinedLevel`は参加前Lv報酬の除外に必要なため保持。
- Raid全体3勝資格、資格取得前Lvの非遡及、勝利加算、個別HPと共有HPの分離、開始済み旧Lvの精算を保持。
- 勝利倍率1.5および既存成長率・報酬量は従来の仮Master値を維持。正式値の確定ではない。

## ローカル検証

`scripts/verify_game04_raid_shared_level.mjs`をesbuildでNode向けにbundleして実行。

- 共有Lv14へ途中参加でき、生成敵Lv14でBattleコアのWIN / LOSE成立（検証用の強弱パーティ使用）。
- 旧checkpoint=10を含む保存データでもLv14で精算可能。
- 2勝時Lv14討伐では討伐報酬なし。旧Lvの進行中戦闘で3勝に到達してもLv14報酬なし。
- 他戦闘でLv15へ更新後にLv14結果を確定しても、新共有HPを減らさない。
- Lv15新規敵のHP・ATK上昇。
- 資格取得後のLv15討伐報酬だけ付与。結果再送・受取再送で二重加算なし。
- 見た目段階Lv1 / 10 / 20の切替を保持。

## 検証境界

このスクリプトは純関数とBattleコアのローカル検証。DBロック・実APIの多人数同時処理・全Lvバランス・Preview画面の受入を意味しない。Edge sourceの旧制限除去、配信用bundle再生成、DB Master更新、Preview反映は親統合工程で別管理。
