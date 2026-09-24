# 型・ビルド・変更範囲

## 基準

- Repository: kiyoshikitamura/game04
- 基点: UI統合PR #28、`1d426a6fc9a2a7e8d9ea6ae2d8fd6184bc80881d`
- 専用Branch: `work/game04-battle-finish-20260924`
- PR: https://github.com/kiyoshikitamura/game04/pull/29
- 共闘・武将・本陣・出陣・侵攻等を含む統合成果を基点とし、過去の資料保存コミットへ巻き戻していない。
- 表示、記録再生接続、16系統演出、独立検証をサブエージェントで分担。親が保存・配信を集約。

## 実施結果

|検査|結果・範囲|
|---|---|
|TypeScript|全体 `npm run typecheck` PASS|
|ローカルBuild|Preview設定の `next build --webpack` PASS|
|Vercel Build|専用BranchのGit連携によるPreview配信成功。具体的なSHA・Deploymentはdeployment.json|
|記録投影|命中・回復・多段・overkill・状態不成立・Wave切替・保存結果の非破壊を確認|
|演出分類|16系統の定義、対象範囲、付与成功差分、付与失敗時の非表示を確認|
|戦闘入力|合成7シナリオ、最大6Wave、敵初期SPと上限SP分離、HP/SP範囲を確認|
|正式入力|7-7・9-9を承認済み入力とseedで再計算。ブラウザ実測は別記録|

ローカルの標準Turbopack buildは共有依存へのシンボリックリンクを拒否したため、同じNext.jsのwebpack buildで検証した。リポジトリのbuildコマンドや配信設定は変更していない。VercelはGit上の通常構成でビルドしている。

## 保持した仕様

- 戦闘エンジン、能力値、効果、報酬、消費、保存済み戦闘入力は未変更。
- 共通SPと独立BURSTゲージを保持し、BURSTは自動発動。
- 倍速・SKIPの既存VIP条件を保持。
- DB／Edge APIの配信変更なし。Production変更・mainマージなし。

## 検証区分

本体コンポーネントを使うQA、正式入力の再生、接続ソース確認、認証付き実APIは区別する。
QA合成入力の成功を実APIの決済・永続化の確認と扱わない。今回の認証付き実API・DB保存行の実測は未実施。

## Previewで発見し修正した問題

- 既存SKDの未割当画像 `/menu/event_banner_placeholder.png` は `.vercelignore` により配信対象外だった。画像読込待機が止まるため、既知の未割当パスのみ効果種別SVGへ表示解決した。任意の画像失敗は引き続き再試行案内へ進む。
- 敵の全身縮小表示を、正式素材の上半身を大きく見せる構図へ変更。
- 詳細・ログの背面タップ閉じを廃止し、native dialogで背面操作・スクロール・フォーカスを制御。
- 状態付与元などの内部IDをユーザー向け名称に置換。

最終のモック比較・操作結果・残件は同ディレクトリの検証記録に記載する。

- 装備スキルが1個でも3枠基準の幅を保持。
- 全体テーマの強制明朝体ルールとの競合を、battle内の共通フォントtokenで解消。
