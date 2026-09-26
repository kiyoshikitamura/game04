# QUEST_DEVICE_REVIEW_FIX 端末レビュー検証記録（2026-09-23）

## 基準

- 指示SHA: `336b4621292b8aa0b625d713b73ae5323ec12f2a`
- 実装基準: `a75d63373519fca91d6426dd097553055858ebd2`
- 対象: クエスト全体の375px / 390px表示、エリア一覧、ステージ一覧、挑戦、ヒント、報酬、出撃準備、武将詳細
- Production公開・mainマージ: 未実施

## 一括修正内容

1. エリア見出しの黒ベタを半透明グラデーション＋文字影へ変更。ステージ番号メダリオン、ステージ表示名、状態バッジを独立領域に分離し、行内の重なりと重複した`1-1`表示を除去。
2. 最終Waveのボスは表示専用の代表1体に限定。`level`降順、同値なら`stats.hp`降順、同値なら元配列順で選択し、戦闘配列はソート・変更しない。1-1は女侍（HP650）、1-3は直江兼続（Lv7）を選ぶ条件を満たす。
3. ボスを正式バトル素材の大表示＋背景上の情報オーバーレイへ変更。属性は正式画像バッジ1個、スキル0件は`スキル：無し`を表示。
4. `Wave 1〜...`の定型文をヒントから除去。ステージ名と攻略ヒントは別フィールドとして照合し、正本がない場合は`表示名未定義` / `正式な攻略ヒント未定義`を表示して創作しない。
5. 報酬表示を`キャラガチャ券` / `スキルガチャ券` / `装備ガチャ券`へ正規化。ID、数量、確率、正式付与データは変更していない。1-1の初回報酬は正式データ上`character / char_jihoon_01 / amount 1`で、ローカルマスター/APIの表示名は`前田利家`。魂への無断変換はしていない。
6. 編成カードは外側の追加矩形枠を除去し、正式カード枠内の人物を維持。属性・レアリティは人物上ではなくカード下部に正式画像で表示。Lv/HP、順番、合計SP400、編成変更を維持。
7. 武将詳細は人物を中央大表示し、下に名前、レアリティ画像、属性画像、Lvを配置。HPは統計リストのみ、スキルは個別ボックスで正式順・正式効果を維持。
8. レアリティ画像は`public/ui/rarity/rarity-badge-{n,r,sr,ssr}.png`（各256x160）を採用。CSS文字置換や旧GAME03素材は追加していない。

## 正本未定義・供給待ちの調査結果

`src/domain/redesign/data/quest65.json`、`questMaster.ts`、商品資料、既存監査資料を照合したが、ステージ名とdescriptionが全65件で同一であり、端末レビューが指摘したユーザー向け正式表示名／攻略ヒントを分離した正本は見つからなかった。したがって次の65ステージは未定義として表示し、モック由来の名称を承認済み扱いしていない。

`mikawa-1`, `mikawa-2`, `mikawa-3`, `owari-1`, `owari-2`, `owari-3`, `owari-4`, `mino-1`, `mino-2`, `mino-3`, `mino-4`, `mino-5`, `omi-1`, `omi-2`, `omi-3`, `omi-4`, `omi-5`, `kai-1`, `kai-2`, `kai-3`, `kai-4`, `kai-5`, `kai-6`, `echigo-1`, `echigo-2`, `echigo-3`, `echigo-4`, `echigo-5`, `echigo-6`, `kyoto-1`, `kyoto-2`, `kyoto-3`, `kyoto-4`, `kyoto-5`, `kyoto-6`, `kyoto-7`, `kyoto-8`, `izumo-1`, `izumo-2`, `izumo-3`, `izumo-4`, `izumo-5`, `izumo-6`, `izumo-7`, `izumo-8`, `satsuma-1`, `satsuma-2`, `satsuma-3`, `satsuma-4`, `satsuma-5`, `satsuma-6`, `satsuma-7`, `satsuma-8`, `satsuma-9`, `satsuma-10`, `sekigahara-1`, `sekigahara-2`, `sekigahara-3`, `sekigahara-4`, `sekigahara-5`, `sekigahara-6`, `sekigahara-7`, `sekigahara-8`, `sekigahara-9`, `sekigahara-10`

正式バトル素材が未提供の`char_miyabi_01`（明智光秀）は、既存のSSRサンプル画像に置換せず、供給待ちの再読み込み表示を維持した。

## 実画面証拠

- 390px: `device-review-after-01-area-390.png` ～ `device-review-after-06-detail-390.png`
- 375px: `device-review-after-07-detail-375.png`
- Before/After同幅比較: `quest-device-review-comparison-20260923.png`（左: 前回確定画面、右: 今回修正画面）

## 検証

- `npm run typecheck`: 成功
- `NEXT_PUBLIC_USE_MOCK_DB=true npm run build`: 成功
- 通常`npm run build`: `/auth/callback`でSupabase開発環境変数不足により停止。変更箇所のコンパイルとTypeScriptは成功しており、Previewでは開発用Mock DBを使用。
- agent-browserで`/qa/redesign?view=quest`を390px、375pxで実操作し、エリア→ステージ→挑戦→ヒント→報酬→出撃準備→詳細を確認。
- 画像・枠・属性バッジ・レアリティバッジ・ボス大写し・ダイアログCTAを比較画像に保存。

## Preview

- URL: https://game04-k8mlilbvf-kiyoshi-kitamura.vercel.app/qa/redesign?view=quest
- Deployment: `dpl_5cVJZEPYZisAyMHvmXcdYjfYAkup`
- Preview実画面でもエリア一覧と1-1挑戦ダイアログを再確認。
