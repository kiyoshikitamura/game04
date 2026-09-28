# GAME04 クエストUI・正式データ調査記録

基準：`codex/game04-round17-acceptance-20260922` の正式65面実装を保持し、指定資料Commit `aba027923854c5cb052c0a5fa4bf00658ae892e6` の承認モックだけを参照・保存した。

| 確認点 | 期待値 | 実値／原因 | 修正・反映先 |
|---|---|---|---|
| 1-1の敵表示 | 正式65面の `1-1/W1/*` とcharacter binding | `quest65.json` は女侍・漁師、bindingは `char_long_01`・`char_naoto_01`。`questMaster.ts` がIDと名前を検証し画像だけ既存素材から解決 | 挑戦前UIは正式Stageの最終Waveを表示。独自の豊臣固定値・人物補完は追加しない |
| Wave・ボス表示 | 最終Waveの全敵を主役表示 | 旧UIは全Waveを同じ強さで列挙し、最終Waveの意味が弱かった | `QuestView.tsx` で最終Wave全員を表示。正式Wave数・HP・属性を使用 |
| 報酬 | 正式Stageの初回・通常・レア報酬 | `questVictoryRewards` が正式Stageを入力に抽選。仮UIは報酬を常時展開 | 報酬確認ボタン内へ移動。正式名称・数量は既存ラベル解決を使用 |
| 進行 | 正式65面、前面クリアで解放、先の未解放を過剰開示しない | `FORMAL_QUEST_STAGES` は10エリア（3/4/5/5/6/6/8/8/10/10）。一覧UIは従来全エリアを表示 | エリア一覧を攻略可能範囲＋次の未解放1件に制限。保存済み進行は変更しない |
| 戦闘開始 | 表示と実戦が同じStage/Wave/版 | QA経路は `createQuestBattleInput` → `simulateBattle`、正式マスタ版を付与 | UI側の表示経路は変更したが、battle input・数値・DB/Edgeは変更しない |
| 準備画面 | 5人、既存画像/属性/Lv/HP、合計SP | 5人表示は既存。文言が「パーティ共通SP最大値」、行動力重複説明が残存 | 「合計SP」に変更し、挑戦前と重複する大量の行動力注意を削除。編成変更・詳細遷移は維持 |

## 反映範囲

- 正式データの接続修正：最新実装Branchに既存の65面接続を採用。今回のUI変更では数値・enemy ID・reward master・Edge bundle・DBを変更していない。
- UI変更：`src/app/components/redesign/QuestView.tsx`、`QuestView.css`、`PreparationModal.tsx`。
- 承認資料：`docs/design/quest/2026-09-22/` を資料Commitから対象ディレクトリだけ取り込み。
- Preview：QA用 `/qa/redesign?view=quest` のローカルPreviewビルドで確認対象。Supabase実DBの反映・Production公開・マージは本作業の対象外。

## 検証

- `npm run typecheck`：成功。
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`：成功（26 routes生成）。
- 通常環境のBuildはSupabase環境変数未設定のため `/auth/callback` prerenderで停止。UI変更とは無関係で、Preview mock DB buildを正式な今回の確認結果とした。
