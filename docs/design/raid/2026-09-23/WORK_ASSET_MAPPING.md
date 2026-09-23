# GAME04 レイド素材対応表（Work統合）

基準：`5963698663e96bfa909c0cbb3b7c45c5db21f2ef`。視覚正本：`raid-approved-mock.png`。

## 承認状態

以下の新規16点は、ユーザーの不足素材制作指示に基づいてWorkで制作した**未承認候補**。制作完了・ファイル存在・透過確認を、正式アート承認または本体の視覚受入完了とは扱わない。旧SVGは削除せず保存する。最終の統合一式に含め、個別アイコンの確認往復は求めない。

## 既存正式素材

| 対象 | 対応元 | 使用方針 |
|---|---|---|
| 武将名・ID・人物画像 | `src/theme/sengoku-characters.json` | 武将名→characterId→imagePath。正式武将を使用し、モック人物を架空キャラとして追加しない |
| 武将戦闘画像 | `public/creative/characters/battle/{characterId}.png` | 既存の正式60体。元画像比率を維持 |
| 開催者顔 | 実APIの開催者ID・編成リーダー | 閲覧者・レイドボスへ置き換えない |
| 既存6属性 | `public/creative/ui/element-{fire,water,wind,earth,light,dark}.png` | 横長・文字入り。丸型素材とは異なるため、レイド用丸型候補を別パス制作 |

ホーム背景 `public/bg/sengoku/*`、キャラ背景 `public/creative/backgrounds/*`、ホームアイコン `public/ui/sengoku/*` は、レイド不足の穴埋めに流用していない。GAME03素材の流用もしていない。

## 新規候補の接続パス

| 用途 | 公開パス | 図柄 |
|---|---|---|
| レイド専用背景 | `/bg/raid/raid-castle-moonlight-v1.webp` | 月夜の城・桜・灯籠。人物なし。モック夜景の配置を参考に新規制作 |
| 残り時間 | `/ui/raid/v2/clock.png` | 金色時計・透過文字盤 |
| 参加者 | `/ui/raid/v2/people.png` | 金色の3人 |
| 敵情報・ダメージ・挑む | `/ui/raid/v2/swords.png` | 交差する刀 |
| 報酬 | `/ui/raid/v2/scroll.png` | 金色巻物 |
| 救援 | `/ui/raid/v2/handshake.png` | 金色の握手 |
| 終了・未受取報酬 | `/ui/raid/v2/chest.png` | 赤漆・金装飾の宝箱 |
| 挑戦数 | `/ui/raid/v2/armor.png` | 金・黒の和甲冑 |
| 勝利数 | `/ui/raid/v2/victory.png` | 金色の勝利旗・台座 |
| 3勝資格 | `/ui/raid/v2/medal.png` | 二重金縁・桜紋の丸形メダリオン。旧紫リボン・星を廃止 |
| 火属性 | `/ui/raid/v2/element-fire.png` | 赤の丸形・炎 |
| 水属性 | `/ui/raid/v2/element-water.png` | 青の丸形・波 |
| 風属性 | `/ui/raid/v2/element-wind.png` | 緑の丸形・風 |
| 土属性 | `/ui/raid/v2/element-earth.png` | 黄土の丸形・岩 |
| 光属性 | `/ui/raid/v2/element-light.png` | 金白の丸形・光 |
| 闇属性 | `/ui/raid/v2/element-dark.png` | 紫の丸形・影炎 |

新背景は共通レイド背景の候補であり、Master上の城別・エリア別背景として正式決定したものではない。火属性レイドを炎景色へ変えるなど、素材都合の仕様追加はしない。

## 制作・検査

- built-in image_genを使用。CLI fallbackなし。1素材1生成。
- UIは透過PNG、人物・文字なし。属性名は画像に焼き込まず表示層で正式データを使う。
- 原生成物を保持。公開用UI15点は256px角PNGへ等比縮小・alpha保持、背景は1536×1024 WebP（品質88）へ軽量化。既存画像の上書き・切り抜き流用なし。
- サイズ・SHA-256・透過・描画範囲は `WORK_ASSET_MANIFEST.json` に記録。
- 9図柄・6属性・背景の全16点目視検査実施。表示寸法での比較はA担当および統合Previewで実施。

生成指示共通：戦国ブラウザRPG向け、黒と金のUIに合う抑えた金属陰影、24pxで識別できる単独図柄、透過背景、文字・外枠・別物体を禁止。属性は色別の薄い丸枠＋暗色中心＋単一属性紋。背景は1536×1024の人物なし和城夜景、右寄りの城・満月・両端の桜・前景の人物合成余地。
