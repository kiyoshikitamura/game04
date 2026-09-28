# チュートリアル演出接続 — 2026-09-28

追加指示によるフォント・時間・連撃順の更新は [REVISION.md](./REVISION.md) を参照。以下は初回配信時の記録。

## 1 素材確認・復旧（完了）
- 元Preview: https://game04-czlj0ozdr-kiyoshi-kitamura.vercel.app/qa/tutorial-opening
- 保存SHA: 536db8e15853971da652bc5a5f008b1f9e020262 / work/game04-tutorial-trailer-20260928。
- Production: game04-9ybvkxqmb-kiyoshi-kitamura.vercel.app、main a83a94adf1c83ecfdaf439d67a6d74aa93206344。
- 共通PR37後続2c8bb1a8、ブランド並走80693aff、mainの命名資料を履歴ごと専用ブランチへmerge。旧サンプルから丸ごと上書きしていない。
- 専用ブランチ: codex/tutorial-effects-20260928。取得・保存は認証済みGit、Previewは既存Vercel Git連携／認証済みCLI。
- ローカルG3 checkoutのdirty差分はガチャ／API関連で対象外。Work cloudの未保存ファイルは取得不能。利用できたGit成果と今回ZIPから続行。
- Vercel connectorは引数schema不一致／404のためCLIへ切替。CLI更新確認workerのtimeoutはNO_UPDATE_NOTIFIER=1で回避。新規cloneのGit identity未設定は既存コミットの公開noreply identityをリポジトリローカルへ設定。
- SSRはHTML内charactersの明示名→既存local-charactersの完全一致名→キャラID。名前入り透過PNGをHTMLから無加工抽出。単独PNGとバイナリが異なるものもあり、無名ファイルを推測割当せず、実際にモックが使う名前付き定義を採用。assets.jsonにhashを保存。
- 配置は付属設定書の115%／上端17%／スキル名45%。仮の「テストテスト」は使わず既存の記録済みスキル名を表示。
- 連撃1〜5は内包ZIPから無加工抽出。モックの-20度／360ms popを再利用。既存の連撃数とlead-inタイミングを使う。

## 2 実装・保存
完了。素材保存794952e1、実装保存916b06771b0fc3bd6ed7e7501923779305201998。対象はopening QAから明示的に有効化する演出のみ。

- `BattleView.tsx`: opt-in `tutorialEffects`、結果全体の画像decode gateへの追加、記録のaction_startへSSR表示、既存combo lead-inへ新画像表示。
- `InkBurst.tsx`: opt-in時だけ旧連撃文字を非表示にして重複を防止。BURST本体は保持。
- `battle-effects/TutorialSkillEffects.tsx`、`tutorialEffects.ts`、`tutorial-effects.css`、`tutorial-cutins.json`: ID対応、3200msカットイン、停止／倍速に追従するアニメーション、対象位置に応じた連撃表示。端末幅に収める位置clampあり。
- `qa/tutorial-opening/TutorialOpeningPreview.tsx`: 冒頭・模擬戦の2呼出しで有効化。
- `public/battle-effects/tutorial-opening/`: 10キャラ／1〜5連撃、計15透過PNG。
- スキル演出を最後まで表示するため該当action_startのみモックの3200msを最低表示時間に設定（既存倍速で短縮）。記録の行動順・HP・結果・台詞・音の発火条件は保持。連撃lead-inの既存650msは変更なし。
- 元サンプルから `src/domain/redesign/tutorial`、`src/audio`、`useRecordedBattlePlayback.ts` のdiffなし。DB/API・マスター・課金・認証の変更なし。通常戦闘は既定false。
- 追加画像の取得失敗時は既存の再試行画面へ接続し、未読込のまま進行させない。

## 3 検証
完了（ブラウザのモバイル相当表示）。物理端末でのユーザー確認は別。

- `VERCEL_ENV=preview npm run check`: typecheck、共通UI静的契約、既存API bundle整合、Next build PASS。配信先ビルドもREADY。
- agent-browserで元サンプル／ローカル対象ページのロード・操作要素・スクリーンショット・エラー確認。
- `scripts/verify_tutorial_opening_effects.cjs`: ローカル390×664、固定Preview375×664、固定Preview390×664＋reduced-motionの3通しPASS。
- 冒頭: 豊臣→徳川→伊達→上杉→武田→豊臣×3→織田、SSR計9回を記録フレームに1回ずつ。連撃1/2/3も各1回。旧表示との二重表示なし。敗北から台詞へ自動遷移。
- 名前→編成→模擬戦: 伊達SSR1回、R初期武将にはSSR素材を割当なし、連撃1/2/3、勝利→別れ→終了→リスタートまでPASS。
- 停止中の記録フレーム・アニメーション時間の保持、途中2倍速への変更、終了後のoverlay除去、リスタート時の新しい再生を確認。
- 115%／17%／45%をDOM寸法で確認。375/390pxの横溢れなし、取得画像のdecode成功。カットイン／連撃スクリーンショットを目視確認。
- `scripts/verify_tutorial_effect_recovery.cjs`: 配信先で1画像を意図的に失敗→frame0保持→再試行→正常再生、連撃中の停止／再開、カットイン中reloadによるキャンセルを確認。
- pageerror 0、正常通し時HTTP400以上0。音源と音イベント処理は無変更（音の聴感評価は物理端末で未実施）。
- 証拠: browser/、preview/、preview-reduced/、recovery/のJSONとPNG。

検証範囲外: 今回の記録に存在しない4/5連撃および未登場SSR4名は素材対応・実ファイルを保存済みだが、演出を見るための戦闘／編成変更はしていない。通常ゲーム全体の受入は対象外。

## 4 配信
完了。Git push→既存Vercel連携。
- 固定実機確認URL: https://game04-8w8sz2q5o-kiyoshi-kitamura.vercel.app/qa/tutorial-opening
- Deployment: dpl_G7tVpMGVVMPqaFSMmHVqLFDycZWm / Preview READY。
- 配信SHA: 916b06771b0fc3bd6ed7e7501923779305201998。
- main a83a94ad、共通2c8bb1a8、ブランド80693aff、元サンプル536db8e1のremote headsが作業中に変わっていないことを最終照合。
- main/Production/DB/APIの書込みなし。ProductionのQAガード保持。統合時は上記opt-in表示差分を現在の共通BattleViewへmergeし、古い本体ファイルで上書きしない。
- 未完実装なし。物理端末上の表示・音の最終確認は上記URLから行う。
