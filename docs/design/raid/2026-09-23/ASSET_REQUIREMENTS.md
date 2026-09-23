# レイド 素材対応・制作候補
2026-09-23／承認モック実装時点の対応表。
基準：raid-approved-mock.png。主指示：README.md。

| 用途 | モックの図柄 | 状態 |
|---|---|---|
| 残り時間 | 金色の時計 | `public/ui/raid/clock.svg`を制作・接続。24px表示、透過SVG。正式共通素材への差替え対象 |
| 人数・参加者 | 人物グループ | `public/ui/raid/people.svg`を制作・接続。25–28px表示、透過SVG。正式共通素材への差替え対象 |
| 敵情報・挑戦・ダメージ | 交差する刀 | `public/ui/raid/swords.svg`を制作・接続。25–46px表示、透過SVG。正式共通素材への差替え対象 |
| 報酬 | 金色の巻物 | `public/ui/raid/scroll.svg`を制作・接続。25px表示、透過SVG。正式共通素材への差替え対象 |
| 救援 | 握手 | `public/ui/raid/handshake.svg`を制作・接続。25px表示、透過SVG。正式共通素材への差替え対象 |
| 終了・未受取報酬 | 赤と金の宝箱 | `public/ui/raid/chest.svg`を制作・接続。34px表示、透過SVG。正式共通素材への差替え対象 |
| 挑戦数 | 小さな鎧 | `public/ui/raid/armor.svg`を制作・接続。19px表示、透過SVG。正式共通素材への差替え対象 |
| 勝利数 | 金色の勝利意匠 | `public/ui/raid/victory.svg`を制作・接続。19px表示、透過SVG。正式共通素材への差替え対象 |
| 報酬資格進捗 | 丸いメダリオン内の意匠 | `public/ui/raid/medal.svg`を制作・接続。18–28px表示、透過SVG。未達／達成状態の正式差替え対象 |
| 通貨・行動力 | 正式な銭・輝石・行動力 | 既存接続確認 |
| 属性 | GAME04正式6属性 | モックの簡略図を新正本にしない |
| 開催者顔 | 対応キャラの正式顔クロップ | 開催者データ接続確認 |
| ボス・背景 | 正式武将と対応背景 | 素材対応確認 |
| Header／Footer | 共通正式アイコン | 既存接続維持 |

採用元：ボス／背景は`src/domain/raidTopAssets.ts`経由の正式canonical素材、開催者顔は開催者IDに紐づく表示データへ接続する固定Preview実装。今回制作した9図柄は承認モックに不足していた専用図柄であり、正式アート監修済み共通アイコンではない。Production公開前に共通素材担当が正式版を供給し、同一パスまたは明示マッピングで置換する。

比較画像：`comparison/raid-approved-preview-1536.png`、`comparison/raid-approved-preview-390.png`。固定Preview：`/qa/raid-approved`（Mock環境のみ）。
不足はユーザー側の制作へ渡せる具体的な依頼にする。無理な代用・無断生成・装飾省略はしない。
