# 領土侵攻 UI 素材・正式データ対応表

## 表示と素材

|対象|参照先|扱い|
|---|---|---|
|開始・中間・最終の敵|`TerritoryProjection.destinations[].raidMaster.stages` → `raidEnemy` → `characterArt`|正式人物・正式能力値。開始は抽選前の代表編成|
|敵立ち絵・顔|`src/theme/local-characters.json` の card／portrait|既存60武将画像を再利用。画像内例示の人物を固定しない|
|侵攻令|`public/creative/items/territory-invasion-ticket.png`|既存正式アイテム素材|
|城・侵攻背景|`public/bg/raid/raid-castle-moonlight-v1.webp`|共闘採用済み共通背景を使用。城ごとの専用史実外観とは扱わない|
|城アイコン|`public/ui/sengoku/08-castle.png`|既存素材|
|属性|`public/ui/raid/v2/element-{fire,water,wind,earth,light,dark}.png`|クローズ済み共闘の採用素材を再利用|
|報酬|`public/ui/sengoku/13-coin.png`、`public/items/skill_manual.png`、`public/items/equip_lb_part.png`、該当武将portrait|正式報酬種別へ接続。未知の報酬種別は文字のみで示し、無関係な画像を補わない|

## 正式接続

|城 ID|侵攻先|必要主催者 Lv|最終クリア主催者 EXP|選択する侵攻段階|
|---|---|---:|---:|---|
|TI01|岡崎城|1|100|1 / 6 / 12|
|TI02|長浜城|2|150|1 / 6 / 12|
|TI03|春日山城|4|250|1 / 6 / 12|
|TI04|躑躅ヶ崎館|6|400|1 / 6 / 12|
|TI05|安土城|8|600|1 / 6 / 12|

上表は既存主催仮 FIX の索引。画面数値は API の `TerritoryProjection` を使用し、この文書や UI で上書きしない。選択する侵攻段階と `enemy.level`（戦闘武将 Lv）は別の値。

中間の段階 6 は、全 12 段階の中央値を閲覧代表として暫定選択する UI 上の処理であり、ユーザーが中間段階を正式指定した扱いにはしない。選択ロジックを表示 helper に分離しており、指示後に変更可能。Master・抽選・実戦進行は変更しない。

開催前の通常戦は `createFormalInvasionMaster(..., () => 0)` による代表編成で、実際は開催時に抽選され、開催 snapshot に固定される。開始の画像・能力値は代表表示として明示する。中間 6・最終 12 の固定編成は正式 stage に接続する。各段階の報酬は該当 `stage.defeatRewards` に接続し、開始段階報酬を最終報酬として流用しない。

新規画像は生成していない。共闘本体・既存開催・正式抽選・API・報酬処理は本 UI 作業で変更しない。
