# GAME04 素材取り込み漏れの解消・クエスト再接続指示
日付：2026-09-23
状態：調査で素材取り込み漏れを確認。最優先で素材と表示部品を揃え、その後クエストの承認モックを再現する。
本Commitは指示書と不足ファイル一覧の保存。実装への素材取り込み完了を意味しない。

## 1. 作業基準
- Repository：kiyoshikitamura/game04
- 調査対象実装SHA：72871abb48b789ec46f2c4fab311e5a876d6ffeb
- 対象Branch：codex/game04-quest-assets-layout-20260923
- 直近報告Preview：https://game04-eectgcfyg-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- 素材取得元Branch：codex/game04-local-assets-20260922
- 素材取得元固定SHA：efc8d54d188dcfc403b6c7c8e59e796ea1a5985c
- 承認モック：同階層 quest-approved-mock.png
- 前回修正指示：同階層 REWORK_ASSETS_LAYOUT_2026-09-23.md

開始時に実装Branchの最新状態と並走差分を確認する。素材Branch全体へのreset、古い画面コードの一括上書き、強制Pushは禁止。
Gitにある素材を使う。ユーザーへの再添付依頼・再制作・代替画像生成は不要。

## 2. 調査済み事実
両SHAのGitツリーを省略なしで照合した。
取得元public/creative/には216ファイル、実装側には属性6画像のみ。以下210ファイルが実装側の同パスにない。

|分類|欠落数|
|---|---:|
|カード用キャラ|60|
|汎用キャラ|60|
|バトル用ディフォルメキャラ|59|
|カード／正方形枠|8|
|背景|10|
|演出HTML|10|
|KV／ロゴ|2|
|領土侵攻札|1|
|合計|210|

具体的な全パス・取得元Git Blob SHA・ファイルサイズは [ASSET_IMPORT_MISSING_2026-09-23.json](./ASSET_IMPORT_MISSING_2026-09-23.json) に保存。新しい実装で既に取り込まれたファイルは再度欠落扱いしない。
この210件はpublic/creative/のパス差分。全素材501件の完全な内容一致やPreviewでのHTTP状態を確認済みという意味ではない。

以下も調査対象実装にない：
- config/game04-local-characters.json
- src/theme/local-characters.json
- src/app/components/redesign/CreativeCharacter.tsx
- src/app/components/redesign/HomeEffect.tsx
- config/game04-local-creative-review.md

一方、src/app/components/redesign/creative.css と src/theme/local-skills.json は両ツリーで同じBlob。既にあるCSSやスキル対応表を不用意に置き換えない。
config/game04-local-other-assets.json は実装に存在するが、その記載先のKV2・背景10・枠8・演出10・領土侵攻札1、計31ファイルがないことを確認した。
したがって「素材対応表にある」「CSSがある」「名前や属性画像が表示された」だけでは取り込み完了ではない。

## 3. 実装作業
### A. 素材を先に取り込む
固定取得元SHAをfetchし、不足JSONのパスを使用して、最新実装側へ不足ファイルを追加する。
既存ファイルは取得元とBlobを比較。同一は保持。内容が異なる場合は変更理由・新しい承認成果を確認してから判断し、取得元で無条件に上書きしない。
一覧の210件は、文字列の末尾やフォルダ名で推測した別素材に置き換えず、取得元の同じパスの実ファイルをコピーする。バイナリを再圧縮・再生成しない。
既存の属性6画像も取得元と照合して報告する。勝手にGAME03系画像へ戻さない。

### B. 対応表・表示部品を統合
欠落したキャラ対応表・theme対応表とCreativeCharacterを取得元から確認し、必要な依存を最新実装へ統合する。
HomeEffectと組み込み記録も取り込み対象を確認する。保存はよいが、クエスト改修を口実にHome演出の条件や用途を古い仕様へ戻さない。
既存ElementBadge、creative.css、クエスト改修、共通Header/Footer/Dialog、正式データ接続は保持する。共有部品に変更が必要な場合は意味を確認して限定統合する。
既存の全身60画像などpublic/creative/外のファイルも、キャラ対応表が示す参照先を検査する。存在するだけで新素材と同一と断定せず、取得元とのBlob差分を確認する。
過去のconfig/game04-local-creative-review.mdを取得しても、その完了記録を現在の実装に対する検証結果として扱わない。今回の取り込み結果を新たに記録する。

### C. 正しい素材をクエストへ接続
- エリア／カード背景：既存の対応する背景。
- ボス：バトル用ディフォルメ画像。全身立ち絵で代替しない。
- 編成カード：カード用画像＋実レアリティ枠＋属性バッジ。
- Header：顔の見える汎用画像、Lv重ね。
- 詳細：用途に合うキャラ画像と正式情報。
- スキル／報酬：既存対応表にあるアイコン。
素材が揃った後、承認モックと前回修正指示に沿ってサイズ・位置・余白・重なりを整える。
存在しないURLを別画像へfallbackして欠落を隠す実装があれば解消する。仮のCSS枠や全身画像への退避を完成形として残さない。
不足バトル画像1件（明智光秀の候補）はユーザー供給予定。59件の既存素材取り込みと区別し、未使用SSRサンプルは割り当てない。

## 4. 完了確認
1. 全210パスについて追加／既存一致／差分保持と理由を記録し、取得元Blobと実装Blobの対応を保存。
2. キャラ239件とその他262件の対応表を基準に参照先を検査。件数が最新正本で変化していれば理由を記録。接続件数は最終採用承認数ではない。
3. 専用Previewで今回追加した素材URLを取得し、画像は画像として、演出HTMLはHTMLとして正常取得できることを確認。SPA代替HTMLを画像の取得成功と数えない。
4. 5画面＋ヒント＋報酬詳細を同じ390×844で撮影し、実画像を開いてモックと比較。長い報酬詳細は末尾も確認。
5. Typecheck／Build、詳細往復と必要な状態保持、小型画面の可読性・操作到達を確認。
6. 正式65面・Wave・敵・報酬・編成・共通SP400等が維持されていることを確認。

「素材追加完了」「クエスト接続完了」「モックとの視覚照合」「ユーザー受入」を別の状態で報告する。実機総合受入は領土侵攻まで完了後だが、既知の欠落を実機確認待ちにして完了扱いしない。

## 5. 提出物と制約
日本語の取り込み結果・パス別照合JSON・7画面の比較をGitへ保存し、完全な実装SHA、Branch、固定Preview、Git固定リンク、残件を返す。ローカルWindowsパスや添付で引き渡さない。
Production公開・mainマージ・GAME03変更なし。Battle Rule・Balance・Master数値・Economy変更なし。並走のShop・Menu・Mission・Header等を保持する。
