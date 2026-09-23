# レイド承認モック本体反映 検証記録

## 接続結果

| 境界 | 結果 | 接続先 |
|---|---|---|
| レイド本体トップ | PASS | `RaidRoomConnectedBrowser → RaidTop → RaidTopApproved` |
| ボス／背景 | PASS | `resolveRaidTopEnemy` / `CANONICAL_RAID_PRODUCTION` / canonical character & background assets |
| 開催者 | PASS | `RaidTopEntry.room.owner` の `userId` / `name` / `leaderIconUrl`。閲覧者・最後の参加者で代用しない |
| Room詳細 | PASS | `RaidRoomDetail`。`briefing`、`display`、`participants`、`room.hp`、lifecycle を既存 resource から表示 |
| 詳細アクション | PASS | 敵情報・参加者・報酬・救援を既存Dialog callbackへ接続 |
| 出撃 | PASS | 既存 `action` / `onBriefingReady` / `prepareRaidRoomBattle` 経路を維持 |
| 報酬・救援・プロフィール | PASS | 既存 `RaidRoomDialogs`、`RaidRoomRescuePanel`、profile callbackを維持 |

## 視覚確認

- 承認正本：`raid-approved-mock.png`
- 固定比較：`comparison/raid-approved-preview-1536.png`、`comparison/raid-approved-preview-390.png`
- 本体トップ：`comparison/raid-body-top-390.png`
- 本体詳細：`comparison/raid-body-detail-390.png`
- 確認ルート：`/qa/raid-top`、`/qa/raid-detail`、`/qa/raid-approved`
- Mock環境でHTTP 200、一覧3フィルタ、続きへ、詳細4導線、挑むCTA、390px表示を確認。

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

## 検証コマンド

- `npm run typecheck` PASS
- `NEXT_PUBLIC_USE_MOCK_DB=true NEXT_PUBLIC_APP_ENV=development npm run build` PASS
- 既存全体lintは本変更外の既存エラーを含むため、リリース判定には使用していない。今回変更ファイルは対象lintでエラーなし。
