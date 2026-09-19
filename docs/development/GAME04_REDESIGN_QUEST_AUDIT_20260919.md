# GAME04 全面改修：Quest レーン

## 正本

2026-09-19 企画仕様、全面改修計画、Quest UI正本。表示はQuest UIを優先し、ステージ固定属性・BOSSありフラグ・総合力・星評価を表示しない。

## 現実装差分

| 分類 | 対象 | 対応 |
|---|---|---|
| KEEP | 認証、通貨、戦国キャラ画像、背景2種 | 共通基盤および画像パスを使用 |
| KEEP | QuestTownStory / progressionGuide の42場面 | 旧Story資産を削除せず保存。新70段階への物語配置は後工程 |
| MODIFY | GameContextのpatrolCourses、7地域×3難度、派遣開始/時短/受取 | 新Questは独立した70ステージMasterとサーバーBattle・決済へ接続 |
| REMOVE/HIDE | QuestPresentationV2の時間探索・派遣枠・時短・旧NPC遭遇操作 | 新QuestViewに露出なし。旧コードは受入済み資産保護のため削除しない |
| NEW | 10エリア×7段階、Wave1〜5、敵1〜3 | quests.ts。地域/編成/報酬/消費/遭遇率はMasterで管理 |
| NEW | Area→Stage→情報→準備→Battle→Result | 中央ダイアログ2段階を分離 |
| NEW | 共通PreparationModal | 5人横一列、単一合計SP、武将タップでSkill/Passive詳細。Raidと共用 |

## 実装

- `src/domain/redesign/quests.ts`
- `src/app/components/redesign/QuestView.tsx`
- `src/app/components/redesign/PreparationModal.tsx`
- `src/app/components/redesign/QuestView.css`

UIはサーバー確定BattleResult・報酬を受け取る。UI内で通貨・報酬・遭遇抽選を確定しない。挑戦の二重タップを抑止する。

行動力は挑む時にサーバーで消費、敗北返却なし。Wave HP/SP/戦闘不能/効果の引継ぎはBattle Coreが実行する。

装備ドロップは全70ステージ、解禁アイテムはエリア3以降の56ステージに仮確率で設定。全ステージでキャラ・Skill・装備育成素材を供給する。経済/難易度/ドロップ数値はPreview用仮Masterであり商材FIXではない。

## API契約

`onStart(stageId) -> { battle, rewards, firstClear, encounterRaidId? }`

`onIgnoreEncounter(raidId)` はサーバーで参加権を放棄し、成功時のみ通知を閉じる。失敗時はエラー表示と再試行を可能にする。

## 最低限確認

- typecheck：PASS
- 10エリア / 70ステージ：PASS
- 全Stage Wave1〜5、敵1〜3：PASS
- 70段階順次解放 / 前段未clear時ロック / clear済み再挑戦：PASS
- 初期N5人で最初の戦闘：勝利、4アクション
- 背景2種：git tree上の実在確認済み

## 仮素材・後工程

エリア背景は戦国の既存2種を交互に利用、Enemyは既存武将画像を流用。背景差替えはMasterのimage変更のみ。専用背景・Enemy画像の制作、70段階の物語配置、チュートリアル、Economy最終調整は後工程。
