# GAME04 / 戦国姫艶武
# バトルUI 最新仕様正本
更新日: 2026-09-21
状態: LATEST BATTLE UI AUTHORITY

本書は2026-09-21時点の最新Battle仕様に対応したUI要件だけを記載する。旧9/19 UI正本の競合記述は本書で置き換える。
Battle Ruleは `docs/product/GAME04_BATTLE_AUTHORITY_LATEST_2026-09-21.md` を最優先とする。

## 1. UI原則
- 縦画面。
- 完全Auto。通常攻撃 / Skill / Target / BURSTの手動操作UIを置かない。
- 「敵の状態 / Party状態 / 共通SP / バーストゲージ / 行動中の出来事」を短時間で把握できることを優先。
- 常時情報は絞り、詳細はTap詳細 / Resultへ回す。
- Character愛着とBossの強敵感を損なわない。
- 演出追加でBattle Ruleを変更しない。

## 2. 画面4領域
1. Header
2. Enemy Zone
3. 共通SP / バーストゲージ Zone
4. Player Party Zone

常設Battle Logは置かない。

## 3. Header
常時:
- WAVE
- 倍速
- 一時停止
- 残り行動数（300行動上限の確認）
- Raid時のみRaid Boss共通HP

AUTO表示は必須ではない。
手動攻撃 / Skill / Target / BURST Buttonは置かない。

## 4. Enemy Zone
Enemy最大3体。各Enemyに:
- Enemy名
- Lv
- 属性
- HP Bar
- Action Count
- 必要最小限の状態Icon

Enemy立ち絵は大きく表示。Boss / 主敵は強く見える表現可。
Action CountはEnemy別Master値で、3固定ではない。
Enemy SPは常時主要表示にせずTap詳細へ回す。

状態IconはDebuffだけでなく、Shield / DOT / HOT / 被弾誘導 / 反撃 / 行動不能 / Buff等、現在Battle Rule上意味のある状態を識別できること。

## 5. 共通SP / バーストゲージ Zone
### 共通SP
- SP Gauge
- 現在値
- 最大400
を常時表示。

### バーストゲージ
共通SPとは**別Gauge**として常設。
- 0〜200
- 通常時は控えめ
- 200到達時は満タン状態を明確化
- 次の行動可能Characterの行動開始時に自動抽選されることを前提とする
- 抽選成功/失敗後は0へ戻る
- ユーザーがTapして発動する見た目にしない

### BURST発動
- 発動Characterを明確に強調
- 通常Battleとの差を明確にする
- 最大5行動の連続感を演出する
- 同一Skill連続使用を許容する演出構造
- BURST中はSP/Gauge獲得がないRuleと表示を矛盾させない
- BURSTは主要爽快感Pointとして扱うが操作CTAは置かない

旧「SP満タンでBURST抽選」は廃止。SP400とBurst Gauge200を混同しない。

## 6. Player Party Zone
最大5Character。各Characterに常時:
- 行動順番号
- Character名
- Lv
- 属性
- HP Bar
- 最大3Skill Icon
- 必要最小限の状態Icon
- 現在行動中の強調

常時表示しない:
- ATK / DEF / LUK詳細値
- Equipment
- Passive全文
- Skill説明全文

## 7. Skill Icon
最大3Skillは優先枠1→2→3の順が視覚的に分かること。
区別可能な状態:
- 発動可能
- SP不足
- 条件未達
- 発動中

Skill名 / 消費SP / 発動条件 / 説明全文はTap詳細へ。
「高SP Skill優先」と誤認させない。

## 8. 一時表示
発生時のみ:
- Damage
- 回復
- WEAK
- RESIST
- SP増減
- バーストゲージ変化（必要な範囲）
- Buff / Debuff
- Shield
- DOT / HOT
- 反撃
- 行動不能
- 解除
- 蘇生 / 死亡時効果
- BURST
- Skill名
- Enemy Action開始
- Boss Phase移行

**CRITICALは初期ローンチ不採用のため表示対象から削除。**

表示はBattle計算結果と一致させる。演出多段の表示Damage合計は確定総Damageと一致させる。

## 9. Tap詳細
Enemy:
- 詳細HP
- 個別SP
- 状態 / Buff / Debuff
- Shield / DOT / HOT / 反撃等
- 次Action情報
- 攻略に必要な情報

Character:
- Passive
- Skill名
- 消費SP
- 発動条件
- Skill優先順
- 状態詳細

## 10. Wave / Enemy割込み / Boss Phase
- Wave移行時に味方HP / 戦闘不能 / 共通SP / Burst Gauge / 継続状態が引き継がれるため、UI上で不自然にReset表示しない。
- Enemy Count 0の割込みを視認可能にする。
- Enemy連続Skill行動は一つのEnemy Action blockとして認識できつつ、各Skill実行は個別に見えること。
- Boss Phase移行は強敵感のある明確な演出を許容するが、HP/SP/状態/残Countを勝手にResetしない。

## 11. Resultへ回す情報
Battle中に常設しない:
- Battle Log
- Equipment情報
- ATK / DEF / LUK詳細
- Skill全文
- Passive全文
- 詳細計算
- 詳細分析

Result / 詳細では、攻略の答え合わせができる情報を表示可能とする。

## 12. 表示優先順位
1. Enemy HP / Action Count
2. Party HP
3. 共通SP
4. バーストゲージ / BURST状態
5. 現在行動Character
6. Skill発動結果
7. 状態変化
8. 残り行動数

## 13. Visual方向
- 戦国女性武将の世界観。
- Enemyを上部で大きく見せる。
- Characterを下部に5人。
- Enemy / Character名・Lvを表示。
- SPとBurst Gaugeは別資源として中央領域で明確に区別。
- BURST通常時は控えめ、満タン/抽選/発動を段階的に表現。
- Battle中の任意操作Buttonなし。

## 14. 禁止
- 通常攻撃Button
- Skill発動Button
- BURST / 奥義Button
- 手動Target
- 常設Battle Log
- Equipment常設
- 過剰な詳細Status
- Critical演出
- SP満タンをBURST条件として見せるUI
- Burst Gaugeを操作可能に見せるUI

## 15. Authority
最優先:
- `docs/product/GAME04_BATTLE_AUTHORITY_LATEST_2026-09-21.md`

付帯:
- `docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md`
- `docs/product/GAME04_SENGOKU_PLANNING_AUTHORITY_REDESIGN_2026-09-19.md`
- `docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`
- `docs/product/GAME04_SENGOKU_QUEST_UI_AUTHORITY_2026-09-19.md`
- `docs/product/GAME04_SENGOKU_RAID_UI_AUTHORITY_PROVISIONAL_2026-09-19.md`

旧 `GAME04_SENGOKU_BATTLE_UI_AUTHORITY_2026-09-19.md` は履歴資料とし、最新制作では本書を使用する。
