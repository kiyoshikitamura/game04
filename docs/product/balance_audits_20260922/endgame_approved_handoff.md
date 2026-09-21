# GAME04 終盤バランス調整正本・開発引継ぎ

状態：ユーザー承認済み。第3回の終盤調整一式＋第5回の10-9第3Wave変更を採用。ゲーム実装・DB・配信は未変更。Git保存は接続エラーにより未完了。

## 1. 採用範囲

- Quest：10-8、10-9、10-10。
- 領土侵攻：安土城TI05の第9段階・第12段階の個人戦。共有HPの変更ではない。
- 安土第3・6段階、Questの他ステージ、エンカウントレイド、味方60体/72スキル/装備160件、育成・報酬・魂・ガチャ・ショップは変更しない。
- 10-8の最終ボス家康、10-9秀吉、10-10信長を維持。10-9第3Waveのみ慶次→幸村へ置換。

## 2. 変更の目的

完成SSR編成で通常攻撃のみでも終盤を全勝する状態を改める。補助・回復・属性に応じたスキルの付け替え、キャラ編成の変更を攻略へ反映する。特定キャラ必須・全装備SSR必須という条件は設けない。

## 3. 採用済み変更一式

|対象|ATK（元表比）|HP（元表比）|カウント（元表比）|スキル等|
|---|---:|---:|---:|---|
|10-8|3倍|1.5倍|0.5倍|家康036→021→015、HP50%フェーズ後021→015。LB8|
|10-9|2.5倍|維持|0.4倍|第3Wave幸村へ変更。詳細は次節|
|10-10|2.5倍|維持|0.6倍|既存スキル維持|
|安土9|3倍|1.5倍|0.5倍|謙信020→014、LB9|
|安土12|3倍|維持|0.3倍|信長035→019→013、LB9|

スキルIDにはSKDを付ける。倍率は対象戦闘の全Wave・全敵に適用済みの値を後掲。四捨五入し、カウント最低2。初期カウントも同値、フェーズ再設定カウントも同率。表の倍率を後掲の完成値に再度掛けないこと。元表とは検証基準SHAの統合正本にある対象敵表。

## 4. 10-9 第3Wave 幸村

|項目|採用値|
|---|---|
|識別|10-9/3/1（配置IDを維持、キャラ参照は幸村へ変更）|
|キャラ/属性/Lv|真田幸村/火/Lv98|
|HP/ATK/DEF|252,000 / 31,500 / 7,800|
|初期/再設定カウント|2 / 2|
|開始SP/上限|75 / 180|
|スキル|SKD019 全体攻撃・火、LB8、倍率90.26%、消費SP75|
|パッシブ|幸村P14、Lv8。元の慶次P05を残さない|
|被弾SP獲得|10（既存と同じ）|

Lv・能力値・行動間隔は第3回の当該配置の候補を維持。開始SP/上限は旧0/100から変更。敵画像・キャラ名・属性・詳細スキル表示も同一の幸村参照へそろえる。魂報酬の対象・確率は変更しない。出現者との整合が必要な報酬/説明がある場合は自動変更せず差分として報告する。

## 5. 全敵の確定差分

|戦闘/Wave/配置|旧敵→新敵|HP|ATK|DEF|初期/再設定カウント|開始SP/上限|スキル順|
|---|---|---:|---:|---:|---|---|---|
|10-8/1/1|島左近→島左近|81075|24690|3290|4/4|50/150|SKD009|
|10-8/1/2|大友宗麟→大友宗麟|59925|21150|3060|3/3|45/100|SKD061|
|10-8/2/1|立花誾千代→立花誾千代|81075|24690|3290|4/4|75/150|SKD023|
|10-8/2/2|本願寺顕如→本願寺顕如|70500|31740|2940|4/4|90/180|SKD040|
|10-8/3/1|徳川家康→徳川家康|475875|42300|8230|5/5|125/180|SKD036→SKD021→SKD015|
|10-9/1/1|浅井長政→浅井長政|28800|15000|2640|2/2|0/100|なし|
|10-9/1/2|毛利元就→毛利元就|55200|21000|3360|3/3|50/150|SKD010|
|10-9/2/1|濃姫→濃姫|50400|25500|3600|2/2|75/150|SKD046|
|10-9/2/2|細川ガラシャ→細川ガラシャ|48000|27000|3000|3/3|90/180|SKD040|
|10-9/3/1|前田慶次→真田幸村|252000|31500|7800|2/2|75/180|SKD019|
|10-9/4/1|豊臣秀吉→豊臣秀吉|252000|31500|7800|3/3|140/180|SKD040→SKD011|
|10-10/1/1|直江兼続→直江兼続|42500|18750|3250|3/3|75/150|SKD035|
|10-10/1/2|長宗我部元親→長宗我部元親|57500|21875|3500|4/4|50/150|SKD008|
|10-10/2/1|立花誾千代→立花誾千代|57500|21875|3500|5/5|75/150|SKD023|
|10-10/3/1|山本勘助→山本勘助|42500|18750|3250|3/3|50/100|SKD037|
|10-10/3/2|島左近→島左近|57500|21875|3500|4/4|50/150|SKD009|
|10-10/4/1|雑賀孫市→雑賀孫市|57500|21875|3500|5/5|55/110|SKD026|
|10-10/5/1|本多忠勝→本多忠勝|262500|32825|8130|5/5|110/150|SKD050|
|10-10/6/1|織田信長→織田信長|337500|37500|8750|5/5|175/180|SKD035→SKD007|
|10-10/6/2|加藤清正→加藤清正|92500|17200|6880|4/4|30/150|SKD034|
|TI05/9/1/1|上杉謙信→上杉謙信|313575|25590|4760|6/6|180/180|SKD020→SKD014|
|TI05/9/1/2|伊達政宗→伊達政宗|104520|20100|2930|6/6|150/150|SKD022|
|TI05/12/1/1|加藤清正→加藤清正|112500|13650|6000|2/2|100/100|SKD034|
|TI05/12/1/2|織田信長→織田信長|281250|27300|5200|3/3|175/175|SKD035→SKD019→SKD013|
|TI05/12/1/3|濃姫→濃姫|60000|19500|2800|2/2|100/100|SKD046|

10-8家康はHP50%時フェーズ：再設定カウント4、SKD021→015。その他既存のフェーズ/共通ルールは維持。表は配置別完成値。パッシブ・スキル効果・属性等を含む全入力は末尾JSONに収録。

## 6. 開発への限定引継ぎ

作業Repository：kiyoshikitamura/game04。基準ブランチ：codex/game04-upstream-20260918。検証基準SHA：d95523928d6b9305a073f31b123326bd9e1277a4。これは巻き戻し先ではない。作業開始時に最新HEADを取得し、開発側の変更・受入済み成果を維持する。

1. 本書をdocs/product/GAME04_ENDGAME_BALANCE_AUTHORITY_2026-09-21.mdへ保存し、最新マスター統合正本から参照する。対象5戦闘の敵数値に限り本書が旧area09_10/invasion表を上書きする。旧表は履歴として残す。
2. 末尾JSONをdocs配下の数値資料として抽出可能。ランタイム用マスターと同一形式と見なしてそのまま投入せず、既存の対応フィールドへ必要な値だけ反映する。
3. Quest/Raidのマスター参照・敵生成・UI表示に関わる対象差分だけ実装する。全マスター置換、戦闘エンジン改造、既存育成値の再計算を行わない。
4. 敵初期SPと上限、最大6Wave、既存の共通SP400・BURST200・スキル優先順を維持する。
5. 幸村のキャラID/画像/属性/パッシブ、対象Wave位置、能力値、スキルLB、カウント、フェーズを照合する。混在した慶次の参照を残さない。
6. 実装計算器が検証基準から更新されている場合は差分を確認し、変更に影響する代表ケースだけ再計算する。コードが異なるのに本書の勝率と一致済みと報告しない。
7. GAME04開発環境/Previewで対象ステージの結果と表示を確認し、SHA・変更箇所・DB変更有無・実装済み/未実装・結果を報告する。GAME03/Productionへ変更しない。

## 7. 検証結果と残件

第5回の候補選定2,640戦＋候補固定後5,200戦＝7,840戦。固定後はseed401〜500、各100戦。第3回・第4回は別の検証群。合算数を全ステージ網羅の意味で使わない。

|編成|10-8家康|採用10-9秀吉|10-10信長|
|---|---:|---:|---:|
|風攻撃中心|100|0|100|
|水攻撃中心|34|91|86|
|先頭慶次・スキル固定|96|66|100|
|先頭慶次＋水攻撃|76|99|99|

条件：キャラLv100/覚醒+5、スキルLB10、SSR装備30個Lv100/LB10。編成・攻撃属性変更の詳細と全入力は第4・5回検証記録参照。100戦全勝は保証ではない。SSR装備20個＋SR10個の水編成でも秀吉戦63勝、25個＋5個で79勝。

数値採用は確定。以下は受入/検証残件であり、数値未決とは分ける。

- 開発マスターへの反映、実計算器との一致、Previewの表示・結果接続。
- 全65ステージ・未完成育成での到達点、全キャラ/スキル組合せの網羅は未実施。
- 動画再生時間、初回攻略体験、報酬/魂供給との全体監査。
- 侵攻戦は対象個人戦の比較。3日間全体・共有HP・参加/救援運用の受入ではない。
- この文書でマネタイズ達成、LTV達成、全体バランス合格を認定しない。

## 8. Git・保存状況

GitHubの最新HEAD取得がHTTP400接続エラーで失敗したため、この文書作成時点ではコミット未作成。既存正本に反映済みとは扱わない。最新入口へ追加する文面：

> 終盤5戦闘（Quest10-8〜10、安土9/12）はGAME04_ENDGAME_BALANCE_AUTHORITY_2026-09-21.mdを優先する。数値採用済み、実装/全体受入は別管理。10-9第3Waveは幸村へ変更。その他の旧表・味方能力値・経済マスターの採用状態は維持。

## 9. 承認済み設計入力JSON

下記は検証用構造を保持した数値資料。imageの空文字・検証用descriptionなどを本番UIに上書きしない。キャラIDの正規解決は既存キャラマスターから行う。

```json
{
  "status": "USER_APPROVED_DESIGN_NOT_IMPLEMENTED",
  "verification_base_sha": "d95523928d6b9305a073f31b123326bd9e1277a4",
  "repository": "kiyoshikitamura/game04",
  "branch": "codex/game04-upstream-20260918",
  "scope": [
    "10-8",
    "10-9",
    "10-10",
    "TI05/9",
    "TI05/12"
  ],
  "waves": {
    "10-8": [
      [
        {
          "id": "10-8/1/1",
          "name": "島左近",
          "image": "",
          "level": 97,
          "element": "earth",
          "stats": {
            "hp": 81075,
            "atk": 24690,
            "def": 3290,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD009",
              "name": "標準単体攻撃・土",
              "image": "",
              "rarity": "R",
              "element": "earth",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P16_earth",
              "type": "P16",
              "name": "P16",
              "stat": "def",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 50,
          "initialCount": 4,
          "actionCount": 4,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-8/1/2",
          "name": "大友宗麟",
          "image": "",
          "level": 97,
          "element": "light",
          "stats": {
            "hp": 59925,
            "atk": 21150,
            "def": 3060,
            "luk": 0,
            "sp": 100
          },
          "skills": [
            {
              "id": "SKD061",
              "name": "奮戦の檄",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 45,
              "condition": {
                "type": "always"
              },
              "target": "highest_atk_ally",
              "effects": [
                {
                  "type": "atk_up",
                  "power": 17.57,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P01_light",
              "type": "P01",
              "name": "P01",
              "stat": "atk",
              "percent": 6.7913540396388665,
              "level": 8,
              "target": "party",
              "targetElement": "light"
            }
          ],
          "initialSp": 45,
          "initialCount": 3,
          "actionCount": 3,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-8/2/1",
          "name": "立花誾千代",
          "image": "",
          "level": 97,
          "element": "light",
          "stats": {
            "hp": 81075,
            "atk": 24690,
            "def": 3290,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD023",
              "name": "全体攻撃・光",
              "image": "",
              "rarity": "R",
              "element": "light",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 90.26
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P07_light",
              "type": "P07",
              "name": "P07",
              "stat": "atk",
              "percent": 12.733788824322875,
              "level": 8,
              "target": "self",
              "targetElement": "light"
            }
          ],
          "initialSp": 75,
          "initialCount": 4,
          "actionCount": 4,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-8/2/2",
          "name": "本願寺顕如",
          "image": "",
          "level": 97,
          "element": "earth",
          "stats": {
            "hp": 70500,
            "atk": 31740,
            "def": 2940,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD040",
              "name": "治癒の祈り",
              "image": "",
              "rarity": "SR",
              "element": "water",
              "spCost": 90,
              "condition": {
                "type": "always"
              },
              "target": "lowest_ally",
              "effects": [
                {
                  "type": "heal",
                  "power": 131.74,
                  "healingFormula": "caster_atk_percent"
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P10_earth",
              "type": "P10",
              "name": "P10",
              "stat": "atk",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 90,
          "initialCount": 4,
          "actionCount": 4,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-8/3/1",
          "name": "徳川家康",
          "image": "",
          "level": 97,
          "element": "earth",
          "stats": {
            "hp": 475875,
            "atk": 42300,
            "def": 8230,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD036",
              "name": "守りの陣",
              "image": "",
              "rarity": "R",
              "element": "light",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_allies",
              "effects": [
                {
                  "type": "def_up",
                  "power": 26.35,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD021",
              "name": "全体攻撃・土",
              "image": "",
              "rarity": "R",
              "element": "earth",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 90.26
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD015",
              "name": "高威力単体攻撃・土",
              "image": "",
              "rarity": "SSR",
              "element": "earth",
              "spCost": 150,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 263.49
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P02_earth",
              "type": "P02",
              "name": "P02",
              "stat": "def",
              "percent": 20.374062118916598,
              "level": 8,
              "target": "party",
              "targetElement": "earth"
            }
          ],
          "initialSp": 125,
          "initialCount": 5,
          "actionCount": 5,
          "order": 0,
          "hitSpGain": 10,
          "phases": [
            {
              "hpBelow": 0.5,
              "name": "第2形態",
              "actionCount": 4,
              "skills": [
                {
                  "id": "SKD021",
                  "name": "全体攻撃・土",
                  "image": "",
                  "rarity": "R",
                  "element": "earth",
                  "spCost": 75,
                  "condition": {
                    "type": "always"
                  },
                  "target": "all_enemies",
                  "effects": [
                    {
                      "type": "damage",
                      "power": 90.26
                    }
                  ],
                  "description": "正式表の検証入力"
                },
                {
                  "id": "SKD015",
                  "name": "高威力単体攻撃・土",
                  "image": "",
                  "rarity": "SSR",
                  "element": "earth",
                  "spCost": 150,
                  "condition": {
                    "type": "always"
                  },
                  "target": "first",
                  "effects": [
                    {
                      "type": "damage",
                      "power": 263.49
                    }
                  ],
                  "description": "正式表の検証入力"
                }
              ]
            }
          ]
        }
      ]
    ],
    "10-9": [
      [
        {
          "id": "10-9/1/1",
          "name": "浅井長政",
          "image": "",
          "level": 98,
          "element": "wind",
          "stats": {
            "hp": 28800,
            "atk": 15000,
            "def": 2640,
            "luk": 0,
            "sp": 100
          },
          "skills": [],
          "passives": [
            {
              "id": "P11_wind",
              "type": "P11",
              "name": "P11",
              "stat": "atk",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "wind"
            }
          ],
          "initialSp": 0,
          "initialCount": 2,
          "actionCount": 2,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-9/1/2",
          "name": "毛利元就",
          "image": "",
          "level": 98,
          "element": "wind",
          "stats": {
            "hp": 55200,
            "atk": 21000,
            "def": 3360,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD010",
              "name": "標準単体攻撃・風",
              "image": "",
              "rarity": "R",
              "element": "wind",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P03_wind",
              "type": "P03",
              "name": "P03",
              "stat": "atk",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "wind"
            }
          ],
          "initialSp": 50,
          "initialCount": 3,
          "actionCount": 3,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-9/2/1",
          "name": "濃姫",
          "image": "",
          "level": 98,
          "element": "dark",
          "stats": {
            "hp": 50400,
            "atk": 25500,
            "def": 3600,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD046",
              "name": "守護の札",
              "image": "",
              "rarity": "SR",
              "element": "light",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "lowest_ally",
              "effects": [
                {
                  "type": "shield",
                  "power": 114.18,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P12_dark",
              "type": "P12",
              "name": "P12",
              "stat": "atk",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "dark"
            }
          ],
          "initialSp": 75,
          "initialCount": 2,
          "actionCount": 2,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-9/2/2",
          "name": "細川ガラシャ",
          "image": "",
          "level": 98,
          "element": "light",
          "stats": {
            "hp": 48000,
            "atk": 27000,
            "def": 3000,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD040",
              "name": "治癒の祈り",
              "image": "",
              "rarity": "SR",
              "element": "water",
              "spCost": 90,
              "condition": {
                "type": "always"
              },
              "target": "lowest_ally",
              "effects": [
                {
                  "type": "heal",
                  "power": 131.74,
                  "healingFormula": "caster_atk_percent"
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P10_light",
              "type": "P10",
              "name": "P10",
              "stat": "atk",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "light"
            }
          ],
          "initialSp": 90,
          "initialCount": 3,
          "actionCount": 3,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-9/3/1",
          "name": "真田幸村",
          "image": "",
          "level": 98,
          "element": "fire",
          "stats": {
            "hp": 252000,
            "atk": 31500,
            "def": 7800,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD019",
              "name": "全体攻撃・火",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 90.26
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P14_fire",
              "type": "P14",
              "name": "P14",
              "stat": "atk",
              "percent": 38.20136647296862,
              "level": 8,
              "target": "self",
              "targetElement": "fire"
            }
          ],
          "initialSp": 75,
          "initialCount": 2,
          "actionCount": 2,
          "order": 0,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-9/4/1",
          "name": "豊臣秀吉",
          "image": "",
          "level": 98,
          "element": "light",
          "stats": {
            "hp": 252000,
            "atk": 31500,
            "def": 7800,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD040",
              "name": "治癒の祈り",
              "image": "",
              "rarity": "SR",
              "element": "water",
              "spCost": 90,
              "condition": {
                "type": "always"
              },
              "target": "lowest_ally",
              "effects": [
                {
                  "type": "heal",
                  "power": 131.74,
                  "healingFormula": "caster_atk_percent"
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD011",
              "name": "標準単体攻撃・光",
              "image": "",
              "rarity": "R",
              "element": "light",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P10_light",
              "type": "P10",
              "name": "P10",
              "stat": "atk",
              "percent": 33.956770198194334,
              "level": 8,
              "target": "self",
              "targetElement": "light"
            }
          ],
          "initialSp": 140,
          "initialCount": 3,
          "actionCount": 3,
          "order": 0,
          "hitSpGain": 10
        }
      ]
    ],
    "10-10": [
      [
        {
          "id": "10-10/1/1",
          "name": "直江兼続",
          "image": "",
          "level": 100,
          "element": "water",
          "stats": {
            "hp": 42500,
            "atk": 18750,
            "def": 3250,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD035",
              "name": "鬨の声",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_allies",
              "effects": [
                {
                  "type": "atk_up",
                  "power": 13.3,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P01_water",
              "type": "P01",
              "name": "P01",
              "stat": "atk",
              "percent": 10.187031059458299,
              "level": 8,
              "target": "party",
              "targetElement": "water"
            }
          ],
          "initialSp": 75,
          "initialCount": 3,
          "actionCount": 3,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-10/1/2",
          "name": "長宗我部元親",
          "image": "",
          "level": 100,
          "element": "water",
          "stats": {
            "hp": 57500,
            "atk": 21875,
            "def": 3500,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD008",
              "name": "標準単体攻撃・水",
              "image": "",
              "rarity": "R",
              "element": "water",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P16_water",
              "type": "P16",
              "name": "P16",
              "stat": "def",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "water"
            }
          ],
          "initialSp": 50,
          "initialCount": 4,
          "actionCount": 4,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-10/2/1",
          "name": "立花誾千代",
          "image": "",
          "level": 100,
          "element": "light",
          "stats": {
            "hp": 57500,
            "atk": 21875,
            "def": 3500,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD023",
              "name": "全体攻撃・光",
              "image": "",
              "rarity": "R",
              "element": "light",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 90.26
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P07_light",
              "type": "P07",
              "name": "P07",
              "stat": "atk",
              "percent": 12.733788824322875,
              "level": 8,
              "target": "self",
              "targetElement": "light"
            }
          ],
          "initialSp": 75,
          "initialCount": 5,
          "actionCount": 5,
          "order": 0,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-10/3/1",
          "name": "山本勘助",
          "image": "",
          "level": 100,
          "element": "fire",
          "stats": {
            "hp": 42500,
            "atk": 18750,
            "def": 3250,
            "luk": 0,
            "sp": 100
          },
          "skills": [
            {
              "id": "SKD037",
              "name": "威圧",
              "image": "",
              "rarity": "R",
              "element": "dark",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "highest_atk_enemy",
              "effects": [
                {
                  "type": "atk_down",
                  "power": 17.57,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P08_fire",
              "type": "P08",
              "name": "P08",
              "stat": "atk",
              "percent": 12.733788824322875,
              "level": 8,
              "target": "self",
              "targetElement": "fire"
            }
          ],
          "initialSp": 50,
          "initialCount": 3,
          "actionCount": 3,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-10/3/2",
          "name": "島左近",
          "image": "",
          "level": 100,
          "element": "earth",
          "stats": {
            "hp": 57500,
            "atk": 21875,
            "def": 3500,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD009",
              "name": "標準単体攻撃・土",
              "image": "",
              "rarity": "R",
              "element": "earth",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P16_earth",
              "type": "P16",
              "name": "P16",
              "stat": "def",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 50,
          "initialCount": 4,
          "actionCount": 4,
          "order": 1,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-10/4/1",
          "name": "雑賀孫市",
          "image": "",
          "level": 100,
          "element": "wind",
          "stats": {
            "hp": 57500,
            "atk": 21875,
            "def": 3500,
            "luk": 0,
            "sp": 110
          },
          "skills": [
            {
              "id": "SKD026",
              "name": "後陣射ち",
              "image": "",
              "rarity": "R",
              "element": "wind",
              "spCost": 55,
              "condition": {
                "type": "always"
              },
              "target": "last",
              "effects": [
                {
                  "type": "damage",
                  "power": 161.74
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P06_wind",
              "type": "P06",
              "name": "P06",
              "stat": "atk",
              "percent": 12.733788824322875,
              "level": 8,
              "target": "self",
              "targetElement": "wind"
            }
          ],
          "initialSp": 55,
          "initialCount": 5,
          "actionCount": 5,
          "order": 0,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-10/5/1",
          "name": "本多忠勝",
          "image": "",
          "level": 100,
          "element": "earth",
          "stats": {
            "hp": 262500,
            "atk": 32825,
            "def": 8130,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD050",
              "name": "迎撃の構え",
              "image": "",
              "rarity": "SSR",
              "element": "earth",
              "spCost": 110,
              "condition": {
                "type": "always"
              },
              "target": "self",
              "effects": [
                {
                  "type": "taunt",
                  "power": 0,
                  "chance": 1,
                  "duration": 3
                },
                {
                  "type": "counter",
                  "power": 89.05,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P13_earth",
              "type": "P13",
              "name": "P13",
              "stat": "atk",
              "percent": 38.20136647296862,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 110,
          "initialCount": 5,
          "actionCount": 5,
          "order": 0,
          "hitSpGain": 10
        }
      ],
      [
        {
          "id": "10-10/6/1",
          "name": "織田信長",
          "image": "",
          "level": 100,
          "element": "fire",
          "stats": {
            "hp": 337500,
            "atk": 37500,
            "def": 8750,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD035",
              "name": "鬨の声",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_allies",
              "effects": [
                {
                  "type": "atk_up",
                  "power": 13.3,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD007",
              "name": "標準単体攻撃・火",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 50,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 180.53
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P01_fire",
              "type": "P01",
              "name": "P01",
              "stat": "atk",
              "percent": 13.582708079277733,
              "level": 8,
              "target": "party",
              "targetElement": "fire"
            }
          ],
          "initialSp": 175,
          "initialCount": 5,
          "actionCount": 5,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "10-10/6/2",
          "name": "加藤清正",
          "image": "",
          "level": 100,
          "element": "earth",
          "stats": {
            "hp": 92500,
            "atk": 17200,
            "def": 6880,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD034",
              "name": "身構え",
              "image": "",
              "rarity": "N",
              "element": "earth",
              "spCost": 30,
              "condition": {
                "type": "always"
              },
              "target": "self",
              "effects": [
                {
                  "type": "def_up",
                  "power": 26.35,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P15_earth",
              "type": "P15",
              "name": "P15",
              "stat": "def",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 30,
          "initialCount": 4,
          "actionCount": 4,
          "order": 1,
          "hitSpGain": 10
        }
      ]
    ],
    "TI05/9": [
      [
        {
          "id": "TI05/9/1",
          "name": "上杉謙信",
          "image": "",
          "level": 97,
          "element": "water",
          "stats": {
            "hp": 313575,
            "atk": 25590,
            "def": 4760,
            "luk": 0,
            "sp": 180
          },
          "skills": [
            {
              "id": "SKD020",
              "name": "全体攻撃・水",
              "image": "",
              "rarity": "R",
              "element": "water",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 95.06
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD014",
              "name": "高威力単体攻撃・水",
              "image": "",
              "rarity": "SSR",
              "element": "water",
              "spCost": 150,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 281.49
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P06_water",
              "type": "P06",
              "name": "P06",
              "stat": "atk",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "water"
            }
          ],
          "initialSp": 180,
          "initialCount": 6,
          "actionCount": 6,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "TI05/9/2",
          "name": "伊達政宗",
          "image": "",
          "level": 97,
          "element": "wind",
          "stats": {
            "hp": 104520,
            "atk": 20100,
            "def": 2930,
            "luk": 0,
            "sp": 150
          },
          "skills": [
            {
              "id": "SKD022",
              "name": "全体攻撃・風",
              "image": "",
              "rarity": "R",
              "element": "wind",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 95.06
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P07_wind",
              "type": "P07",
              "name": "P07",
              "stat": "atk",
              "percent": 16.978385099097167,
              "level": 8,
              "target": "self",
              "targetElement": "wind"
            }
          ],
          "initialSp": 150,
          "initialCount": 6,
          "actionCount": 6,
          "order": 1,
          "hitSpGain": 10
        }
      ]
    ],
    "TI05/12": [
      [
        {
          "id": "TI05/12/1",
          "name": "加藤清正",
          "image": "",
          "level": 100,
          "element": "earth",
          "stats": {
            "hp": 112500,
            "atk": 13650,
            "def": 6000,
            "luk": 0,
            "sp": 100
          },
          "skills": [
            {
              "id": "SKD034",
              "name": "身構え",
              "image": "",
              "rarity": "N",
              "element": "earth",
              "spCost": 30,
              "condition": {
                "type": "always"
              },
              "target": "self",
              "effects": [
                {
                  "type": "def_up",
                  "power": 28.15,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P15_earth",
              "type": "P15",
              "name": "P15",
              "stat": "def",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "earth"
            }
          ],
          "initialSp": 100,
          "initialCount": 2,
          "actionCount": 2,
          "order": 0,
          "hitSpGain": 10
        },
        {
          "id": "TI05/12/2",
          "name": "織田信長",
          "image": "",
          "level": 100,
          "element": "fire",
          "stats": {
            "hp": 281250,
            "atk": 27300,
            "def": 5200,
            "luk": 0,
            "sp": 175
          },
          "skills": [
            {
              "id": "SKD035",
              "name": "鬨の声",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_allies",
              "effects": [
                {
                  "type": "atk_up",
                  "power": 14.14,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD019",
              "name": "全体攻撃・火",
              "image": "",
              "rarity": "R",
              "element": "fire",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "all_enemies",
              "effects": [
                {
                  "type": "damage",
                  "power": 95.06
                }
              ],
              "description": "正式表の検証入力"
            },
            {
              "id": "SKD013",
              "name": "高威力単体攻撃・火",
              "image": "",
              "rarity": "SSR",
              "element": "fire",
              "spCost": 150,
              "condition": {
                "type": "always"
              },
              "target": "first",
              "effects": [
                {
                  "type": "damage",
                  "power": 281.49
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P01_fire",
              "type": "P01",
              "name": "P01",
              "stat": "atk",
              "percent": 13.582708079277733,
              "level": 8,
              "target": "party",
              "targetElement": "fire"
            }
          ],
          "initialSp": 175,
          "initialCount": 3,
          "actionCount": 3,
          "order": 1,
          "hitSpGain": 10
        },
        {
          "id": "TI05/12/3",
          "name": "濃姫",
          "image": "",
          "level": 100,
          "element": "dark",
          "stats": {
            "hp": 60000,
            "atk": 19500,
            "def": 2800,
            "luk": 0,
            "sp": 100
          },
          "skills": [
            {
              "id": "SKD046",
              "name": "守護の札",
              "image": "",
              "rarity": "SR",
              "element": "light",
              "spCost": 75,
              "condition": {
                "type": "always"
              },
              "target": "lowest_ally",
              "effects": [
                {
                  "type": "shield",
                  "power": 121.98,
                  "duration": 3
                }
              ],
              "description": "正式表の検証入力"
            }
          ],
          "passives": [
            {
              "id": "P12_dark",
              "type": "P12",
              "name": "P12",
              "stat": "atk",
              "percent": 25.46757764864575,
              "level": 8,
              "target": "self",
              "targetElement": "dark"
            }
          ],
          "initialSp": 100,
          "initialCount": 2,
          "actionCount": 2,
          "order": 2,
          "hitSpGain": 10
        }
      ]
    ]
  }
}
```
