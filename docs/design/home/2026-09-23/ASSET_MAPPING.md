# 本陣 素材対応表

2026-09-24。本陣承認モック `ec3cc023835906101e7213cdceabdb34eb652a80` と既存正式素材を照合。新規ラスタ画像制作は 0 点。モックの仮数値・人物名・活動文を本体へ固定しない。

| 用途 | 既存ID・保存先 | 画像内容と使用方法 | 既存参照・正本 |
|---|---|---|---|
| 本陣の武将 | `characterArt(character, 'full')` / `public/characters/*_transparent_asset.png` | 正式な透過全身絵。縦横比を維持し人物領域内へcontain。選択武将を使用 | `src/theme/local-characters.json`、`creativeAssets.ts` |
| モック人物の対応確認 | `char_alice_01` / `alice_transparent_asset.png` | くノ一。モックと同一人物。固定選択にはしない | `src/theme/sengoku-characters.json` |
| 切替の武将 | `characterArt(character, 'card')` / `public/creative/characters/card/` | 所持武将の正式カード用透過絵。名前と選択状態は画像外に分離 | `local-characters.json` |
| 切替の武将カード背景 | `characterBackground(character)` | 承認済み武将別背景をカード領域内だけへ合成。本陣全体には流用しない | `src/theme/character-backgrounds.json` |
| 初期・既存背景 | `castle-approach`、`castle-town` / `public/bg/sengoku/` | 城門・城下町。モックと同一既存背景。旧保存IDも復元 | `src/domain/redesign/home.ts` |
| エリア背景10点 | `area:${area.id}` / `QUEST_AREAS.image` | 出陣エリアと同じ正式背景。解放済みエリアに連動 | `src/domain/redesign/quests.ts`、`src/theme/local-backgrounds.json` |
| 背景演出10点 | `public/creative/effects/*.html` | 選択背景imageで一致した既存演出だけ使用。武将レアリティに依存しない | `HomeEffect.tsx`、`local-backgrounds.json` |
| 任務 | `02-scroll-top` / `public/ui/sengoku/02-scroll-top.png` | 金の巻物。小型アイコン＋任務 | 旧 `HomeTab.tsx`、`assets/home-icons/2026-09-16/manifest.json` |
| 商店 | `12-shop` / 同ディレクトリ | 金の商店。小型アイコン＋商店 | 旧 `Footer.tsx`、同manifest |
| 出陣の続き | `04-fan-sakura` / 同ディレクトリ | 桜の扇。共通Footerの既存出陣用途と統一。モックの鳥居を新規制作しない | `RedesignShell.tsx`、同manifest |
| 領土侵攻・共闘発生 | `05-crossed-swords` / 同ディレクトリ | 交差する金の刀。戦闘導線として使用 | 同manifest |
| 同盟ロック | `HomeLock`（inline SVG） | 灰色の錠前という操作状態記号。既存ラスタに錠前がないため機能記号で表現。別用途アイコンや絵文字に置換しない | `HomeView.tsx` |
| 活動者の顔 | `get_public_profiles`の`favorite_character_id` → 正式portrait | 実プロフィールで解決できた顔のみ表示。未取得時に無関係な人物を捏造しない | 旧 `HomeTab.tsx` の正式RPCパターン |
| 活動行DM操作 | `09-chat` / `public/ui/sengoku/09-chat.png` | 吹き出しを小型・灰色に調整し正式DMへ接続 | 同manifest |
| 桜装飾 | `public/ui/raid/v2/panel-sakura-overlay.png` | 既存透明桜装飾をDialog/CTA/薄型バナーの共通意匠として再使用 | 共闘承認素材 |
| 薄型ローテーションバナー | 選択武将の正式card＋桜装飾 | 既存本体の召喚／商店ローテーション・遷移を維持した画像合成 | `HomeView.tsx` |
| 共通Header/Footer | `public/ui/sengoku/` 既存19点 | 親担当で承認共通部品へ統一。モック間の扇・刀・召喚素材差は正式対応を優先 | `RedesignShell.tsx` |

## 不足・採用判断

- 新規ラスタ画像が必須の不足はなし。
- 同盟の錠前は状態を示す標準機能記号としてSVGを実装。新しいゲームアイコン素材の制作・追加ではない。
- モック固有の鳥居・円形任務の差異は、正式な既存扇・巻物を優先する明示要件を適用。
- モックの人物名・活動文・数値は比較用の表示例。本体には状態・正式RPCの結果を使用する。
- 旧2背景は画像内に桜が描かれているため、親担当の確認に基づき既存桜吹雪 `char_kaede_01.html` を再利用。新10背景は選択背景から既存演出へ接続する。武将選択・レアリティには依存しない。
