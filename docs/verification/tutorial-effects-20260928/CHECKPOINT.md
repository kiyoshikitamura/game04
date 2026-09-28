# チュートリアル演出接続 — 2026-09-28

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
進行中。対象はopening QAから明示的に有効化する演出のみ。台詞・戦闘記録・音源／音発火条件・通常ゲームのデフォルトを保持する。

## 3 検証
未実施。375/390px、通し進行、一時停止／再開、倍速、リスタート、画像読み込みエラー／再試行、低減モーションを対象にする。

## 4 配信
未実施。main/Production/DB/APIの書込みなし。固定Previewと配信SHAを完了時に追記。
