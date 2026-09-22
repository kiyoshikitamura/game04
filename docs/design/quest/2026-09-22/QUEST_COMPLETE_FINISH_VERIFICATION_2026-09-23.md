# クエスト全体仕上げ 検証記録

- 指示SHA: `5989e4db85c521d68f2b57a045f3e0694874f398`
- 確定部品基準: `878dccc352ccf5bf0e9559288eb68a3ec97c62b7`
- 対象: エリア一覧、ステージ一覧、挑戦前、出撃準備、キャラ詳細、攻略ヒントDialog、報酬Dialog、および往復導線
- 正式データ: `src/domain/redesign/data/quest65.json` / `questMaster.ts` を変更せず使用

## 実装内容

- エリア一覧は正式エリア背景、攻略中／未解放バッジ、クリア・現在・直後の未解放だけを表示する既存解放条件を維持。
- ステージ一覧に正式エリア背景、正式 `stage.name`、番号メダリオン、接続線、状態アイコン／バッジを適用。`designId`は補助表示として保持。
- 挑戦前は最終Waveの正式敵を表示し、確定 `BossDisplay` を再利用。挑戦前Dialogの背景は正式エリア背景へ接続し、ボスの固定背景を戦場背景へ流用しない。
- Wave数、消費行動力、HP／ATK／DEF、属性、正式スキル表示は選択ステージのMasterから取得。例示値の固定なし。
- 攻略ヒントと報酬を独立Dialogで表示。報酬は正式アイコン、正式名称、数量、初回／通常／レア区分を維持。
- 出撃準備とキャラ詳細は確定 `CharacterCard` を再利用。正式人物・固定背景・枠・属性名・レアリティ表示を保持し、合計SP400、編成変更、主CTAの配置を維持。
- クエスト領域の通常UIを実適用Noto Sans JP、見出しをNoto Serif JPへ固定。Previewでcomputed styleとfont loadingを確認。

## Preview確認

- Preview: https://game04-qcjgb33c3-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- Deployment: `dpl_HgnnFTCTNK7xC6g4ZdwFLA2yvBtR`
- 状態: Ready / Previewのみ
- viewport: 390x844（全対象画面）／375x844（挑戦前代表）
- 実操作: エリア一覧 → ステージ一覧 → 挑戦前 → ヒント／報酬 → 出撃準備 → キャラ詳細
- `agent-browser errors`: なし

computed style確認:

| 対象 | computed font-family | 判定 |
| --- | --- | --- |
| ステージ行・通常ボタン | `"Noto Sans JP", sans-serif` | PASS |
| 挑戦前の補助UI | `"Noto Sans JP", sans-serif` | PASS |
| Dialog見出し | `"Noto Serif JP", serif` | PASS |
| `document.fonts` | Noto Sans JP / Noto Serif JP = `loaded` | PASS |

## Git保存証拠

- 一括比較: [quest-finish-comparison-20260923.png](./comparison/quest-finish-comparison-20260923.png)
- 390px全画面: `quest-finish-final-{01-area,02-stage,03-challenge,04-preparation,05-character-detail,06-hint,07-reward}-390.png`
- 375px代表: `quest-finish-final-375.png`
- 比較上段は承認モック、下段は同一Previewから取得した7画面。モックの仮表示名・仮数値は正式データへ置換せず、構図・枠・背景・バッジ・Dialog・CTAを照合した。

## 検証結果と残件

- `npm run typecheck`: PASS
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: PASS
- 全65ステージの正式敵データを照合。明智光秀のバトル素材1件だけは既定どおり供給待ちで、未使用SSRサンプル・旧素材・生成素材による代替はしていない。
- 明智光秀を含む該当ステージは、正式素材供給後に確定 `BossDisplay` の実画像表示を再確認する必要がある。これは今回の実装判断で埋めてはいけない不足素材として記録する。
- 低減モーション・非表示タブ停止は既存コードを保持。今回の検証では実動作確認済みとは記載しない。
- Battle／Gacha／Tutorial、正式Master数値、Battle Rule、Balance、Economy、Production、main、GAME03は変更していない。
