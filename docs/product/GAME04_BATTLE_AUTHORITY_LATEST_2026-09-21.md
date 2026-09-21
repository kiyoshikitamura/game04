# GAME04 / 戦国姫艶武
# バトル最新仕様正本
更新日: 2026-09-21
状態: LATEST BATTLE AUTHORITY

本書は2026-09-21時点の最新仕様のみを記載する。旧案・撤回履歴は収録しない。本書と旧Battle文書が競合する場合は本書を優先する。未決数値は未決のまま扱う。

## 1. 基本
- 完全Auto Battle。通常攻撃・Skill・Target・BURSTの任意操作なし。
- 味方最大5人、Enemy最大3体、Questは1Stage 1〜5Wave。
- 味方行動順はDeck編成順。SPDなし。
- 初期Criticalなし。
- 1Battle通算300回の味方行動機会を上限とする。
- 意思決定は戦闘前のCharacter / 属性 / Skill / Equipment / 育成 / Deck構築に置く。

## 2. 属性・Damage
6属性: 火 / 水 / 土 / 風 / 光 / 闇。
火→風→土→水→火、光⇔闇。有利1.5 / 等倍1.0 / 不利0.75。
通常攻撃はCharacter属性、攻撃SkillはSkill属性。属性一致Bonusなし。Equipmentは属性なし。

```
Damage = max(1, floor((ATK × Skill倍率 − DEF) × 属性倍率 × 乱数 × (1 + Damage補正)))
```
乱数0.90〜1.10。DEF実数減算。最終切捨て。演出多段でも計算上の確定総Damageと表示合計を一致させる。

## 3. 共通SP
- 上限400、開始0。Character SP合算方式なし。
- 通常攻撃基礎+20、能動Skill基礎+10。
- LUK 0〜100。
- 獲得 = floor(基礎量 × (1 + LUK/200))。
- 行動完了後1回のみ。対象数・演出多段で増えない。
- Skill発動時に全額必要。BURST中は獲得0。
- Skill見送り・行動不能Skipでは行動由来SPを獲得しない。

## 4. バーストゲージ / BURST
- 共通SPとは別の味方共通Gauge。必要200、開始0、Wave間引継ぎ。
- 通常時のLUK補正後SP獲得量をGaugeへ蓄積。SP消費では減らない。
- 満タン後、次の行動可能Characterの行動開始時に自動抽選。
- 成功率 = 50% + LUK×0.3pt、最大80%。Lv加算なし。
- 成功/失敗ともGaugeを0へ戻す。敵BURSTなし。
- BURSTは通常1行動を置換する最大5行動。
- 各行動でSkill優先枠・条件・SPを再判定。使用可能Skillなしなら通常攻撃。
- Skill SP消費50%（端数切上げ）。同一Skill連続可。
- BURST中SP/Gauge獲得0。敵全滅・本人戦闘不能・行動不能等で終了。
- 残り行動は次Waveへ持ち越さない。
- ユーザー任意発動はしない。

## 5. Skill自動発動
Skill枠最大3。優先1→2→3で条件・対象・SPを判定し、最初に成立したSkillを使用。全枠不成立なら通常攻撃。高SP順ではない。見送りではSP・行動を消費しない。

## 6. Target
- Target指定なしの単体攻撃は相手配置順の最初の生存者。
- Skill固有Target Ruleを優先。
- HP最低/最高は実数、HP割合最低/最高は現在HP÷最大HP。同率は配置順。
- 別行動は実行直前に再選択。同一Skill内で選んだ対象は固定。
- 演出多段途中でTarget変更なし。

## 7. 状態
能動上限: ATK強化+50%、DEF強化+100%、ATK弱体-30%、DEF弱体-50%。別Skillは加算し個別持続。同じSkillは残存中更新しない。

ShieldはHPより先に最終Damageを吸収。DOT/HOTは付与時ATKと倍率を保持し、対象の実行行動終了時に処理。付与行動・行動不能Skipでは発生/減算なし。Wave間引継ぎ。

反撃は直接攻撃を受け死亡処理後も生存・行動可能なら元攻撃者へ。同一攻撃Skillにつき被攻撃者1人1回。演出多段で回数を増やさず、反撃への反撃なし。反撃はSP/Gauge獲得、敵Count減少、300行動加算なし。

解除カテゴリ: 能力強化 / 保護 / 能力低下 / DOT / 行動不能。Passiveは解除しない。

行動不能は次の行動機会を1回Skip。終了後、本人が実行行動を1回完了するまで共通耐性。BURST判定より先に処理。

## 8. Enemy
- 個別HP / SP / Action Count / Skillを持つ。Enemy BURSTなし。
- SPはBattle開始時最大。被弾SP量は未決。
- CountはEnemy別Master値。味方実行行動・行動不能Skipで生存Enemy Count-1。BURST各行動も-1。演出多段・全体攻撃は1回。
- Count 0で設定順に割込み。行動後Countを所定値へReset。
- Enemy SkillはMaster設定優先順で条件/SP判定。各Skill後に再判定し成立する限り連続行動可。
- 最初からSkill不可なら通常攻撃1回。Skill後に次が不成立なら通常攻撃を追加しない。
- 行動不能ならその回の連続行動全体をSkip。

## 9. 死亡 / 蘇生 / Boss Phase
HP0で戦闘不能。本人への能動状態は消去、本人が他者へ付与済みの能動効果は残存。本人Passiveは無効。共通SP/Gaugeは本人死亡だけでは減らない。
蘇生味方は次回本人順から復帰し、中断BURSTは再開しない。Enemy蘇生はSP0・初期Count。
死亡時効果/自動蘇生は初期ローンチで各個体・各効果1Battle1回。双方全滅は敗北。

Boss Phaseは一方向。1行動につき最大1段階。HP/SP/状態/残Countを維持し、Phase移行だけで回復・SP補充・状態解除しない。

## 10. Wave
Wave間で味方HP、戦闘不能、共通SP、バーストゲージ、Buff/Debuff、行動不能、再付与耐性、継続効果を引継ぐ。自動回復/復活なし。Enemy全滅でBURST終了。次Wave開始時Passive再判定。

## 11. 統合処理順
1. 発動条件・Target・SP確定、Passive参照
2. Skill本体を設定順で処理
3. 戦闘不能・死亡時効果・自動蘇生
4. 反撃
5. 元行動者のDOT
6. 生存していればHOT
7. 持続減算・資源獲得・耐性解除・Passive再判定
8. 勝敗
9. 継続時Boss Phase → Wave移行またはEnemy割込み

## 12. 300行動上限
通常行動、BURST各行動、行動不能Skipを数える。死亡者の順番飛ばし、Enemy行動、演出多段は追加カウントしない。300回目の処理完了後、最終Wave勝利成立なら勝利、双方生存の未決着は敗北。残り行動数を表示可能にする。

## 13. Battle UI / 演出
縦画面。常時領域はHeader / Enemy Zone / 共通SP・BURST Zone / Party Zone。
Header: WAVE、倍速、一時停止、Raid時のみRaid共通HP。
Enemy: 名前、Lv、属性、HP Bar、Action Count、最小限の状態Icon。立ち絵は大きく、Boss/主敵を強調可。
Party: 行動順、名前、Lv、属性、HP Bar、最大3Skill Icon、状態Icon、行動中強調。
一時表示: Damage、回復、WEAK、RESIST、SP増減、Buff/Debuff、BURST、Skill名、Enemy Action。Critical表示は初期なし。
BURSTは主要爽快感ポイントとして通常Battleとの差を明確にするが、任意操作UIは置かない。
演出はBattle Ruleを変更しない。

## 14. 最新の能力・装備方針
Character能力型: 攻撃 / 守備 / 攻守 / 回復・保護 / 支援。
Equipment 6枠: 武器 / 頭 / 胴 / 脚 / 装飾品1 / 装飾品2。
EquipmentはCharacter/Skillの戦術を補う位置付け。初期はEquipment Skill・Set効果なし。
LUKはSP/BURSTに加えDrop面の利益を持たせ、戦闘だけでは他特化より劣ることを許容。
万能Deckを避け、対策にはCharacter/Skill/Equipment入替と火力・耐久・SP等の代償を持たせる。

## 15. 付帯する最新Authority
- Battle UI最新: `docs/product/GAME04_BATTLE_UI_AUTHORITY_LATEST_2026-09-21.md`
- 育成: `docs/product/GAME04_GROWTH_AUTHORITY_V1_2026-09-21.md`
- 企画全体: `docs/product/GAME04_SENGOKU_PLANNING_AUTHORITY_REDESIGN_2026-09-19.md`
- 領土侵攻/Raid: `docs/product/GAME04_TERRITORY_INVASION_AUTHORITY_2026-09-20.md`
- Quest UI: `docs/product/GAME04_SENGOKU_QUEST_UI_AUTHORITY_2026-09-19.md`
- Raid UI: `docs/product/GAME04_SENGOKU_RAID_UI_AUTHORITY_PROVISIONAL_2026-09-19.md`

個別Skill正式数値、Enemy被弾SP量、Enemy/Stage正式数値など未決項目は別Master工程で確定する。過去の開発仮値を本書の正式値へ昇格させない。


## Latest UI integration
- 全体UI最新正本: `docs/product/GAME04_UI_AUTHORITY_LATEST_2026-09-21.md`
