# レイド承認モック比較・検証対象

指示SHA: `20f87f9a81b235a15eab6111237d8d18c665e569`

| 対象 | 固定画像 | 確認内容 |
|---|---|---|
| 承認3面 desktop | `raid-approved-preview-1536.png` | 一覧・詳細・詳細下部の配置、余白、画像サイズ、装飾 |
| 承認3面 mobile | `raid-approved-preview-390.png` | 390px幅での折返し、カード画像、下部ナビ |
| 本体一覧 | `raid-body-top-390.png` | 正式敵・開催者・属性・HP・参加者・残り時間順・分類タブ |
| 本体詳細 | `raid-body-detail-390.png` | 開催者、HP、参加者、詳細アクション、挑む導線 |
| 本体詳細下部 | `raid-body-detail-lower-390.png` | 貢献、報酬資格、行動力CTA、下部余白 |

画像はこのコミットにバイナリとして保存し、実装・検証記録と同一SHAで参照できる状態にする。属性画像は `public/ui/rarity/attribute-badge-*.png` の正式既存素材を使用し、レイド専用9 SVGは未承認制作物として扱う。
