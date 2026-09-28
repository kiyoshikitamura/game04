# クエスト・共通UI 統合照合記録

指示SHA: `2018c9317b57806f8e54944a4d46bb287a6fc1c5`  
照合開始実装: `8c8bbeb3182fbecf77becbbc4df49f7f386f25ae`  
素材取得元: `efc8d54d188dcfc403b6c7c8e59e796ea1a5985c`  
共通ビジュアル正本: `d15abb6817b28413cc8b196a8c0177676543bf12`

## 一括照合表

|要件|正本パス／SHA|対象画面|実コンポーネント|画像URL／経路|照合時の問題|今回の対応|検証証拠|残件|
|---|---|---|---|---|---|---|---|---|
|色・文字・タップ寸法|`src/app/game04-visual-tokens.css` / `d15abb6`|共通UI|layout／redesign.css|`/fonts/game04/*`|トークンCSSが現行ツリー未接続|正本トークンCSSを限定取り込み、layoutから読込|typecheck／build／Preview|共通全画面の実機受入は別工程|
|Header顔・Lv|同上＋`src/theme/local-characters.json` / `efc8d54`|全画面|RedesignShell／RedesignFixture|portrait経路|旧imagePathのままの経路が残っていた|`characterArt(...,'portrait')` と顔クロップへ接続|390×844 Header撮影|通常本番データの顔クロップは同じ経路を使用|
|Header資源|同上|全画面|RedesignShell／RedesignFixture|`/ui/sengoku/13-coin.png`、`16-diamond.png`、`14-energy.png`|文字だけでミニアイコンなし|既存実画像を接続|Preview DOM／画面撮影|不足なし|
|カード背景|`src/theme/character-backgrounds.json` / 本コミット|編成・カード|PreparationModal|`/creative/backgrounds/*`|武将ごとの固定背景対応表なし|60武将→10背景をGit管理し、同一IDで固定解決|JSON件数60、カード画像|割当の個別デザイン再承認は不要の権限に基づく|
|カード枠|`public/creative/ui/frame-*.png` / `efc8d54`|編成・詳細|PreparationModal|`/creative/ui/frame-{N,R,SR,SSR}.png`|旧`getRarityFrameAsset`がGAME04経路に残存|`characterFrame`へ置換|QuestView／PreparationModalに旧呼出し0件|他ページの旧経路は別スコープ|
|属性|`public/creative/ui/element-*.png` / `efc8d54`|挑戦前・編成・詳細|ElementBadge|`/creative/ui/element-{fire..dark}.png`|大／小の二重表示|編成カードの小属性表示を除去し一箇所化|画面撮影|なし|
|ボス|`local-characters.json`／questMaster / `efc8d54`|挑戦前|QuestView EnemyArt|battle素材|カード枠と巨大Nが主役|ボスを枠なし大展示、レアリティを小文字補助表示|`03-challenge.png`|明智光秀battle素材1件は供給待ち|
|エリア状態|`COMMON_QUEST_CONSOLIDATED` / 指示SHA|エリア|QuestView|背景＋状態バッジ|本文だけで状態を表現|攻略中／解放済／未解放を旗・文字・鍵で表示|`01-area-list.png`|なし|
|ステージ名・装飾|`src/domain/redesign/data/quest65.json` / 最新実装|ステージ|QuestView|正式`stage.name`|designIdをユーザー名として再掲|正式名を主表示、designIdを補助表示、接続線追加|`02-stage-list.png`|正式名未定義一覧は0件|
|ヒント・報酬|`questMaster`／formal reward data|詳細|QuestView|既存報酬アイコン・名称・数量|独立Dialogを維持|`06-hint-detail.png`、`07-reward-detail*.png`|なし|
|出撃準備|`COMMON_QUEST_CONSOLIDATED` / 指示SHA|編成|PreparationModal|card素材＋frame＋background|カード名・HP・空白、CTA配置を要調整|名前14px、5人、SP400、編成変更／戻る／挑むを保持|`04-preparation.png`|SR/SSR演出は下記判断事項|
|キャラ詳細|同上|詳細|PreparationModal|portrait＋frame＋skill対応表|人物が小さく枠下部に偏る|詳細専用領域を拡大し能力・正式スキルを分離|`05-character-detail.png`|なし|
|Dialog／CTA／スクロール|`CanonicalDialog.tsx`、`scroll-policy.css` / 最新実装|全クエスト詳細|CanonicalDialog|中央Dialog／本文スクロール|既存挙動を壊さず維持|変更せず、往復・末尾到達を確認|capture script／Preview|なし|
|Menu／QA|`RedesignShell.tsx`、`RedesignFixture.tsx` / 最新実装|共通Header|Menu／QA|MENU→QA|通常画面にQA欄を追加しない|既存のMenu／QA導線を保持|agent-browser snapshot|なし|

## 実装判断・未完了

- 素材216件は前回確定済みのため再取得・再制作していない。
- 旧`getRarityFrameAsset`は他の既存GAME03／共通ページにも残るが、今回のGAME04クエスト表示経路からは除去した。共通ページ全体の置換は別スコープへ拡大していない。
- 正式スターター編成はNランク5人のため、クエスト固定PreviewではSR／SSRの実カード演出を同一画面で操作確認できない。`CreativeCharacter` と `presentationSettings` は存在するが、SR／SSRの実操作証拠は確認不能として残す。Masterや所持データを改変して演出確認はしない。
- 明智光秀のバトル画像は供給待ち。未使用SSRサンプルや全身画像への退避は行っていない。

## 保存証拠

固定Preview: https://game04-kak2m8gyv-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest  
配信SHA: `dpl_CNHt9GgsDKogABmUYPURkXdpDqFM`（Production昇格なし）。

390×844のエリア・ステージ・挑戦前・編成・キャラ詳細・ヒント・報酬・報酬末尾を再撮影し、同コミットの `comparison/` に保存する。agent-browserのnetworkidle／DOMスナップショット、Preview Build、実画像の目視を確認した。

Production公開、mainマージ、GAME03変更、Battle Rule／Balance／Master数値／Economy変更は行わない。
