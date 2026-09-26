# 共通Previewへの統合引継ぎ

## 状態と残件

計算比較68/68面を維持し、10-3・7-7の局所短縮を採用。時間の合格秒数は未設定のまま。実測改善を提出し、最終時間受入・実機監査・G5は未通過として引き継ぐ。共通Preview/API/DBには未反映。

- 8-7: 回復反復を含む222.52秒。今回測定のみ、敵無変更。次に対応する場合はseed441168の各Waveの回復/低ダメージ区間から回復源・HP/DEFを局所調整し、当該面だけ5帯・技能非依存・全役割・停滞を再確認する。
- 2-5: 全体技74回・BURST10回を含む158.47秒。今回測定のみ、敵無変更。敵耐久とSP供給の反復を分けて判断する。演出省略・速度変更は今回の敵調整に含めず、必要なら別案として扱う。
- 7-7: 対象例は134.72秒へ短縮。ただし保存検証編成の最大274行動の別例は未実測。旧0勝編成の最大行動も150→181へ増えている。
- 10-3: 対象例は115.10秒へ短縮。保存検証編成の長い別seedは面別allValidatedを参照。対象例の短縮だけで面全体の体感受入を閉じない。
- 過去測定を含め未測定60面。全件実再生は不要。risk-screen.jsonの高行動・回復・技能反復上位を優先し、入力一致の勝率証拠を再計算しない。

## 取り込む差分

1. `src/domain/redesign/data/quest65.json`: 7-7/4/1、10-3/3/1、10-3/3/2の5フィールドオブジェクト。変更前後はenemy-patch.json。報酬・配布44箇所・ステージメタデータは基準f9a8fd2と一致。
2. `src/app/qa/stage68-local/Harness.tsx` と `fixture/route.ts`: development限定の今回fixture読込と実装版記録。ゲーム共通のBattleView・演出・再生速度は変更なし。
3. `scripts/stage68_duration_*.mjs` と今回証拠: 残りから再開可能。旧ディレクトリを上書きしない。
4. `supabase/functions/game04-redesign-api/index.ts`: 専用ブランチの最新sourceとマスターから生成した照合用候補。**これを共通APIへ丸ごと上書きしない。**

APIソース変更は今回なし。DBスキーマ/データmigrationもなし。クエスト敵マスターを含むため、統合後APIのbundle再生成は必要。API/DB/共有Previewへの反映はデバッグ統合担当に一本化。

## 並走成果の保持

確認時の共通ブランチ `work/game04-common-preview-20260925` は **deaf64e6ead31803fc09cb0d4322d936f7ea3d9d**。以前の067fe54以降にe09917a・5c36061・deaf64e6が追加され、共通UI消費側、失敗/入口状態、共有dialog、context依存の修正と検証資料がある。今回確認した範囲でbattle/masters/BattleView/APIソースの差分はない。共通側のUI・context・報酬claimのSQL等を保持し、今回の古い全体ファイルで置き換えない。

旧監査ブランチ `work/game04-stage68-audit-20260926` は **645512d94b918ecbe0a205085696baecaa6353f0**。新規後続更新なし。統合直前に両ブランチを再確認する。

## 統合手順

1. 共通の最新ソースを基点とする統合用ブランチで、PR #40の既存採用差分を確認。その上で今回の敵3体・QA・証拠を取り込む。main・本番・GAME03へ直接変更しない。
2. quest65.jsonに別変更があればenemy-patch.jsonのbeforeを照合し、敵ID/field単位で解決。報酬/進捗・共通ルールは維持する。静的マスターの全体上書きはしない。
3. source.tsと依存ファイルを統合した後、`node scripts/build_stage68_api_candidate.mjs <新しい検証出力先>` でAPIバンドルを再生成。今回のapi-bundle-manifest.jsonをコピーして合格扱いにせず、統合版のmanifestを別保存する。
4. `node scripts/verify_game04_redesign_api_bundle.mjs`、アプリ対象型検査、配布/報酬/進捗チェック、今回2面の保存入力と統合マスターの戦闘一致を確認。ソース/入力が変わった場合だけ必要範囲を再検証する。
5. 統合UIで今回fixture/seed・3倍速・導入解除/再開〜最終フレームを再測定。端末差・UI差を記録し、今回ローカル値を本番保証値にしない。共有Preview確認と実機/G5は統合担当の工程。

## 保存と再現

- 基準: f9a8fd27caac0f19c9180cfe01abe4c26cece9ca。
- 途中: 9320972b80f6557afde5713969088ad4332f8c90（7-7候補成立、10-3途中、リスク選定）。
- 最終SHAはPR #40の最終報告を参照。この資料を含むcommitへ自己参照SHAを埋め込まない。
- Node24で `--import ./scripts/stage68-loader.mjs` を使用。採用元は7-7がfill-candidates、10-3がfill-wave3。complete/passedと面別selectionを確認して再開。
- `stage68_duration_apply.mjs --apply` は基準または前回集約hashとの一致を確認して専用ブランチ内で適用する。並走したマスターを黙って上書きしない。
- `stage68_duration_report.mjs` は保存証拠・実測を照合して資料を再生成。勝率の再試行なし。
- QA URL: `/qa/stage68-local?case=duration-10-3-after`、`duration-7-7-after`、`duration-8-7-risk`、`duration-2-5-risk`。fixtureは全入力・seed・結果・実装版を含む。
- 8-7の最初の未完了測定は値を採用せず、開始状態を確認して再測定した。確定記録だけをplayback-measurements.jsonに収録。
- アプリ対象型検査は通過。全リポジトリ型検査の既存アーカイブdeployed-api-v8.tsの型エラーは今回対象外・未修正。
