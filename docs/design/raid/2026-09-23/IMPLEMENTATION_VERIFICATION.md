# レイド承認モック本体反映 検証記録

## 接続結果

| 境界 | 結果 | 接続先 |
|---|---|---|
| レイド本体トップ | PASS | `RaidRoomConnectedBrowser → RaidTop → RaidTopApproved` |
| ボス／武将／属性／背景 | PASS (GAME04 redesign master) | `src/domain/redesign/raid.ts` の `RAID_MASTERS`（`encounter_flame` / `unlock_shadow`）を `resolveRaidTopEnemy → RaidTopEntry.enemy → RaidTopApproved / RaidRoomDetail / ApprovedRaidPreview` へ接続。旧 `raid_production_20260830.json` はGAME03スナップショットとして表示経路から除外 |
| 属性 | PASS (GAME04 master) | `RAID_MASTERS[].enemy.element`（火／闇）を表示属性へ変換。旧 `raid_bosses_20260822.json` のGAME03属性経路は対象3画面で使用しない |
| レイド分類 | PARTIAL | RPCに `origin` がある場合のみ `encounter` / `territory` を使用。未提供時は `difficultyId` で推測せず未分類のまま |
| 開催者 | PASS | `RaidTopEntry.room.owner` の `userId` / `name` / `leaderIconUrl`。閲覧者・最後の参加者で代用しない |
| Room詳細 | PASS | `RaidRoomDetail`。`briefing`、`display`、`participants`、`room.hp`、lifecycle を既存 resource から表示 |
| 詳細アクション | PASS | 敵情報・参加者・報酬・救援を既存Dialog callbackへ接続 |
| 終了レイド報酬 | PASS | 一覧カードから `RaidRoomBrowser` の既存報酬Dialog stateへ接続 |
| 出撃 | PASS | 既存 `action` / `onBriefingReady` / `prepareRaidRoomBattle` 経路を維持 |
| 報酬・救援・プロフィール | PASS | 既存 `RaidRoomDialogs`、`RaidRoomRescuePanel`、profile callbackを維持 |

## 視覚確認

- 承認正本：`raid-approved-mock.png`
- 固定比較：`comparison/raid-approved-preview-1536.png`、`comparison/raid-approved-preview-390.png`
- 本体トップ：`comparison/raid-body-top-390.png`
- 本体詳細：`comparison/raid-body-detail-390.png`
- 確認ルート：`/qa/raid-top`、`/qa/raid-detail`、`/qa/raid-approved`
- Mock環境でHTTP 200、一覧3フィルタ、続きへ、詳細2列アクション、挑むCTA、390px表示を確認。実本体の一覧・詳細・詳細下部を同じデータ契約で再確認する。
- QA専用ツールバー、Mockシナリオ説明、戦闘帰還Mock、比較用の実装注記は本体表示から除去した。
- 詳細アクションは2列×2行に修正し、時計・人数・挑戦・行動力のUnicode代用を専用SVGへ統一した。
- 本体の表示は `RaidTopEntry.room.owner` と `room.hp`、`participantCount`、`expiresAt`、敵属性を直接参照する。承認モック固有の固定名・固定HP・固定キャラ画像は残していない。
- 旧 `raid_production_20260830.json` をGAME04正本とした前回記録は訂正済み。対象3画面と比較QAは `src/domain/redesign/raid.ts` のGAME04 `RAID_MASTERS`へ統一した。
- 一覧カードは画像領域／テキスト領域の左右分割を廃止し、全面背景・キャラクター・情報・操作を同一カード内で重ねる構造へ変更した。
- ソート処理は維持し、説明文「残り時間が短い順」は本体・Preview・Redesign一覧から削除した。
- QA詳細は実際の `.ui-hub-page-scroll` を縦スクロールし、詳細下部のCTAまで到達できることを確認した。スクロールバーは7px、金色トラック／つまみで承認デザインに合わせた。
- 承認Previewのパネルも固定高さ＋縦スクロールへ変更し、不透明stickyフッターがカード内容を視覚的に覆わない配置へ修正した。
- 本体の正式表示背景に旧エリア背景マッピングが残っている。GAME03素材への差替えは行っていないが、正式GAME04レイド背景の供給・マッピング確定が必要。

## 素材

`public/ui/raid/`のSVG9種は今回制作した未承認素材。承認モックの図柄・色・透過・表示寸法に合わせた比較用制作物であり、正式共通アイコンとして採用済みとは扱わない。正式版供給後に差替える。

1. `clock.svg` — 金色時計
2. `people.svg` — 人物グループ
3. `swords.svg` — 交差する刀
4. `scroll.svg` — 金色巻物
5. `handshake.svg` — 握手
6. `chest.svg` — 赤金宝箱
7. `armor.svg` — 挑戦数の鎧
8. `victory.svg` — 勝利意匠
9. `medal.svg` — 報酬資格メダリオン

モックとの比較では、絵文字・文字だけの代替・別用途素材は使用していない。ボス／背景／開催者顔は正式データ接続を使用し、9種のみ未承認制作物として明示する。

## 残件・供給待ち

| 区分 | 残件 | 完了扱い |
|---|---|---|
| 正式データ | `game04_redesign_master` の投入版は `PREVIEW_PROVISIONAL_20260920_v1`。本体は同じIDを持つ `RAID_MASTERS`へ接続済み。正式承認版への昇格は未完了 | UI接続完了、正式承認版の投入待ち |
| 素材 | 承認モックと同一の専用レイド背景が未納。GAME03市街地背景への代用はしていない | 専用背景のみ未完了 |
| 素材供給 | `public/ui/raid/` のSVG9種は比較用の未承認制作物。正式共通アイコン供給後に差替え | 未完了。正式採用済みとして扱わない |
| QA検証 | Mock RPCに `get_quest_raid_bonus_v1` の未処理呼出しが残る。PGRST202相当では画面表示を阻害しないが、console clean受入にはQA stubまたは正式RPCが必要 | 未完了。機能接続残件 |

## 検証コマンド

- `npm run typecheck` PASS
- `NEXT_PUBLIC_USE_MOCK_DB=true NEXT_PUBLIC_APP_ENV=development npm run build` PASS
- 既存全体lintは本変更外の既存エラーを含むため、リリース判定には使用していない。今回変更ファイルは対象lintでエラーなし。
